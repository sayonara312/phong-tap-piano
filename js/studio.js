// "Đàn hướng dẫn": khung nốt rơi + bàn phím cho đoạn bài, và các công cụ nhạc lý
// (đọc nốt khóa Sol/Fa có hóa biểu, gam của bài, hợp âm và quãng, tìm nốt).
import { h, store, nm, isBlack, fmtNum, NAMES, setNameMode, pc } from "./util.js";
import { AU, ensureAudio, playNote, stopSound, click, nowA } from "./audio.js";
import { Keyboard, rangeFor } from "./keyboard.js";
import { selectSegs, durName, beatName } from "./midi.js";

const ST = { L: null, ti: 0, cleanup: null, redraw: null };
let CTX = { song: null, key: null };
let PAL = {};
function readPal() {
  const cs = getComputedStyle(document.documentElement);
  for (const k of ["rh", "lh", "roll", "roll-line", "muted", "ink", "accent", "line"]) PAL[k] = cs.getPropertyValue("--" + k).trim();
}
export function studioRedraw() { readPal(); ST.redraw && ST.redraw(); }
export function teardownStudio() { if (ST.cleanup) { try { ST.cleanup(); } catch {} } ST.cleanup = null; ST.redraw = null; stopSound(); }

export function renderStudio(L, ctx) {
  CTX = ctx; ST.L = L; ST.ti = 0;
  const wrap = h("div", { class: "studio" });
  const tabs = h("div", { class: "tabs", role: "tablist" });
  const body = h("div", { class: "studio-body" });
  L.tools.forEach((t, i) => tabs.append(h("button", { class: "tab", role: "tab", "aria-selected": i === 0 ? "true" : "false", onclick: () => { [...tabs.children].forEach((b, j) => b.setAttribute("aria-selected", j === i ? "true" : "false")); openTool(i, body); } }, t.label)));
  wrap.append(tabs, body);
  if (L.tools.length) setTimeout(() => openTool(0, body), 0); else body.append(h("p", { class: "status" }, "Buổi này không cần dụng cụ trên trang."));
  return wrap;
}
function openTool(i, body) {
  teardownStudio(); ST.ti = i; body.innerHTML = "";
  const t = ST.L.tools[i]; readPal();
  const fn = { song: toolSong, clef: toolClef, scale: toolScale, chords: toolChords, notes: toolNotes }[t.type];
  if (fn) fn(t, body);
}
function instrument(withCanvas) {
  // Khung nốt rơi cuộn ngang cùng bàn phím; khuông nhạc thì đứng yên phía trên để luôn nhìn thấy trên điện thoại.
  const inner = h("div", { class: "inner" });
  const keys = h("div", { class: "keys" });
  if (withCanvas) { const top = h("canvas", { class: "roll" }); inner.append(top, keys); return { el: h("div", { class: "instrument" }, inner), top, keys, inner }; }
  const top = h("div", { class: "staff" }); inner.append(keys);
  return { el: h("div", { class: "instrument-wrap" }, top, h("div", { class: "instrument" }, inner)), top, keys, inner };
}
function nameSeg(onChange) {
  const opts = [["sol", "Đô Rê Mi"], ["let", "C D E"], ["off", "Ẩn tên"]];
  const seg = h("div", { class: "seg", role: "group", "aria-label": "Tên nốt" });
  opts.forEach(([v, lbl]) => seg.append(h("button", { "aria-pressed": NAMES.mode === v ? "true" : "false", onclick: e => {
    setNameMode(v); [...seg.children].forEach(b => b.setAttribute("aria-pressed", b === e.currentTarget ? "true" : "false")); onChange();
  } }, lbl)));
  return seg;
}

