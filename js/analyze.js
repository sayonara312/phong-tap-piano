// Phân tích bài từ mô hình MIDI: giọng, nhịp, tốc độ, đặc điểm kỹ thuật từng ô,
// độ khó, chia câu/đoạn, nhận ra đoạn nhắc lại. Không phụ thuộc DOM.
import { isCompound, beatsOf, meterLabel } from "./midi.js";
import { keyInfo, pc } from "./util.js";

const KK_MAJ = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const KK_MIN = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
function corr(a, b) { const ma = a.reduce((s, x) => s + x, 0) / 12, mb = b.reduce((s, x) => s + x, 0) / 12; let n = 0, da = 0, db = 0; for (let i = 0; i < 12; i++) { n += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; } return n / Math.sqrt(da * db || 1); }
const SF_OF_MAJOR = { 0: 0, 7: 1, 2: 2, 9: 3, 4: 4, 11: 5, 6: -6, 1: -5, 8: -4, 3: -3, 10: -2, 5: -1 };

export function detectKey(song) {
  if (song.key && Math.abs(song.key.sf) <= 7) return { ...keyInfo(song.key.sf, song.key.mi === 1), detected: false };
  const hist = new Array(12).fill(0);
  for (const n of song.notes) hist[pc(n.m)] += n.dur;
  let best = { r: -2 };
  for (let t = 0; t < 12; t++) {
    const rot = p => hist.map((_, i) => p[pc(i - t)]);
    const rM = corr(hist, rot(KK_MAJ)), rm = corr(hist, rot(KK_MIN));
    if (rM > best.r) best = { r: rM, tonic: t, minor: false };
    if (rm > best.r) best = { r: rm, tonic: t, minor: true };
  }
  const majTonic = best.minor ? pc(best.tonic + 3) : best.tonic;
  return { ...keyInfo(SF_OF_MAJOR[majTonic], best.minor), detected: true };
}

function handFeatures(ns, br, ppq) {
  const f = { n: ns.length, onsets: 0, maxChord: 0, lo: 127, hi: 0, leap: 0, minQ: 99, octave: false, short: 0, repChord: 0, dotted: false };
  if (!ns.length) return f;
  const groups = [];
  for (const n of ns) { const g = groups[groups.length - 1]; if (g && n.tick - g.tick < ppq / 16) g.ms.push(n.m); else groups.push({ tick: n.tick, ms: [n.m] }); f.lo = Math.min(f.lo, n.m); f.hi = Math.max(f.hi, n.m); const q = n.dur / ppq; f.minQ = Math.min(f.minQ, q); if (q < 0.2) f.short++; if ([0.75, 1.5, 3].some(v => Math.abs(q - v) / v < 0.08)) f.dotted = true; }
  f.onsets = groups.length;
  let rep = 0, prevKey = "";
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i]; g.ms.sort((a, b) => a - b);
    f.maxChord = Math.max(f.maxChord, g.ms.length);
    if (g.ms.length >= 2 && g.ms.some(a => g.ms.includes(a + 12))) f.octave = true;
    const key = g.ms.join(","); if (g.ms.length >= 3 && key === prevKey) rep++; prevKey = key;
    if (i) { const a = groups[i - 1].ms, b = g.ms; f.leap = Math.max(f.leap, Math.abs(b[0] - a[0]), Math.abs(b[b.length - 1] - a[a.length - 1])); }
  }
  f.repChord = rep;
  return f;
}

function barDifficulty(R, L, br) {
  const rate = (R.onsets + L.onsets) / Math.max(0.5, br.dur);
  let s = 0.6 * rate + 0.5 * Math.max(R.maxChord - 1, 0) + 0.4 * Math.max(L.maxChord - 1, 0) + 0.04 * L.leap + 0.03 * R.leap;
  if (R.short + L.short > 2) s += 1;
  if (R.repChord + L.repChord >= 3) s += 0.8;
  return Math.max(1, Math.min(5, 1 + s / 2.2));
}
function handDifficulty(F, br) {
  const rate = F.onsets / Math.max(0.5, br.dur);
  const s = 0.9 * rate + 0.6 * Math.max(F.maxChord - 1, 0) + 0.05 * F.leap + (F.short > 2 ? 1 : 0);
  return F.n ? Math.max(1, Math.min(5, 1 + s / 2.2)) : 0;
}

