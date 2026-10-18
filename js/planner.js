// Sinh lộ trình tập từ bản phân tích + lịch của người tập.
// Đầu vào: analysis (analyze.js), settings. Đầu ra: danh sách buổi tập cùng định dạng giáo án.
import { MODULES, FOUNDATION, JIT, LEVELS } from "./modules.js";
import { addDays, weekday, mondayOf, fmtDate } from "./util.js";

export const DEFAULT_SETTINGS = { weekdays: [1, 3, 5], minutes: 30, time: "19:00", level: "beginner", known: [], include: null };

const bars = (a, b) => a === b ? "ô " + a : "ô " + a + "–" + b;
const HAND = { R: "tay phải", L: "tay trái", B: "hai tay" };

export function sessionDates(s) {
  const out = []; if (!s.start || !s.target) return out;
  for (let d = s.start; d < s.target && out.length < 400; d = addDays(d, 1)) if (s.weekdays.includes(weekday(d))) out.push(d);
  return out;
}

function tempoText(bpm, cmp, pct) {
  const v = Math.max(cmp ? 24 : 36, Math.round(bpm * pct / (cmp ? 1.5 : 1) / 2) * 2);
  return (cmp ? "♩. = " : "♩ = ") + v;
}

// Chia một câu thành các cụm 1–4 ô (khoảng 10 giây ở tốc độ gốc; đoạn khó thì cụm ngắn hơn).
function chunksOf(A, p) {
  const barSec = p.dur / (p.b - p.a + 1);
  let k = Math.max(1, Math.min(4, Math.round(10 / barSec)));
  if (p.maxDiff >= 3.5) k = Math.min(k, 2);
  const out = []; for (let a = p.a; a <= p.b; a += k) out.push([a, Math.min(p.b, a + k - 1)]);
  if (out.length > 1 && out[out.length - 1][1] - out[out.length - 1][0] + 1 < k / 2) { const last = out.pop(); out[out.length - 1][1] = last[1]; }
  return out;
}
function avgDiff(A, a, b, key) { let s = 0; for (let i = a; i <= b; i++) s += A.bars[i - 1][key]; return s / (b - a + 1); }

function phraseTasks(A, p, lf) {
  const disc = p.repeatOf != null ? 0.6 : 1;
  const ch = chunksOf(A, p); const t = [];
  for (const hand of ["R", "L"]) {
    const dk = hand === "R" ? "dR" : "dL";
    if (avgDiff(A, p.a, p.b, dk) === 0) continue;
    for (const [a, b] of ch) { const d = Math.max(1, avgDiff(A, a, b, dk)); t.push({ kind: "hs", hand, a, b, phrase: p, cost: (b - a + 1) * (0.05 + 0.03 * d) * lf * disc }); }
  }
  for (const [a, b] of ch) { const d = avgDiff(A, a, b, "diff"); t.push({ kind: "ht", hand: "B", a, b, phrase: p, cost: (b - a + 1) * (0.06 + 0.035 * d) * lf * disc }); }
  if (ch.length > 1) t.push({ kind: "join", hand: "B", a: p.a, b: p.b, phrase: p, cost: 0.3 * lf });
  return t;
}