/* ---- khuông nhạc ---- */
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
const dia = (letter, oct) => oct * 7 + letter;
const FLAT_LETTERS = [6, 2, 5, 1, 4, 0, 3], SHARP_LETTERS = [3, 0, 4, 1, 5, 2, 6];
const TREBLE_FLATS = [34, 37, 33, 36, 32, 35, 31], TREBLE_SHARPS = [38, 35, 39, 36, 33, 37, 34];
function keyLetters(sf) { return sf < 0 ? FLAT_LETTERS.slice(0, -sf) : SHARP_LETTERS.slice(0, sf); }
function midiOf(d, sf) { const letter = d % 7, oct = Math.floor(d / 7); let m = (oct + 1) * 12 + LETTER_PC[letter]; if (keyLetters(sf).includes(letter)) m += sf < 0 ? -1 : 1; return m; }
const STAFF = { treble: { bottom: dia(2, 4), shift: 0 }, bass: { bottom: dia(4, 2), shift: -14 } };
function staffSVG(clef, d, sf) {
  const NS = "http://www.w3.org/2000/svg"; const W = 290, H = 170, bot = 112;
  const svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.setAttribute("width", W); svg.setAttribute("height", H);
  svg.setAttribute("role", "img"); svg.setAttribute("aria-label", "Khuông nhạc khóa " + (clef === "treble" ? "Sol" : "Fa"));
  const el = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); svg.append(e); return e; };
  const base = STAFF[clef].bottom; const Y = dd => bot - (dd - base) * 6;
  for (let i = 0; i < 5; i++) el("line", { x1: 10, x2: W - 10, y1: bot - i * 12, y2: bot - i * 12, stroke: "currentColor", "stroke-width": 1.2 });
  const tx = el("text", { x: 14, y: clef === "treble" ? bot + 9 : bot - 13, "font-size": clef === "treble" ? 76 : 46, fill: "currentColor", "font-family": "Noto Music, Segoe UI Symbol, serif" });
  tx.textContent = clef === "treble" ? "𝄞" : "𝄢";
  const n = Math.abs(sf || 0); const pos = (sf < 0 ? TREBLE_FLATS : TREBLE_SHARPS).slice(0, n).map(x => x + STAFF[clef].shift);
  pos.forEach((fd, i) => { const t = el("text", { x: 64 + i * 10, y: Y(fd) + 5, "font-size": 22, fill: "currentColor", "font-family": "Noto Music, Segoe UI Symbol, serif" }); t.textContent = sf < 0 ? "♭" : "♯"; });
  const nx = Math.max(196, 80 + n * 10 + 40);
  if (d != null) {
    const top = base + 8;
    for (let l = base - 2; l >= d; l -= 2) el("line", { x1: nx - 15, x2: nx + 15, y1: Y(l), y2: Y(l), stroke: "currentColor", "stroke-width": 1.2 });
    for (let l = top + 2; l <= d; l += 2) el("line", { x1: nx - 15, x2: nx + 15, y1: Y(l), y2: Y(l), stroke: "currentColor", "stroke-width": 1.2 });
    el("ellipse", { cx: nx, cy: Y(d), rx: 8.5, ry: 6, transform: "rotate(-20 " + nx + " " + Y(d) + ")", fill: "currentColor" });
    const up = d < base + 4; el("line", { x1: up ? nx + 7.6 : nx - 7.6, x2: up ? nx + 7.6 : nx - 7.6, y1: Y(d), y2: Y(d) + (up ? -40 : 40), stroke: "currentColor", "stroke-width": 1.4 });
  }
  return svg;
}

/* ---- trắc nghiệm có 10 câu, dùng chung ---- */
function quizRunner({ kb, prompt, fb, score, startBtn, next, judge, passText, passFn }) {
  const Q = { i: 0, score: 0, run: false, t: 0, times: [], miss: [], lock: false };
  function ask() { kb.mark({}); if (Q.i >= 10) return finish(); next(Q); Q.t = performance.now(); Q.lock = false; }
  function finish() {
    Q.run = false; startBtn.textContent = "Làm lại 10 câu";
    const avg = Q.times.reduce((a, b) => a + b, 0) / Math.max(1, Q.times.length);
    const ok = passFn(Q.score, avg);
    prompt.textContent = (ok ? "Đạt: " : "Chưa đạt: ") + Q.score + "/10, trung bình " + fmtNum(avg.toFixed(1)) + " giây";
    fb.textContent = (Q.miss.length ? "Hay nhầm: " + [...new Set(Q.miss)].join(", ") + ". " : "") + passText;
  }
  startBtn.addEventListener("click", () => { ensureAudio(); Object.assign(Q, { i: 0, score: 0, run: true, times: [], miss: [] }); score.textContent = "0/10"; startBtn.textContent = "Bắt đầu lại"; ask(); });
  return m => {
    if (!Q.run || Q.lock) return; Q.lock = true;
    const dt = (performance.now() - Q.t) / 1000; Q.times.push(dt);
    const r = judge(m, dt); if (r.ok) Q.score++; else Q.miss.push(r.target);
    Q.i++; score.textContent = Q.score + "/10"; setTimeout(ask, 850);
  };
}

