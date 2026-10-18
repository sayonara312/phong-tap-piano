// Đọc file MIDI chuẩn (SMF 0/1), dựng mô hình bài: nốt theo tay, ô nhịp, tốc độ, pedal.
// Không phụ thuộc DOM, chạy được cả trong trình duyệt lẫn Node.

export function parseMidi(buf) {
  const d = new DataView(buf); let p = 0;
  const str = n => { let s = ""; for (let i = 0; i < n; i++) s += String.fromCharCode(d.getUint8(p + i)); p += n; return s; };
  const u32 = () => { const v = d.getUint32(p); p += 4; return v; };
  const u16 = () => { const v = d.getUint16(p); p += 2; return v; };
  const u8 = () => d.getUint8(p++);
  const vlq = () => { let v = 0, b; do { b = u8(); v = (v << 7) | (b & 0x7f); } while (b & 0x80); return v; };
  if (str(4) !== "MThd") throw new Error("Đây không phải file MIDI (.mid).");
  const hl = u32(); u16(); const nt = u16(); const div = u16(); p = 8 + hl;
  if (div & 0x8000) throw new Error("File MIDI dùng định dạng thời gian SMPTE, chưa hỗ trợ.");
  const tracks = [], tempos = [], ts = [], pedal = []; let key = null;
  for (let t = 0; t < nt && p + 8 <= d.byteLength; t++) {
    const id = str(4), len = u32(), end = Math.min(p + len, d.byteLength);
    if (id !== "MTrk") { p = end; continue; }
    let tick = 0, rs = 0, name = ""; const open = {}, notes = [];
    while (p < end) {
      tick += vlq();
      let st = d.getUint8(p);
      if (st & 0x80) p++; else st = rs;
      if (st === 0xFF) {
        const type = u8(), l = vlq();
        if (type === 0x51) tempos.push({ tick, uspq: (d.getUint8(p) << 16) | (d.getUint8(p + 1) << 8) | d.getUint8(p + 2) });
        else if (type === 0x58) ts.push({ tick, num: d.getUint8(p), den: 1 << d.getUint8(p + 1) });
        else if (type === 0x59 && !key) key = { sf: d.getInt8(p), mi: d.getUint8(p + 1) };
        else if (type === 0x03) { let s = ""; for (let i = 0; i < l; i++) s += String.fromCharCode(d.getUint8(p + i)); name = s; }
        p += l;
      } else if (st === 0xF0 || st === 0xF7) { p += vlq(); }
      else {
        rs = st; const hi = st & 0xF0, ch = st & 0x0F;
        const a = u8(); const b = (hi === 0xC0 || hi === 0xD0) ? 0 : u8();
        const k = ch * 128 + a;
        if (hi === 0x90 && b > 0) (open[k] || (open[k] = [])).push({ tick, vel: b });
        else if (hi === 0x80 || (hi === 0x90 && b === 0)) {
          const q = open[k]; if (q && q.length) { const o = q.shift(); notes.push({ tick: o.tick, dur: Math.max(1, tick - o.tick), m: a, vel: o.vel / 127 }); }
        } else if (hi === 0xB0 && a === 64) pedal.push({ tick, down: b >= 64 });
      }
    }
    p = end; tracks.push({ name, notes });
  }
  return { ppq: div, tracks, tempos, ts, pedal, key };
}

export const isCompound = br => br.den === 8 && br.num % 3 === 0 && br.num > 3;
export const beatsOf = br => isCompound(br) ? br.num / 3 : br.num;