export function plan(A, song, settings) {
  const S = { ...DEFAULT_SETTINGS, ...settings };
  const level = LEVELS[S.level] || LEVELS.beginner;
  const known = new Set([...(level.known || []), ...(S.known || [])]);
  const lf = level.factor * 30 / S.minutes;
  const dates = sessionDates(S);
  const N = dates.length;
  const warnings = [];
  if (!N) return { sessions: [], warnings: ["Không có buổi tập nào giữa ngày bắt đầu và ngày biểu diễn với các thứ đã chọn."], selection: [], perfSegs: [], jumps: [], N: 0 };

  // 1. Nền tảng cần dạy trước
  const needs = { keyboard: true, treble: true, rhythm: true, bass: !!A.firstOf.bass, keysig: true, intervals: !!A.firstOf.chords };
  let foundation = FOUNDATION.filter(m => needs[m] && !known.has(m));
  // 2. Giai đoạn cuối
  let finals = [];
  if (A.firstOf.pedal && !known.has("pedal")) finals.push("pedal");
  finals.push("connect", "fullRun", "dynamics", "tempoVideo", "performance");
  if (N < 14) finals = finals.filter(f => !["dynamics", "connect"].includes(f));
  if (N < 8) { finals = ["fullRun", "performance"]; foundation = foundation.slice(0, Math.max(0, Math.floor(N / 4))); }
  const T = foundation.length, F = finals.length;
  const B = N - T - F;

  // 3. Chọn câu cho bản biểu diễn
  const P = A.phrases; const m = P.length;
  const pCost = P.map(p => phraseTasks(A, p, lf).reduce((s, t) => s + t.cost, 0) + 0.25 * lf);
  const ckCost = 0.5 * lf;
  let include;
  if (Array.isArray(S.include) && S.include.length === m) include = S.include.slice();
  else {
    include = new Array(m).fill(false);
    const costOf = sel => sel.reduce((s, on, i) => s + (on ? pCost[i] : 0), 0) + ckCost * sectionsIn(A, sel);
    let best = null;
    for (let pre = 0; pre < m; pre++) {
      const sel = new Array(m).fill(false); for (let i = 0; i <= pre; i++) sel[i] = true; sel[m - 1] = true;
      if (costOf(sel) <= B * 1.1 || pre === 0) best = sel;
    }
    include = best;
  }
  const sel = P.map((p, i) => ({ ...p, i, include: include[i], cost: pCost[i] }));
  const chosen = sel.filter(p => p.include);
  const perfSegs = []; for (const p of chosen) { const last = perfSegs[perfSegs.length - 1]; if (last && last[1] + 1 === p.a) last[1] = p.b; else perfSegs.push([p.a, p.b]); }
  const jumps = []; for (let i = 1; i < perfSegs.length; i++) jumps.push([perfSegs[i - 1][1], perfSegs[i][0]]);

  // 4. Danh sách việc cần làm theo thứ tự
  const tasks = [];
  chosen.forEach((p, j) => {
    tasks.push(...phraseTasks(A, p, lf));
    const prev = chosen[j - 1];
    if (prev && prev.b + 1 === p.a) tasks.push({ kind: "link", hand: "B", a: Math.max(prev.a, p.a - 2), b: Math.min(p.b, p.a + 1), phrase: p, cost: 0.25 * lf });
    const nxt = chosen[j + 1];
    const sectionEnd = !nxt || nxt.a !== p.b + 1 || A.sections.some(s => s.a === nxt.a);
    if (sectionEnd) { const start = sectionStart(chosen, j, A); tasks.push({ kind: "check", hand: "B", a: start, b: p.b, phrase: p, cost: ckCost }); }
  });
  const totalCost = tasks.reduce((s, t) => s + t.cost, 0);
  if (totalCost > B * 1.1) { warnings.push("Lịch hơi dày: cần khoảng " + Math.ceil(totalCost + T + F) + " buổi nhưng chỉ có " + N + ". Nên tăng thời lượng mỗi buổi, thêm buổi, hoặc bỏ bớt đoạn."); }

  // 5. Đóng gói việc vào các buổi: chia đều theo chi phí, không vượt quá số buổi dành cho học bài.
  const per = Math.max(1, totalCost / Math.max(1, B));
  const slots = Array.from({ length: Math.max(1, B) }, () => ({ tasks: [], load: 0 }));
  let cum = 0;
  for (const t of tasks) { const idx = Math.min(slots.length - 1, Math.floor((cum + t.cost / 2) / per)); slots[idx].tasks.push(t); slots[idx].load += t.cost; cum += t.cost; }
  const learn = slots.filter(x => x.tasks.length);
  while (learn.length < B) learn.push({ tasks: [], load: 0, review: true });
  // 6. Gắn kiến thức "đúng lúc"
  const taught = new Set([...known, ...foundation]);
  const queue = [];
  let htSeen = false; const startedPhrases = new Set();
  learn.forEach((s, idx) => {
    for (const t of s.tasks) {
      if (idx === 0 && !taught.has("chunking")) queue.push("chunking");
      if (t.kind === "ht" && !htSeen) { htSeen = true; if (!taught.has("handsTogether")) queue.push("handsTogether"); }
      for (const k of JIT) { const fb = A.firstOf[k]; if (fb && fb >= t.a && fb <= t.b && !taught.has(k) && !queue.includes(k)) queue.push(k); }
      if (!startedPhrases.has(t.phrase.a)) { startedPhrases.add(t.phrase.a); if (t.phrase.repeatOf == null && idx > 0) s.listen = t.phrase; }
    }
    if (s.tasks.some(t => t.phrase.features.includes("chords") && t.kind === "hs" && t.hand === "R") && !taught.has("shift") && !queue.includes("shift") && A.phrases.some(p => p.maxDiff >= 2.8 && p.features.includes("chords") && s.tasks.some(t => t.phrase === p))) queue.push("shift");
    while (queue.length && taught.has(queue[0])) queue.shift();
    if (queue.length) { s.module = queue.shift(); taught.add(s.module); }
  });
  queue.forEach(k => warnings.push("Chưa có buổi trống để dạy riêng: " + MODULES[k].title + "."));

  // 7. Dựng giáo án từng buổi
  const ctx = { A, song, plan: { jumps, perfSegs } };
  const firstPhrase = chosen[0];
  const sessions = [];
  const scale = S.minutes / 30;
  const mins = arr => { const r = arr.map(x => Math.max(2, Math.round(x * scale))); r[r.length - 1] += S.minutes - r.reduce((a, b) => a + b, 0); return r; };
  const seen = new Set();
  let di = 0;
  const push = l => { l.n = sessions.length + 1; l.date = dates[di++]; l.week = "Tuần " + fmtDate(mondayOf(l.date), false); sessions.push(l); };

  foundation.forEach((mod, i) => {
    const M = MODULES[mod];
    const readA = firstPhrase.a, readB = Math.min(firstPhrase.b, firstPhrase.a + 3);
    const hand = mod === "bass" ? "L" : "R";
    const rb = mod === "bass" && A.firstOf.bass ? [A.firstOf.bass, Math.min(A.barCount, A.firstOf.bass + 3)] : [readA, readB];
    const [m1, m2, m3, m4] = mins([5, 10, 12, 3]);
    const wu = M.warmup ? M.warmup(ctx) : { task: "Gam " + A.key.name + " một tay, chậm.", bpm: 50, pass: "Đều" };
    const tools = []; if (M.tool) tools.push(M.tool(ctx)); if (mod !== "keyboard" && mod !== "rhythm") tools.push({ type: "song", segs: [rb], hand, mode: "step", label: HAND[hand][0].toUpperCase() + HAND[hand].slice(1) + " " + bars(...rb) });
    push({ phase: "Nền tảng", title: M.title, kind: "theory",
      theory: { title: M.title, body: M.body(ctx), why: M.why(ctx) },
      plan: [
        { min: m1, label: "Khởi động", task: wu.task, bpm: wu.bpm, pass: wu.pass },
        { min: m2, label: "Nhạc lý", task: M.tool ? "Đọc phần nhạc lý, rồi làm công cụ “" + M.tool(ctx).label + "” trong Đàn hướng dẫn." : "Đọc phần nhạc lý và thực hành ngay trên đàn.", bpm: null, pass: M.tool && M.tool(ctx).type === "clef" ? "Đúng ≥ 8/10, mỗi nốt ≤ 3 giây" : "Giải thích lại được bằng lời của mình" },
        { min: m3, label: "Áp dụng vào bài", task: mod === "keyboard" || mod === "rhythm" ? "Tìm trên bản phổ: khóa, số nhịp, hóa biểu, đánh số ô nhịp bằng bút chì." : "Đọc tên nốt " + HAND[hand] + " " + bars(...rb) + " (chưa đàn), rồi kiểm tra bằng “Từng bước”.", bpm: null, pass: "Đúng mọi nốt " + bars(...rb) },
        { min: m4, label: "Ôn lại", task: "Ghi 1 dòng: điều gì dễ nhầm nhất hôm nay.", bpm: null, pass: "Có ghi chú" }
      ],
      mistake: M.mistake, check: M.check(ctx), tools });
  });

  learn.forEach(s => {
    const [m1, m2, m3, m4] = mins([5, 10, 12, 3]);
    const M = s.module ? MODULES[s.module] : null;
    const tools = [];
    if (s.review || !s.tasks.length) {
      const segs = perfSegs.length ? perfSegs : [[1, Math.min(8, A.barCount)]];
      push({ phase: "Củng cố", title: "Ôn và tăng tốc độ", kind: "review", theory: { title: MODULES.review.title, body: MODULES.review.body(ctx), why: MODULES.review.why(ctx) },
        plan: [{ min: m1, label: "Khởi động", task: "Gam " + A.key.name + " hai tay, chậm.", bpm: 60, pass: "Đều" }, { min: m2, label: "Chỗ yếu", task: "Tập riêng 2 chỗ hay vấp nhất, mỗi chỗ 2 ô.", bpm: "60%", pass: "Mỗi chỗ đúng 5 lần liền" }, { min: m3, label: "Tăng tốc", task: "Chơi các đoạn đã học, tăng metronome 2–4 cho đoạn đã sạch.", bpm: "65–75%", pass: "Sạch 3 lần ở tốc độ mới" }, { min: m4, label: "Ghi chú", task: "Ghi tốc độ hiện tại của từng đoạn.", bpm: null, pass: "Có ghi chú" }],
        mistake: MODULES.review.mistake, check: [], tools: [{ type: "song", segs, hand: "B", mode: "play", label: "Các đoạn đã học" }] });
      return;
    }
    const main = s.tasks;
    const first = main[0]; const ph = first.phrase;
    const fbar = A.bars[first.a - 1];
    const descr = main.map(t => taskText(t)).join("; rồi ");
    const pct = t => t.kind === "hs" ? (seen.has(t.hand + t.a) ? 0.55 : 0.45) : t.kind === "ht" ? 0.4 : t.kind === "check" ? 0.6 : 0.5;
    const tempo = tempoText(fbar.bpm, fbar.cmp, pct(first));
    for (const t of main) {
      const mode = (t.kind === "hs" || t.kind === "ht") && !seen.has(t.hand + t.a) ? "step" : "play";
      seen.add(t.hand + t.a);
      tools.push({ type: "song", segs: [[t.a, t.b]], hand: t.hand, mode, label: cap1(HAND[t.hand]) + " " + bars(t.a, t.b) + (t.kind === "check" ? " (kiểm tra)" : "") });
    }
    if (M && M.tool) tools.unshift(M.tool(ctx));
    const wu = (M && M.warmup && M.warmup(ctx)) || featureWarmup(A, ph);
    const theoryBlock = M ? { title: M.title, body: M.body(ctx), why: M.why(ctx) }
      : s.listen ? { title: MODULES.listening.title, body: MODULES.listening.body(ctx), why: MODULES.listening.why(ctx) }
      : { title: "Đọc trước và tự kiểm tra", body: ["Trước khi chơi, đọc tên nốt của đoạn hôm nay thành tiếng, tìm các chỗ có dấu hóa, chỗ đổi thế tay và nốt ngân dài. Khoanh bút chì những chỗ đó."], why: "Đọc trước giúp tay không phải vừa đọc vừa đoán trong lúc có metronome." };
    const block2 = M ? (M.tool ? "Đọc phần nhạc lý, làm “" + M.tool(ctx).label + "”, rồi tìm ví dụ của nó trong " + bars(first.a, main[main.length - 1].b) + "." : "Đọc phần nhạc lý, rồi tìm ví dụ của nó trong " + bars(first.a, main[main.length - 1].b) + ".")
      : s.listen ? "Nghe " + bars(s.listen.a, s.listen.b) + " ba lần ở 50% (đếm ô, nghe tay phải, nghe tay trái)." : "Đọc tên nốt " + bars(first.a, main[main.length - 1].b) + " thành tiếng, khoanh dấu hóa và chỗ đổi thế tay.";
    const mistake = (M && M.mistake) || taskMistake(main[0]);
    const check = [...(M ? M.check(ctx) : []), factQuestion(A, first)];
    const isCheck = main.some(t => t.kind === "check");
    push({ phase: ph.label + (ph.role ? " · " + ph.role : ""), title: titleOf(main), kind: isCheck ? "check" : "learn",
      theory: theoryBlock,
      plan: [
        { min: m1, label: "Khởi động", task: wu.task, bpm: wu.bpm, pass: wu.pass },
        { min: m2, label: M ? "Nhạc lý" : s.listen ? "Nghe" : "Đọc", task: block2, bpm: null, pass: M ? "Chỉ ra được ví dụ trong bản phổ" : "Xong trước khi đàn" },
        { min: m3, label: isCheck ? "Kiểm tra" : "Bài", task: cap1(descr) + ".", bpm: tempo, pass: main.map(passText).join("; ") },
        { min: m4, label: "Ôn lại", task: "Chơi lại cụm yếu nhất 2 lần. Ghi chú chỗ khó.", bpm: null, pass: "Có ghi chú" }
      ],
      mistake, check, tools, segs: main.map(t => [t.a, t.b]) });
  });

  finals.forEach(f => {
    const M = MODULES[f]; const [m1, m2, m3, m4] = mins([5, 10, 12, 3]);
    const segs = perfSegs.length ? perfSegs : [[1, A.barCount]];
    const fb = A.bars[segs[0][0] - 1];
    const tools = [{ type: "song", segs, hand: "B", mode: "play", label: perfSegs.length > 1 ? "Bản rút gọn" : "Cả bài" }];
    if (f === "connect") jumps.forEach(j => tools.push({ type: "song", segs: [[Math.max(1, j[0] - 1), j[0]], [j[1], Math.min(A.barCount, j[1] + 1)]], hand: "B", mode: "play", label: "Nối " + j[0] + " → " + j[1] }));
    const P = {
      pedal: [["Pedal", "Tập pedal trễ với " + bars(...segs[0]) + ", đổi theo vạch pedal trong Đàn hướng dẫn.", tempoText(fb.bpm, fb.cmp, 0.5), "Không đục khi đổi hợp âm"]],
      connect: [["Nối", jumps.length ? "Tập các chỗ nối và bước nhảy " + jumps.map(j => j[0] + " → " + j[1]).join(", ") + "." : "Tập các chỗ chuyển đoạn, mỗi chỗ 2 ô trước + 2 ô sau.", tempoText(fb.bpm, fb.cmp, 0.5), "Mỗi chỗ nối chơi liền 3 lần"]],
      fullRun: [["Cả bài", "Chơi " + (perfSegs.length > 1 ? "bản rút gọn " + perfSegs.map(s => bars(...s)).join(" → ") : "cả bài") + " hai lần theo luật biểu diễn.", "50–60%", "Hết bài, dừng không quá 2 lần"]],
      dynamics: [["Sắc thái", "Ghi ký hiệu to/nhỏ lên bản phổ, rồi chơi cả bài với sắc thái. Tập riêng 2 chỗ hay vấp nhất.", "60–70%", "Nghe rõ khác biệt to/nhỏ"]],
      tempoVideo: [["Video", "Tăng dần lên tốc độ mục tiêu, quay video cả bài, xem lại và ghi 3 việc cần sửa.", "80–85%", "Có video và danh sách 3 việc"]],
      performance: [["Biểu diễn", "Chơi trọn bài 2 lần như biểu diễn thật, quay video lần 2. Vấp thì chơi tiếp.", "Tốc độ biểu diễn", "2 lần trọn bài không dừng"]]
    }[f][0];
    const wu = M.warmup ? M.warmup(ctx) : { task: "Gam " + A.key.name + " hai tay.", bpm: 60, pass: "Đều" };
    push({ phase: f === "performance" ? "Tổng duyệt" : "Hoàn thiện", title: M.title, kind: f,
      theory: { title: M.title, body: M.body(ctx), why: M.why(ctx) },
      plan: f === "fullRun" || f === "performance"
        ? [{ min: m1, label: "Khởi động", task: f === "performance" ? "Chỉ khởi động ngón, không chơi bài." : wu.task, bpm: 60, pass: "Tay ấm" }, { min: m2 + m3, label: P[0], task: P[1], bpm: P[2], pass: P[3] }, { min: m4, label: "Ghi chú", task: "Ghi 2 chỗ cần nhớ.", bpm: null, pass: "Có ghi chú" }]
        : [{ min: m1, label: "Khởi động", task: wu.task, bpm: wu.bpm, pass: wu.pass }, { min: m2, label: "Nhạc lý", task: "Đọc phần nhạc lý và thử ngay trên đàn.", bpm: null, pass: "Hiểu và làm được" }, { min: m3, label: P[0], task: P[1], bpm: P[2], pass: P[3] }, { min: m4, label: "Ôn lại", task: "Ghi lại việc cần làm buổi sau.", bpm: null, pass: "Có ghi chú" }],
      mistake: M.mistake, check: M.check(ctx), tools });
  });

  return { sessions, selection: sel, perfSegs, jumps, N, B, T, F, totalCost, warnings, settings: S };
}