/* ---- đọc nốt khóa Sol / Fa ---- */
function toolClef(tool, body) {
  const sf = tool.keysig === false ? 0 : (CTX.key?.sf || 0);
  const pools = { bass: [], treble: [] };
  for (let d = dia(2, 2); d <= dia(0, 4); d++) pools.bass.push(d);
  for (let d = dia(0, 4); d <= dia(5, 5); d++) pools.treble.push(d);
  const ins = instrument(false); let onPress = () => {};
  const kb = new Keyboard(ins.keys, m => onPress(m));
  kb.build(...(tool.clef === "bass" ? [36, 71] : tool.clef === "treble" ? [48, 83] : [36, 83]));
  ins.inner.style.minWidth = (tool.clef === "mixed" ? 640 : 520) + "px";
  const prompt = h("div", { class: "big" }, "Nốt này là phím nào?");
  const fb = h("div", { class: "status" }, "Bấm “Bắt đầu 10 câu”. Gọi tên nốt thành tiếng rồi bấm đúng phím.");
  const score = h("span", { class: "chip num" }, "0/10");
  const startBtn = h("button", { class: "btn primary" }, "Bắt đầu 10 câu");
  const ksCb = h("input", { type: "checkbox", id: "ksCb", checked: !!tool.keysig && sf !== 0 });
  let clefNow = tool.clef === "mixed" ? "treble" : tool.clef, cur = null;
  const ksOn = () => ksCb.checked ? sf : 0;
  const drawStaff = d => ins.top.replaceChildren(staffSVG(clefNow, d, ksOn()));
  ksCb.addEventListener("change", () => drawStaff(cur ? cur.d : null));
  body.append(h("div", { class: "quiz" }, startBtn, score, sf ? h("label", { for: "ksCb", class: "inline" }, ksCb, "Có hóa biểu của bài") : null, nameSeg(() => kb.relabel())), prompt, ins.el, fb);
  drawStaff(null);
  onPress = quizRunner({ kb, prompt, fb, score, startBtn,
    next: Q => { clefNow = tool.clef === "mixed" ? (Math.random() < 0.5 ? "treble" : "bass") : tool.clef; const pool = pools[clefNow]; let d; do { d = pool[Math.floor(Math.random() * pool.length)]; } while (cur && d === cur.d); cur = { d, m: midiOf(d, ksOn()) }; drawStaff(d); prompt.textContent = "Câu " + (Q.i + 1) + "/10 · khóa " + (clefNow === "treble" ? "Sol" : "Fa"); },
    judge: (m, dt) => { const tgt = cur.m, exact = m === tgt, same = pc(m - tgt) === 0; const map = { [tgt]: "k-ok" }; if (!exact) map[m] = same ? "k-mark" : "k-bad"; kb.mark(map);
      fb.textContent = exact ? "Đúng: " + nm(tgt) + " · " + fmtNum(dt.toFixed(1)) + " giây" : same ? "Đúng tên, khác quãng 8. Nốt viết là " + nm(tgt) + "." : "Chưa đúng. Đó là " + nm(tgt) + ", bạn bấm " + nm(m) + ".";
      return { ok: same, target: nm(tgt) }; },
    passText: "Tiêu chí: ≥ 8/10 và ≤ 3 giây mỗi nốt.", passFn: (s, avg) => s >= 8 && avg <= 3 });
}

/* ---- tìm nốt (bàn phím) ---- */
function toolNotes(tool, body) {
  const ins = instrument(false); let onPress = () => {};
  const kb = new Keyboard(ins.keys, m => onPress(m)); kb.build(48, 83);
  ins.top.replaceChildren(h("div", { class: "staff-note" }, "Phím trắng ngay bên trái nhóm 2 phím đen là Đô. Chấm nhỏ đánh dấu Đô giữa."));
  const prompt = h("div", { class: "big" }, "Tìm nốt trên bàn phím");
  const fb = h("div", { class: "status" }, "Bấm “Bắt đầu 10 câu”, rồi bấm phím có tên được hỏi (quãng 8 nào cũng được).");
  const score = h("span", { class: "chip num" }, "0/10"); const startBtn = h("button", { class: "btn primary" }, "Bắt đầu 10 câu");
  body.append(h("div", { class: "quiz" }, startBtn, score, nameSeg(() => kb.relabel())), prompt, ins.el, fb);
  let tgt = null;
  onPress = quizRunner({ kb, prompt, fb, score, startBtn,
    next: Q => { let p; do { p = [0, 2, 4, 5, 7, 9, 11][Math.floor(Math.random() * 7)]; } while (p === tgt); tgt = p; prompt.textContent = "Câu " + (Q.i + 1) + "/10 · Bấm: " + nm(60 + p, false, 0); },
    judge: (m, dt) => { const ok = pc(m) === tgt; const map = { [m]: ok ? "k-ok" : "k-bad" }; if (!ok) for (let x = 48; x <= 83; x++) if (pc(x) === tgt) map[x] = "k-ok"; kb.mark(map); fb.textContent = (ok ? "Đúng · " : "Chưa đúng · ") + fmtNum(dt.toFixed(1)) + " giây"; return { ok, target: nm(60 + tgt, false, 0) }; },
    passText: "Tiêu chí: ≥ 9/10 và ≤ 3 giây.", passFn: (s, avg) => s >= 9 && avg <= 3 });
}