export function buildSong(raw) {
  const ppq = raw.ppq;
  const tm = [];
  for (const t of raw.tempos.slice().sort((a, b) => a.tick - b.tick)) { if (tm.length && tm[tm.length - 1].tick === t.tick) tm[tm.length - 1] = t; else tm.push(t); }
  if (!tm.length || tm[0].tick > 0) tm.unshift({ tick: 0, uspq: 500000 });
  let sec = 0; tm.forEach((t, i) => { if (i) sec += (t.tick - tm[i - 1].tick) * tm[i - 1].uspq / 1e6 / ppq; t.sec = sec; });
  const tIdx = tick => { let i = tm.length - 1; while (i > 0 && tm[i].tick > tick) i--; return i; };
  const t2s = tick => { const t = tm[tIdx(tick)]; return t.sec + (tick - t.tick) * t.uspq / 1e6 / ppq; };
  const bpmAt = tick => 60e6 / tm[tIdx(tick)].uspq;

  const tr = raw.tracks.filter(t => t.notes.length);
  if (!tr.length) throw new Error("File không có nốt nhạc nào.");
  const notes = []; let handSplit;
  if (tr.length >= 2) {
    const means = tr.map(t => t.notes.reduce((s, n) => s + n.m, 0) / t.notes.length);
    const maxI = means.indexOf(Math.max(...means));
    tr.forEach((t, i) => { const hand = tr.length === 2 ? (i === maxI ? "R" : "L") : (means[i] >= 60 ? "R" : "L"); t.notes.forEach(n => notes.push({ ...n, hand })); });
    handSplit = "track";
  } else { tr[0].notes.forEach(n => notes.push({ ...n, hand: n.m >= 60 ? "R" : "L" })); handSplit = "pitch"; }
  notes.sort((a, b) => a.tick - b.tick || a.m - b.m);
  let lastTick = 0; for (const n of notes) lastTick = Math.max(lastTick, n.tick + n.dur);

  let ts = raw.ts.slice().sort((a, b) => a.tick - b.tick);
  ts = ts.filter((t, i) => !(ts[i + 1] && ts[i + 1].tick - t.tick < ppq));
  if (!ts.length) ts = [{ tick: 0, num: 4, den: 4 }];
  if (ts[0].tick < ppq) ts[0] = { ...ts[0], tick: 0 }; else ts.unshift({ tick: 0, num: 4, den: 4 });
  const bars = []; let tick = 0, ti = 0;
  while (tick < lastTick - 1 && bars.length < 3000) {
    while (ti + 1 < ts.length && ts[ti + 1].tick <= tick) ti++;
    const s = ts[ti]; const len = s.num * ppq * 4 / s.den;
    bars.push({ n: bars.length + 1, tick, len, num: s.num, den: s.den, sec: t2s(tick), dur: t2s(tick + len) - t2s(tick), bpm: bpmAt(tick) });
    tick += len;
  }
  const pint = []; let down = null; let pedalInferred = false;
  let pev = raw.pedal.slice().sort((a, b) => a.tick - b.tick);
  // Một số phần mềm (vd. MuseScore) chỉ ghi lệnh nhả pedal. Khi đó suy ra lệnh nhấn ngay sau lần nhả trước.
  if (pev.length && !pev.some(e => e.down)) {
    const ups = [...new Set(pev.map(e => e.tick))]; pev = []; let prev = null;
    for (const u of ups) {
      const bStart = (() => { let t = 0; for (const br of bars) { if (br.tick <= u) t = br.tick; else break; } return t; })();
      const start = prev != null && u - prev <= ppq * 8 ? prev + 1 : bStart;
      if (u > start) { pev.push({ tick: start, down: true }, { tick: u, down: false }); }
      prev = u;
    }
    pedalInferred = true;
  }
  for (const e of pev) {
    if (e.down && down === null) down = e.tick;
    else if (!e.down && down !== null) { pint.push([down, e.tick]); down = null; }
  }
  if (down !== null) pint.push([down, lastTick + ppq * 4]);
  return { ppq, notes, bars, t2s, bpmAt, pint, pedalInferred, key: raw.key, lastTick, handSplit, duration: t2s(lastTick) };
}

export function barIndexOf(song, tick) {
  let lo = 0, hi = song.bars.length - 1;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (song.bars[mid].tick <= tick) lo = mid; else hi = mid - 1; }
  return lo;
}