const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
function sectionsIn(A, sel) { let n = 0; A.phrases.forEach((p, i) => { if (sel[i] && (!sel[i + 1] || A.sections.some(s => s.a === A.phrases[i + 1]?.a))) n++; }); return n; }
function sectionStart(chosen, j, A) { let k = j; while (k > 0 && chosen[k - 1].b + 1 === chosen[k].a && !A.sections.some(s => s.a === chosen[k].a)) k--; return chosen[k].a; }
function taskText(t) {
  if (t.kind === "hs") return HAND[t.hand] + " " + bars(t.a, t.b);
  if (t.kind === "ht") return "ghép hai tay " + bars(t.a, t.b);
  if (t.kind === "join") return "nối cả câu " + t.phrase.label + " " + bars(t.a, t.b);
  if (t.kind === "link") return "nối sang câu mới " + bars(t.a, t.b);
  return "mốc kiểm tra: ghi âm " + bars(t.a, t.b) + " hai tay";
}
function passText(t) {
  if (t.kind === "hs") return bars(t.a, t.b) + " " + HAND[t.hand] + " đúng 3 lần liền";
  if (t.kind === "ht") return bars(t.a, t.b) + " hai tay 3 lần liền";
  if (t.kind === "check") return bars(t.a, t.b) + " dừng không quá 1 lần";
  return bars(t.a, t.b) + " liền mạch 2 lần";
}
function titleOf(ts) {
  const t = ts[0]; const p = t.phrase;
  if (ts.some(x => x.kind === "check")) { const c = ts.find(x => x.kind === "check"); return "Mốc kiểm tra: " + bars(c.a, c.b); }
  const hs = ts.filter(x => x.kind === "hs"), ht = ts.filter(x => x.kind === "ht");
  const span = (arr) => bars(Math.min(...arr.map(x => x.a)), Math.max(...arr.map(x => x.b)));
  if (ht.length && !hs.length) return p.label + ": ghép hai tay " + span(ht);
  if (hs.length) { const hands = [...new Set(hs.map(x => x.hand))]; return p.label + ": " + hands.map(h => HAND[h]).join(", ") + " " + span(hs) + (ht.length ? ", ghép " + span(ht) : ""); }
  return p.label + ": " + taskText(t);
}
function featureWarmup(A, p) {
  const f = p.features; const k = A.key.name;
  if (f.includes("compound")) return MODULES.compound.warmup();
  if (f.includes("repChords")) return MODULES.repChords.warmup({ A });
  if (f.includes("leaps")) return MODULES.leaps.warmup();
  if (f.includes("chords") || f.includes("lhChords")) return MODULES.intervals.warmup({ A });
  if (f.includes("running")) return MODULES.running.warmup({ A });
  if (f.includes("octave")) return MODULES.octave.warmup({ A });
  return { task: "Gam " + k + " từng tay, 1 quãng 8, mỗi nốt 1 phách.", bpm: 60, pass: "Đều, đúng ngón" };
}
function taskMistake(t) {
  if (t.kind === "ht") return MODULES.handsTogether.mistake;
  if (t.kind === "check") return MODULES.checkpoint.mistake;
  const f = t.phrase.features;
  if (f.includes("longNotes")) return { title: "Nhả nốt dài quá sớm", fix: "Đếm to và chỉ nhấc ngón đúng lúc bắt đầu nốt tiếp theo." };
  if (f.includes("rhRun")) return { title: "Nhanh dần khi lặp mẫu", fix: "Luôn bật metronome. Thấy mình đi trước tiếng tích là đang nhanh." };
  if (f.includes("chords")) return MODULES.intervals.mistake;
  return MODULES.chunking.mistake;
}
function factQuestion(A, t) {
  const b = A.bars[t.a - 1];
  return { q: "Đoạn " + bars(t.a, t.b) + " ở nhịp gì, tốc độ gốc bao nhiêu?", a: b.meter + ", " + (b.cmp ? "♩. ≈ " + Math.round(b.bpm / 1.5) : "♩ ≈ " + Math.round(b.bpm)) + "." };
}