/* ---- gam của bài ---- */
function scaleMidis() { const k = CTX.key; const root = 60 + k.tonic - (k.tonic > 6 ? 12 : 0); const iv = k.minor ? [0, 2, 3, 5, 7, 8, 10, 12] : [0, 2, 4, 5, 7, 9, 11, 12]; return iv.map(x => root + x); }
function toolScale(tool, body) {
  const k = CTX.key; const SC = scaleMidis();
  const ins = instrument(false); let onPress = () => {};
  const kb = new Keyboard(ins.keys, m => onPress(m)); kb.build(48, 83);
  const box = h("div", { class: "staff-pair" }, staffSVG("treble", null, k.sf), staffSVG("bass", null, k.sf)); ins.top.replaceChildren(box);
  const prompt = h("div", { class: "big" }, "Gam " + k.name + ": " + SC.map(m => nm(m, false)).join(" "));
  const fb = h("div", { class: "status" }, k.accNames.length ? "Hóa biểu của bài: " + k.accNames.map(x => x + k.accSymbol).join(", ") + "." : "Bài không có dấu hóa ở hóa biểu.");
  const listen = h("button", { class: "btn" }, "♪ Nghe gam"); const startBtn = h("button", { class: "btn primary" }, "Tìm nốt trong gam: 10 câu"); const score = h("span", { class: "chip num" }, "0/10");
  body.append(h("div", { class: "quiz" }, listen, startBtn, score, nameSeg(() => kb.relabel())), prompt, ins.el, fb);
  let timers = [];
  listen.addEventListener("click", async () => {
    timers.forEach(clearTimeout); timers = []; await ensureAudio(); const t0 = nowA() + 0.05, step = 0.45;
    [...SC, ...SC.slice(0, -1).reverse()].forEach((m, i) => { playNote(m, t0 + i * step, step * 0.95, 0.7); timers.push(setTimeout(() => kb.mark({ [m]: "k-R" }), (i * step + 0.05) * 1000)); });
    timers.push(setTimeout(() => { const mp = {}; SC.forEach(m => mp[m] = "k-mark"); kb.mark(mp); }, (15 * step + 0.4) * 1000));
  });
  let tgt = null;
  onPress = quizRunner({ kb, prompt, fb, score, startBtn,
    next: Q => { timers.forEach(clearTimeout); let p; do { p = pc(SC[Math.floor(Math.random() * 7)]); } while (p === tgt); tgt = p; prompt.textContent = "Câu " + (Q.i + 1) + "/10 · Bấm: " + nm(60 + p, false); },
    judge: (m, dt) => { const ok = pc(m) === tgt; const map = { [m]: ok ? "k-ok" : "k-bad" }; if (!ok) for (let x = 48; x <= 83; x++) if (pc(x) === tgt) map[x] = "k-ok"; kb.mark(map); fb.textContent = (ok ? "Đúng · " : "Chưa đúng · ") + fmtNum(dt.toFixed(1)) + " giây"; return { ok, target: nm(60 + tgt, false) }; },
    passText: "Tiêu chí: ≥ 9/10 và ≤ 3 giây.", passFn: (s, avg) => s >= 9 && avg <= 3 });
  ST.cleanup = () => timers.forEach(clearTimeout);
}

/* ---- hợp âm & quãng ---- */
const INTERVAL = ["đồng âm", "quãng 2 thứ", "quãng 2 trưởng", "quãng 3 thứ", "quãng 3 trưởng", "quãng 4 đúng", "quãng 4 tăng (5 giảm)", "quãng 5 đúng", "quãng 6 thứ", "quãng 6 trưởng", "quãng 7 thứ", "quãng 7 trưởng", "quãng 8 đúng"];
const ivName = s => s <= 12 ? INTERVAL[s] : (s === 24 ? "2 quãng 8" : "quãng 8 + " + INTERVAL[s - 12]);
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];
function triads() {
  const SC = scaleMidis().slice(0, 7); const ext = [...SC, ...SC.map(x => x + 12)];
  return SC.map((r, i) => { const ms = [ext[i], ext[i + 2], ext[i + 4]]; const a = ms[1] - ms[0], b = ms[2] - ms[1];
    const q = a === 4 && b === 3 ? "trưởng" : a === 3 && b === 4 ? "thứ" : a === 3 && b === 3 ? "giảm" : "tăng";
    const rn = q === "trưởng" || q === "tăng" ? ROMAN[i] : ROMAN[i].toLowerCase(); return { rn: rn + (q === "giảm" ? "°" : ""), name: nm(r, false) + " " + q, ms }; });
}
function toolChords(tool, body) {
  const ins = instrument(false); const kb = new Keyboard(ins.keys, onPress); kb.build(48, 83);
  let measure = !!tool.interval, first = null;
  const info = h("div", { class: "big" }, measure ? "Đo quãng: bấm 2 phím" : "Chọn một hợp âm");
  const detail = h("div", { class: "status" });
  const btns = h("div", { class: "chordbtns" }, triads().map(t => h("button", { class: "btn", onclick: () => showChord(t) }, t.rn + " · " + t.name)));
  const mCb = h("input", { type: "checkbox", id: "measCb", checked: measure, onchange: e => { measure = e.target.checked; first = null; kb.mark({}); info.textContent = measure ? "Đo quãng: bấm 2 phím" : "Chọn một hợp âm"; detail.textContent = ""; } });
  ins.top.replaceChildren(h("div", { class: "staff-note" }, "7 hợp âm 3 nốt của giọng " + CTX.key.name + ". Bấm một hợp âm để nghe rải rồi bấm cùng lúc. Bật “Đo quãng” rồi bấm 2 phím để biết khoảng cách."));
  body.append(h("div", { class: "quiz" }, h("label", { for: "measCb", class: "inline" }, mCb, "Đo quãng"), nameSeg(() => kb.relabel())), btns, info, ins.el, detail);
  async function showChord(t) {
    measure = false; mCb.checked = false; first = null; const ms = t.ms; const mp = {}; ms.forEach(m => mp[m] = "k-L"); kb.mark(mp);
    info.textContent = t.rn + " · " + t.name + ": " + ms.map(m => nm(m, false)).join(" – ");
    detail.textContent = [[0, 1], [1, 2], [0, 2]].map(([i, j]) => nm(ms[i], false) + " → " + nm(ms[j], false) + ": " + ivName(ms[j] - ms[i]) + " (" + (ms[j] - ms[i]) + " nửa cung)").join(" · ");
    await ensureAudio(); const t0 = nowA() + 0.03; ms.forEach((m, i) => playNote(m, t0 + i * 0.35, 0.4, 0.7)); ms.forEach(m => playNote(m, t0 + 1.2, 1.4, 0.7));
  }
  function onPress(m) {
    if (!measure) return;
    if (first == null) { first = m; kb.mark({ [m]: "k-R" }); info.textContent = "Nốt 1: " + nm(m) + ". Bấm nốt thứ 2"; return; }
    const a = Math.min(first, m), b = Math.max(first, m), s = b - a; kb.mark({ [a]: "k-R", [b]: "k-R" });
    info.textContent = nm(a) + " → " + nm(b) + ": " + ivName(s); detail.textContent = s + " nửa cung" + (s === 12 ? ". Cùng tên nốt: quãng 8." : ""); first = null;
  }
}