// Giai điệu (nốt cao nhất mỗi nhịp phách của tay phải) để so sánh các câu.
function melodySig(song, a, b) {
  const set = new Set();
  for (let i = a; i <= b; i++) {
    const br = song.bars[i - 1]; const step = br.len / (beatsOf(br) * 2);
    const top = {};
    for (const n of song.notes) { if (n.hand !== "R" || n.tick < br.tick || n.tick >= br.tick + br.len) continue; const k = Math.round((n.tick - br.tick) / step); top[k] = Math.max(top[k] ?? 0, n.m); }
    for (const k in top) set.add((i - a) + ":" + k + ":" + pc(top[k]));
  }
  return set;
}
const jaccard = (A, B) => { let i = 0; for (const x of A) if (B.has(x)) i++; return i / (A.size + B.size - i || 1); };

export function analyze(song) {
  const key = detectKey(song);
  const inKey = new Set(key.scale); if (key.minor) inKey.add(pc(key.tonic + 11));
  const bars = song.bars.map(br => {
    const ns = song.notes.filter(n => n.tick >= br.tick && n.tick < br.tick + br.len);
    const R = handFeatures(ns.filter(n => n.hand === "R"), br, song.ppq), L = handFeatures(ns.filter(n => n.hand === "L"), br, song.ppq);
    const out = ns.filter(n => !inKey.has(pc(n.m))).length;
    const pedal = song.pint.some(([x, y]) => x < br.tick + br.len && y > br.tick);
    const diff = barDifficulty(R, L, br);
    return { n: br.n, meter: meterLabel(br), cmp: isCompound(br), bpm: br.bpm, dur: br.dur, R, L, outKey: out, pedal, diff, dR: handDifficulty(R, br), dL: handDifficulty(L, br),
      lRunning: L.onsets >= beatsOf(br) * 2 && L.maxChord <= 2, rChords: R.maxChord >= 3, empty: !ns.length };
  });

  // Đoạn lớn: cắt ở chỗ đổi nhịp hoặc đổi tốc độ rõ rệt (> 3%).
  const sections = [];
  for (const b of bars) {
    const s = sections[sections.length - 1];
    if (!s || s.meter !== b.meter || Math.abs(s.bpm - b.bpm) / s.bpm > 0.03) sections.push({ a: b.n, b: b.n, meter: b.meter, cmp: b.cmp, bpm: b.bpm });
    else s.b = b.n;
  }
  // Câu: mỗi đoạn chia thành câu khoảng 8 ô (đoạn ngắn giữ nguyên, phần dư < 4 ô gộp vào câu trước).
  const phrases = [];
  for (const s of sections) {
    const len = s.b - s.a + 1; const size = len <= 11 ? len : 8;
    for (let a = s.a; a <= s.b; a += size) {
      let b = Math.min(s.b, a + size - 1);
      if (s.b - b > 0 && s.b - b < 4) b = s.b;
      phrases.push({ a, b, meter: s.meter, cmp: s.cmp, bpm: s.bpm });
      if (b === s.b) break;
    }
  }
  // Đặt tên câu theo chất liệu: câu giống câu trước (giai điệu) thì dùng lại chữ cái với dấu phẩy.
  const letters = "ABCDEFGHIJKLMNOP"; let next = 0;
  phrases.forEach((p, i) => {
    const bs = bars.slice(p.a - 1, p.b);
    p.diff = bs.reduce((s, b) => s + b.diff, 0) / bs.length;
    p.maxDiff = Math.max(...bs.map(b => b.diff));
    p.dR = bs.reduce((s, b) => s + b.dR, 0) / bs.length; p.dL = bs.reduce((s, b) => s + b.dL, 0) / bs.length;
    p.dur = bs.reduce((s, b) => s + b.dur, 0);
    p.sig = melodySig(song, p.a, p.b);
    let best = -1, bestSim = 0;
    for (let j = 0; j < i; j++) { const sim = jaccard(p.sig, phrases[j].sig); if (sim > bestSim) { bestSim = sim; best = j; } }
    if (bestSim >= 0.45) { const base = phrases[best].base; const cnt = phrases.filter(q => q.base === base).length; p.base = base; p.label = base + (cnt + 1); p.repeatOf = best; p.sim = bestSim; }
    else { p.base = letters[next++ % letters.length]; p.label = p.base; p.repeatOf = null; }
    p.isLast = i === phrases.length - 1;
    p.features = phraseFeatures(bs);
  });
  phrases.forEach(p => delete p.sig);
  if (phrases.length > 1) phrases[phrases.length - 1].role = "kết";
  phrases[0].role = "mở đầu";

  // Lần đầu xuất hiện của từng kiến thức trong bài (dùng để dạy đúng lúc).
  const firstOf = {};
  const mark = (k, n) => { if (!(k in firstOf)) firstOf[k] = n; };
  for (const b of bars) {
    if (b.L.n && b.L.lo < 60) mark("bass", b.n);
    if (b.R.hi > 81 || b.L.hi > 81) mark("ledgerHigh", b.n);
    if (b.cmp) mark("compound", b.n);
    if (b.outKey) mark("accidentals", b.n);
    if (b.R.maxChord >= 3 || b.L.maxChord >= 3) mark("chords", b.n);
    if (b.R.octave || b.L.octave) mark("octave", b.n);
    if (!b.cmp && (b.R.dotted || b.L.dotted)) mark("dotted", b.n);
    if (b.R.leap >= 15 || b.L.leap >= 15) mark("leaps", b.n);
    if (b.lRunning) mark("running", b.n);
    if (b.R.repChord + b.L.repChord >= 3) mark("repChords", b.n);
    if (b.R.short + b.L.short > 2) mark("ornaments", b.n);
    if (b.pedal) mark("pedal", b.n);
    if (b.R.maxChord >= 2 && b.R.n > b.R.onsets) mark("voicing", b.n);
  }
  for (let i = 1; i < sections.length; i++) { if (sections[i].meter !== sections[i - 1].meter) mark("meterChange", sections[i].a); }
  const meters = [...new Set(sections.map(s => s.meter))];
  return { key, bars, sections, phrases, firstOf, meters, duration: song.duration, barCount: bars.length,
    handSplit: song.handSplit, lRange: [Math.min(...bars.map(b => b.L.lo)), Math.max(...bars.map(b => b.L.hi))], rRange: [Math.min(...bars.map(b => b.R.lo)), Math.max(...bars.map(b => b.R.hi))] };
}

function phraseFeatures(bs) {
  const f = new Set();
  for (const b of bs) {
    if (b.rChords) f.add("chords"); if (b.R.octave || b.L.octave) f.add("octave"); if (b.R.leap >= 15 || b.L.leap >= 15) f.add("leaps");
    if (b.lRunning) f.add("running"); if (b.R.repChord + b.L.repChord >= 3) f.add("repChords"); if (b.R.short + b.L.short > 2) f.add("ornaments");
    if (b.outKey) f.add("accidentals"); if (b.cmp) f.add("compound"); if (b.L.maxChord >= 3) f.add("lhChords"); if (b.R.onsets >= beatsOf({ num: 4, den: 4 }) * 2 && b.R.maxChord <= 1) f.add("rhRun");
    if (b.R.maxChord >= 2 && b.R.n > b.R.onsets) f.add("voicing");
    if (b.L.minQ >= 2 || b.R.minQ >= 2) f.add("longNotes");
  }
  return [...f];
}

export const DIFF_LABEL = d => d < 1.8 ? "dễ" : d < 2.6 ? "vừa" : d < 3.4 ? "khá khó" : d < 4.2 ? "khó" : "rất khó";