// Ghép các đoạn ô nhịp [[a,b], ...] thành một dòng thời gian để phát và vẽ.
export function selectSegs(song, segs) {
  const out = { notes: [], bars: [], beats: [], ped: [], total: 0, segs: [], ranges: [] }; let off = 0;
  for (const [a, b] of segs) {
    const A = Math.max(1, a), B = Math.min(song.bars.length, b); if (A > B) continue;
    const t0 = song.bars[A - 1].tick, t1 = song.bars[B - 1].tick + song.bars[B - 1].len;
    const s0 = song.t2s(t0), s1 = song.t2s(t1);
    const toS = t => off + song.t2s(t) - s0;
    for (let i = A; i <= B; i++) {
      const br = song.bars[i - 1]; out.bars.push({ t: toS(br.tick), n: i });
      const nb = beatsOf(br), bt = br.len / nb; for (let k = 0; k < nb; k++) out.beats.push({ t: toS(br.tick + k * bt), acc: k === 0 });
      const last = out.segs[out.segs.length - 1];
      const info = { t: toS(br.tick), a: i, bpm: br.bpm, cmp: isCompound(br), beats: nb, barDur: br.dur };
      if (!last || i === A || last.bpm !== info.bpm || last.cmp !== info.cmp) out.segs.push(info);
    }
    for (const n of song.notes) {
      if (n.tick < t0 || n.tick >= t1) continue;
      const offT = n.tick + n.dur; let aud = offT;
      const pi = song.pint.find(([x, y]) => x <= offT && offT < y);
      if (pi) aud = Math.min(pi[1], offT + song.ppq * 8);
      const bi = barIndexOf(song, n.tick), br = song.bars[bi];
      out.notes.push({ t: toS(n.tick), dv: song.t2s(offT) - song.t2s(n.tick), da: song.t2s(aud) - song.t2s(n.tick), m: n.m, hand: n.hand, vel: n.vel,
        bar: bi + 1, beat: (n.tick - br.tick) / (br.len / beatsOf(br)) + 1, cmp: isCompound(br), q: n.dur / song.ppq });
    }
    for (const [x, y] of song.pint) { if (y <= t0 || x >= t1) continue; out.ped.push([toS(Math.max(x, t0)), toS(Math.min(y, t1))]); }
    out.ranges.push({ a: A, b: B });
    off += s1 - s0;
  }
  out.notes.sort((a, b) => a.t - b.t || a.m - b.m);
  out.total = off; return out;
}

const DUR = [[6, "nốt tròn chấm"], [4, "nốt tròn"], [3, "nốt trắng chấm"], [2, "nốt trắng"], [1.5, "nốt đen chấm"], [1, "nốt đen"], [0.75, "móc đơn chấm"], [0.5, "móc đơn"], [0.25, "móc kép"], [0.125, "móc ba"]];
export function durName(q) {
  let best = null, bd = 1;
  for (const [v, n] of DUR) { const r = Math.abs(q - v) / v; if (r < bd) { bd = r; best = n; } }
  return bd <= 0.16 ? best : String(Math.round(q * 100) / 100).replace(".", ",") + " phách";
}
export function beatName(b, cmp) {
  const whole = Math.floor(b + 1e-6), fr = b - whole;
  if (fr < 0.05) return "phách " + whole;
  if (cmp) { const k = Math.round(fr * 3); if (Math.abs(fr * 3 - k) < 0.1) return "phách " + whole + ", nốt " + (k + 1) + "/3 của nhóm"; }
  else if (Math.abs(fr - 0.5) < 0.05) return "phách " + whole + " và";
  return "phách " + String(Math.round(b * 100) / 100).replace(".", ",");
}
export const meterLabel = br => br.num + "/" + br.den;

// Dấu vân tay đơn giản để nhận ra một file đã có giáo án soạn sẵn.
export function fingerprint(song) {
  let h = 0; for (const n of song.notes) h = (h * 31 + n.m * 7 + (n.tick % 997)) >>> 0;
  return song.bars.length + "-" + song.notes.length + "-" + h.toString(36);
}

export function bytesToB64(buf) { const u = new Uint8Array(buf); let s = ""; for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); }
export function b64ToBuf(b64) { const s = atob(b64); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u.buffer; }