/* ---- đoạn bài: nghe & xem / từng bước ---- */
function toolSong(tool, body) {
  if (!CTX.song) { body.append(h("p", { class: "status err" }, "Chưa có file MIDI cho bài này.")); return; }
  const song = CTX.song;
  const segs = tool.segs.map(([a, b]) => [Math.min(a, song.bars.length), Math.min(b, song.bars.length)]);
  const sel = selectSegs(song, segs);
  const S = { mode: tool.mode || "play", hand: tool.hand || "B", other: !!tool.other, rate: store.get("ptp-rate", 0.5), metro: true, countIn: true, loop: true,
    playing: false, t0: 0, idx: 0, pos: 0, iv: null, raf: 0, events: [], step: 0, chords: [] };
  const shown = n => S.hand === "B" || n.hand === S.hand;

  const warn = [];

  // controls
  const modeSeg = h("div", { class: "seg", role: "group", "aria-label": "Chế độ" });
  [["play","Nghe & xem"],["step","Từng bước"]].forEach(([v, l]) => modeSeg.append(h("button", { "aria-pressed": S.mode === v ? "true" : "false", onclick: e => { pause(); S.mode = v; [...modeSeg.children].forEach(b => b.setAttribute("aria-pressed", b === e.currentTarget ? "true" : "false")); layout(); } }, l)));
  const handSeg = h("div", { class: "seg", role: "group", "aria-label": "Tay" });
  [["R","Tay phải"],["L","Tay trái"],["B","Hai tay"]].forEach(([v, l]) => handSeg.append(h("button", { "aria-pressed": S.hand === v ? "true" : "false", onclick: e => { S.hand = v; [...handSeg.children].forEach(b => b.setAttribute("aria-pressed", b === e.currentTarget ? "true" : "false")); rebuild(); } }, l)));
  const otherCb = h("input", { type: "checkbox", id: "otherCb", checked: S.other, onchange: e => { S.other = e.target.checked; rebuild(); } });
  const otherLbl = h("label", { for: "otherCb" }, otherCb, "Nghe kèm tay còn lại");
  const rate = h("input", { type: "range", id: "rate", min: 25, max: 100, step: 5, value: Math.round(S.rate * 100) });
  const rateOut = h("output", { for: "rate", class: "num" });
  rate.addEventListener("input", () => { setRate(rate.value / 100); });
  const metroCb = h("input", { type: "checkbox", id: "metroCb", checked: true, onchange: e => { S.metro = e.target.checked; rebuildEvents(); restartAtPos(); } });
  const countCb = h("input", { type: "checkbox", id: "countCb", checked: true, onchange: e => { S.countIn = e.target.checked; } });
  const loopCb = h("input", { type: "checkbox", id: "loopCb", checked: true, onchange: e => { S.loop = e.target.checked; } });
  const playBtn = h("button", { class: "btn primary", id: "playBtn" }, "▶ Phát");
  const homeBtn = h("button", { class: "btn" }, "⏮ Về đầu");
  const prevBtn = h("button", { class: "btn" }, "‹ Lùi");
  const nextBtn = h("button", { class: "btn primary" }, "Tiếp ›");
  const seek = h("input", { type: "range", id: "seek", min: 0, max: 1000, value: 0, "aria-label": "Vị trí", style: "width:100%;accent-color:var(--accent)" });
  const readout = h("div", { class: "readout" });
  const status = h("div", { class: "status" + (warn.length ? " err" : "") }, warn.join(" "));
  const legend = h("div", { class: "legend" }, h("span", null, h("i", { style: "background:var(--rh)" }), "Tay phải"), h("span", null, h("i", { style: "background:var(--lh)" }), "Tay trái"), h("span", null, h("i", { style: "background:var(--accent);width:4px" }), "Pedal"));
  const rowA = h("div", { class: "ctrls" }, modeSeg, handSeg, otherLbl);
  const rowB = h("div", { class: "ctrls" }, h("label", { for: "rate" }, "Tốc độ", rate, rateOut),
    h("label", { for: "metroCb" }, metroCb, "Metronome"), h("label", { for: "countCb" }, countCb, "Đếm vào 1 ô"), h("label", { for: "loopCb" }, loopCb, "Lặp lại"), nameSeg(() => { kb.relabel(); draw(curPos()); }));
  const rowPlay = h("div", { class: "ctrls" }, playBtn, homeBtn);
  const rowStep = h("div", { class: "ctrls" }, prevBtn, nextBtn, h("span", { class: "status" }, "Phím tắt: Space hoặc → để tiếp, ← để lùi"));
  const ins = instrument(true);
  const kb = new Keyboard(ins.keys);
  body.append(rowA, rowB, rowPlay, rowStep, readout, ins.el, seek, legend, status);

  // keyboard range from all notes in selection
  let lo = 127, hi = 0; for (const n of sel.notes) { lo = Math.min(lo, n.m); hi = Math.max(hi, n.m); }
  if (!sel.notes.length) { lo = 60; hi = 72; }
  const [klo, khi] = rangeFor(lo, hi); kb.build(klo, khi);
  const whites = [...Array(khi - klo + 1)].filter((_, i) => !isBlack(klo + i)).length;
  ins.inner.style.minWidth = Math.max(520, whites * 15) + "px";

  const canvas = ins.top; const g = canvas.getContext("2d");
  function sizeCanvas() { const dpr = window.devicePixelRatio || 1; canvas.width = Math.round(canvas.clientWidth * dpr); canvas.height = Math.round(canvas.clientHeight * dpr); g.setTransform(dpr, 0, 0, dpr, 0, 0); }

  function segAt(s) { let sg = sel.segs[0]; for (const x of sel.segs) if (s >= x.t - 1e-6) sg = x; return sg; }
  function setRate(r) {
    const s = curPos(); S.rate = r; store.set("ptp-rate", r); rate.value = Math.round(r * 100);
    updRateOut(s); if (S.playing) restartAtPos(s);
  }
  function updRateOut(s) { const sg = segAt(Math.max(0, s || 0)); const f = sg.cmp ? 1.5 : 1; rateOut.textContent = Math.round(S.rate * 100) + "% · " + (sg.cmp ? "♩." : "♩") + "≈" + Math.round(sg.bpm * S.rate / f) + " (gốc " + Math.round(sg.bpm / f) + ")"; }

  function rebuildEvents() {
    const ev = [];
    for (const n of sel.notes) {
      const on = shown(n); if (!on && !S.other) continue;
      ev.push({ t: n.t, k: "n", m: n.m, d: n.da, v: on ? 0.75 : 0.38 });
    }
    if (S.metro) for (const b of sel.beats) ev.push({ t: b.t, k: "c", acc: b.acc });
    ev.sort((a, b) => a.t - b.t); S.events = ev;
  }
  function buildChords() {
    const ch = []; for (const n of sel.notes) { if (!shown(n)) continue; const last = ch[ch.length - 1]; if (last && Math.abs(last.t - n.t) < 0.02) last.notes.push(n); else ch.push({ t: n.t, notes: [n] }); }
    S.chords = ch; S.step = Math.min(S.step, Math.max(0, ch.length - 1));
  }
  function rebuild() { S.rk = null; const s = curPos(); rebuildEvents(); buildChords(); if (S.playing) restartAtPos(s); else if (S.mode === "step") showStep(); else draw(s); }

  const curPos = () => S.playing ? (nowA() - S.t0) * S.rate : S.pos;
  function sched() {
    const now = nowA(); const ev = S.events;
    while (S.idx < ev.length) {
      const e = ev[S.idx]; const at = S.t0 + e.t / S.rate; if (at > now + 0.2) break;
      if (at >= now - 0.04) { if (e.k === "n") playNote(e.m, at, e.d / S.rate, e.v); else click(at, e.acc); }
      S.idx++;
    }
    if (S.idx >= ev.length && now > S.t0 + sel.total / S.rate + 0.25) {
      if (S.loop) { S.t0 = now + 0.5; S.idx = 0; }
      else { pause(); S.pos = 0; draw(0); markAt(0); }
    }
  }
  function begin(from, withCount) {
    stopSound(); clearInterval(S.iv);
    const now = nowA() + 0.12; let lead = 0;
    if (withCount && S.countIn) {
      const sg = segAt(from); const beats = sg.beats || 4; const bd = (sg.barDur || 2) / beats / S.rate;
      for (let i = 0; i < beats; i++) click(now + i * bd, i === 0);
      lead = bd * beats;
    }
    S.t0 = now + lead - from / S.rate;
    S.idx = S.events.findIndex(e => e.t >= from - 1e-6); if (S.idx < 0) S.idx = S.events.length;
    S.playing = true; S.iv = setInterval(sched, 25); sched();
    playBtn.textContent = "❚❚ Dừng"; cancelAnimationFrame(S.raf); S.raf = requestAnimationFrame(frame);
  }
  function restartAtPos(s) { if (!S.playing) return; begin(s == null ? curPos() : Math.max(0, s), false); }
  function pause() {
    if (!S.playing) return; S.pos = Math.max(0, Math.min(sel.total, curPos())); S.playing = false;
    clearInterval(S.iv); cancelAnimationFrame(S.raf); stopSound(); playBtn.textContent = "▶ Phát"; draw(S.pos); markAt(S.pos);
  }
  function frame() { if (!S.playing) return; const s = curPos(); draw(s); markAt(s); S.raf = requestAnimationFrame(frame); }
  playBtn.addEventListener("click", async () => {
    if (S.playing) { pause(); return; }
    if (!AU.ready) { status.textContent = "Đang tải tiếng đàn…"; status.classList.remove("err"); }
    await ensureAudio();
    if (AU.failed) { status.textContent = "Không tải được tiếng đàn. Vẫn xem được nốt chạy, nhưng sẽ không có âm thanh."; status.classList.add("err"); }
    else status.textContent = warn.join(" ");
    const from = S.pos >= sel.total - 0.01 ? 0 : S.pos; begin(from, true);
  });
  homeBtn.addEventListener("click", () => { const was = S.playing; pause(); S.pos = 0; draw(0); markAt(0); if (was) begin(0, true); });
  seek.addEventListener("input", () => { const s = seek.value / 1000 * sel.total; if (S.playing) restartAtPos(s); else { S.pos = s; draw(s); markAt(s); } });

  function markAt(s) {
    const map = {};
    for (const n of sel.notes) { if (n.t > s) break; if (s < n.t + n.dv && shown(n)) map[n.m] = "k-" + n.hand; }
    kb.mark(map);
    const bar = sel.bars.reduce((b, x) => x.t <= s + 1e-6 ? x : b, sel.bars[0]);
    const pd = sel.ped.some(([a, b]) => s >= a && s < b);
    const rk = (bar ? bar.n : 0) + "|" + pd + "|" + NAMES.mode; if (rk === S.rk && S.mode === "play") { if (sel.total > 0) seek.value = Math.round(Math.max(0, Math.min(1, s / sel.total)) * 1000); return; } S.rk = rk;
    readout.replaceChildren(h("span", null, "Ô ", h("b", { class: "num" }, bar ? String(bar.n) : "–")),
      h("span", null, "Đoạn tập: " + sel.ranges.map(x => x.a === x.b ? "ô " + x.a : "ô " + x.a + "–" + x.b).join(" → ")),
      h("span", null, "Pedal: " + (pd ? "nhấn" : "nhả")));
    if (sel.total > 0) seek.value = Math.round(Math.max(0, Math.min(1, s / sel.total)) * 1000);
    updRateOut(s);
  }
  function draw(s) {
    const W = canvas.clientWidth, H = canvas.clientHeight; if (!W) return;
    g.clearRect(0, 0, W, H);
    const scale = W / (ins.keys.clientWidth || W);
    const win = 2.8 * S.rate; const pps = (H - 6) / win; const hitY = H - 3;
    const y = t => hitY - (t - s) * pps;
    // beat grid
    const ff = getComputedStyle(document.body).fontFamily; g.font = "11px " + ff;
    for (const b of sel.beats) { if (b.t < s - 0.5 || b.t > s + win) continue; if (b.acc) continue; g.fillStyle = PAL["roll-line"]; g.globalAlpha = 0.5; g.fillRect(0, y(b.t), W, 1); g.globalAlpha = 1; }
    for (const b of sel.bars) {
      if (b.t < s - 0.5 || b.t > s + win) continue; const yy = y(b.t);
      g.fillStyle = PAL["roll-line"]; g.fillRect(0, yy, W, 1.5);
      g.fillStyle = PAL.muted; g.fillText("ô " + b.n, W - 34, yy - 4);
    }
    // pedal strip
    g.fillStyle = PAL.accent;
    for (const [a, b] of sel.ped) { if (b < s - 0.5 || a > s + win) continue; const y1 = y(Math.min(b, s + win + 1)), y0 = y(Math.max(a, s - 0.5)); g.globalAlpha = 0.55; g.fillRect(2, y1, 4, Math.max(1, y0 - y1)); }
    g.globalAlpha = 1;
    // notes
    for (const n of sel.notes) {
      if (n.t > s + win) break; if (n.t + n.dv < s - 0.5) continue;
      const on = shown(n); if (!on && !S.other) continue;
      const k = kb.keyX(n.m); if (!k) continue;
      const x = k.x * scale + 1, w = Math.max(3, k.w * scale - 2);
      const y1 = y(n.t + n.dv) + 1, y0 = y(n.t); const hh = Math.max(4, y0 - y1);
      g.globalAlpha = on ? 1 : 0.28; g.fillStyle = n.hand === "R" ? PAL.rh : PAL.lh;
      roundRect(g, x, y0 - hh, w, hh, 3); g.fill();
      if (on && NAMES.mode !== "off" && w >= 15 && hh >= 15) { g.fillStyle = "#fff"; g.font = "600 9px " + ff; const t = nm(n.m, false); g.fillText(t, x + (w - g.measureText(t).width) / 2, y0 - 4); }
    }
    g.globalAlpha = 1; g.fillStyle = PAL.accent; g.fillRect(0, hitY, W, 2);
  }
  function roundRect(c, x, y, w, hh, r) { r = Math.min(r, w / 2, hh / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r); c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  function showStep() {
    const ch = S.chords[S.step];
    if (!ch) { kb.mark({}); readout.replaceChildren(h("span", null, "Không có nốt nào cho tay này ở đoạn đã chọn.")); draw(0); return; }
    const nx = S.chords[S.step + 1]; const map = {};
    if (nx) for (const n of nx.notes) map[n.m] = "k-next-" + n.hand;
    for (const n of ch.notes) map[n.m] = "k-" + n.hand;
    kb.mark(map); S.pos = ch.t; draw(ch.t - 0.02); seek.value = Math.round(ch.t / sel.total * 1000);
    const n0 = ch.notes[0];
    const byHand = ["R", "L"].map(hd => { const ns = ch.notes.filter(n => n.hand === hd); if (!ns.length) return null;
      return h("span", null, h("b", { style: "color:var(--" + (hd === "R" ? "rh" : "lh") + ");font-size:15px;font-family:var(--f-body)" }, hd === "R" ? "Tay phải: " : "Tay trái: "),
        ns.map(n => nm(n.m)).join(" + ") + " · " + durName(ns[0].q)); });
    readout.replaceChildren(h("span", null, "Ô ", h("b", { class: "num" }, String(n0.bar))), h("span", null, beatName(n0.beat, n0.cmp)),
      h("span", { class: "num" }, "Bước " + (S.step + 1) + "/" + S.chords.length), ...byHand.filter(Boolean),
      nx ? h("span", { style: "color:var(--muted)" }, "Viền = nốt kế tiếp") : h("span", null, "Hết đoạn"));
  }
  async function stepGo(d) {
    if (!S.chords.length) return;
    S.step = Math.max(0, Math.min(S.chords.length - 1, S.step + d));
    showStep();
    await ensureAudio(); if (!AU.ready) return;
    const ch = S.chords[S.step]; const t = nowA() + 0.02;
    for (const n of ch.notes) playNote(n.m, t, Math.min(1.6, Math.max(0.35, n.dv)), 0.75);
  }
  prevBtn.addEventListener("click", () => stepGo(-1));
  nextBtn.addEventListener("click", () => stepGo(+1));
  const onKey = e => {
    if (S.mode !== "step") return; const tg = e.target; if (tg && /INPUT|SELECT|TEXTAREA/.test(tg.tagName) && tg.type !== "range" && tg.type !== "checkbox") return;
    if (e.code === "Space" || e.key === "ArrowRight") { e.preventDefault(); stepGo(+1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); stepGo(-1); }
  };
  document.addEventListener("keydown", onKey);

  function layout() {
    S.rk = null;
    rowPlay.hidden = S.mode !== "play"; rowStep.hidden = S.mode !== "step";
    rowB.querySelectorAll("label").forEach(l => { if (l.htmlFor !== "rate") l.hidden = S.mode === "step"; });
    seek.hidden = S.mode === "step";
    if (S.mode === "step") { buildChords(); showStep(); } else { draw(S.pos); markAt(S.pos); }
  }
  const ro = new ResizeObserver(() => { sizeCanvas(); if (S.mode === "step") showStep(); else draw(curPos()); });
  ro.observe(canvas);
  sizeCanvas(); rebuildEvents(); buildChords(); updRateOut(0); layout();
  ST.cleanup = () => { pause(); clearInterval(S.iv); cancelAnimationFrame(S.raf); ro.disconnect(); document.removeEventListener("keydown", onKey); };
  ST.redraw = () => { if (S.mode === "step") showStep(); else draw(curPos()); };
}
