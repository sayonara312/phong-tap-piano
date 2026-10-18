// Giao diện chính: thư viện bài → thêm bài từ MIDI → tổng quan + lộ trình → từng buổi tập.
import { h, store, NAMES, todayVN, dayDiff, fmtDate, addDays, uid, weekday } from "./util.js";
import { parseMidi, buildSong, bytesToB64, b64ToBuf, fingerprint } from "./midi.js";
import { analyze, DIFF_LABEL } from "./analyze.js";
import { plan, DEFAULT_SETTINGS, sessionDates } from "./planner.js";
import { MODULES, LEVELS } from "./modules.js";
import { findPreset } from "../presets/index.js";
import { ensureAudio, chime } from "./audio.js";
import { renderStudio, teardownStudio, studioRedraw } from "./studio.js";
import { SYNC, initSync, markDirty, onSync, saveConfig, syncAll, testServer } from "./sync.js";

const $ = s => document.querySelector(s);
const TODAY = todayVN();
const KNOWABLE = ["keyboard", "treble", "rhythm", "bass", "keysig", "intervals", "compound", "octave", "dotted", "handsTogether", "pedal"];
const WD = [[1, "T2"], [2, "T3"], [3, "T4"], [4, "T5"], [5, "T6"], [6, "T7"], [0, "CN"]];

/* ───────── lưu trữ ───────── */
const lib = {
  list: () => store.get("ptp-songs", []),
  saveList: l => store.set("ptp-songs", l),
  get: id => store.get("ptp-song-" + id, null),
  put(rec) { rec.updatedAt = Date.now(); const ok = store.set("ptp-song-" + rec.id, rec); if (ok) markDirty("song", rec.id); return ok; },
  del(id) { store.del("ptp-song-" + id); store.del("ptp-prog-" + id); this.saveList(this.list().filter(x => x.id !== id)); markDirty("song", id); },
  prog: id => store.get("ptp-prog-" + id, {}),
  saveProg(id, p) { p.updatedAt = Date.now(); store.set("ptp-prog-" + id, p); markDirty("prog", id); }
};

/* ───────── nạp bài ───────── */
const cache = {};
function loadSong(id) {
  if (cache[id]) return cache[id];
  const rec = lib.get(id); if (!rec) return null;
  const song = buildSong(parseMidi(b64ToBuf(rec.midi)));
  const A = analyze(song);
  const preset = findPreset(song);
  const out = { rec, song, A, preset };
  compute(out);
  return (cache[id] = out);
}
function compute(S) {
  const { rec, song, A, preset } = S;
  if (preset && rec.usePreset) {
    S.lessons = preset.lessons.map(l => ({ ...l, week: l.week }));
    S.plan = { perfSegs: preset.perfSegs, warnings: [], selection: A.phrases.map(p => ({ ...p, include: preset.perfSegs.some(([a, b]) => p.a >= a && p.b <= b) })), N: S.lessons.length, preset: true };
  } else {
    S.plan = plan(A, song, rec.settings);
    S.lessons = S.plan.sessions;
  }
}

/* ───────── định tuyến: #  |  #s-<id>  |  #s-<id>-b<n> ───────── */
function route() {
  teardownStudio(); resetTimer();
  if (location.hash === "#cai-dat") return renderSettings();
  const m = (location.hash || "").match(/^#s-([a-z0-9]+)(?:-b(\d+))?$/);
  if (!m) return renderLibrary();
  const S = loadSong(m[1]);
  if (!S) { location.hash = ""; return renderLibrary(); }
  NAMES.sf = S.A.key.sf;
  renderSong(S, m[2] ? +m[2] : null);
}
window.addEventListener("hashchange", route);
const go = hash => { if (location.hash === hash) route(); else location.hash = hash; };

/* ───────── Thư viện ───────── */
function renderLibrary() {
  document.title = "Phòng tập piano";
  const root = $("#app"); root.className = "lib"; root.innerHTML = "";
  const songs = lib.list();
  root.append(h("header", { class: "lib-head" },
    h("h1", null, "Phòng tập piano"),
    h("p", null, "Chọn một file MIDI. Trang phân tích bài (giọng, nhịp, đoạn, độ khó), xếp lộ trình theo lịch tập của bạn, và có đàn hướng dẫn cho từng buổi."),
    h("div", { class: "row" }, syncChip(), h("a", { href: "#cai-dat", class: "muted" }, "Lưu trữ và dùng trên điện thoại"))));
  if (songs.length) {
    const grid = h("div", { class: "cards" });
    for (const s of songs) {
      const rec = lib.get(s.id); if (!rec) continue;
      let info = "", next = "";
      try { const S = loadSong(s.id); const p = lib.prog(s.id); const done = S.lessons.filter(l => p[l.n]?.done).length;
        const up = S.lessons.find(l => l.date >= TODAY);
        info = S.A.key.name + " · " + S.A.barCount + " ô · " + done + "/" + S.lessons.length + " buổi đã đạt";
        next = up ? "Buổi tới: bài " + up.n + ", " + fmtDate(up.date) : "Đã qua buổi cuối";
      } catch { info = "Không đọc được file của bài này."; }
      const confirm = h("span", { class: "confirm", hidden: true }, "Xóa bài này? ",
        h("button", { class: "btn danger", onclick: () => { lib.del(s.id); delete cache[s.id]; renderLibrary(); } }, "Xóa"),
        h("button", { class: "btn", onclick: e => { e.currentTarget.parentElement.hidden = true; } }, "Giữ lại"));
      grid.append(h("article", { class: "card song-card" },
        h("h3", null, rec.name), h("p", { class: "muted" }, info), h("p", null, next),
        h("div", { class: "row" }, h("a", { class: "btn primary", href: "#s-" + s.id }, "Mở"), h("button", { class: "btn", onclick: () => { confirm.hidden = false; } }, "Xóa"), confirm)));
    }
    root.append(h("section", { class: "sec" }, h("h2", null, "Bài của bạn"), grid));
  }
  root.append(addForm());
  root.append(h("section", { class: "sec how" }, h("h2", null, "Cách hoạt động"),
    h("ol", null,
      h("li", null, h("b", null, "Phân tích: "), "giọng và hóa biểu, nhịp, tốc độ, các đoạn và câu, câu nào nhắc lại câu nào, độ khó từng ô, kỹ thuật xuất hiện lần đầu ở đâu (khóa Fa, hợp âm, quãng 8, nhảy quãng, pedal…)."),
      h("li", null, h("b", null, "Xếp lộ trình: "), "đếm số buổi theo lịch, dành buổi đầu cho nhạc lý còn thiếu, chọn bản rút gọn vừa sức (luôn giữ mở đầu và đoạn kết), chia câu thành cụm 1–4 ô, tập tay riêng rồi ghép, có mốc kiểm tra và giai đoạn hoàn thiện."),
      h("li", null, h("b", null, "Từng buổi: "), "nhạc lý đúng lúc cần, kế hoạch theo phút có đồng hồ, tốc độ metronome, tiêu chí đạt, lỗi hay gặp, câu tự kiểm tra và đàn hướng dẫn chạy đúng đoạn của buổi đó.")),
    h("p", { class: "foot" }, "File MIDI chỉ được lưu trong trình duyệt của bạn. Tiếng piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0).")));
}

function settingsFields(S, prefix) {
  const f = {};
  f.start = h("input", { type: "date", id: prefix + "start", value: S.start || TODAY });
  f.target = h("input", { type: "date", id: prefix + "target", value: S.target || addDays(TODAY, 56) });
  f.minutes = h("select", { id: prefix + "min" }, [20, 30, 45, 60].map(v => h("option", { value: v, selected: v === S.minutes }, v + " phút")));
  f.time = h("input", { type: "time", id: prefix + "time", value: S.time || "19:00" });
  f.level = h("select", { id: prefix + "lvl" }, Object.entries(LEVELS).map(([k, v]) => h("option", { value: k, selected: k === S.level }, v.label)));
  f.days = WD.map(([d, l]) => h("label", { class: "daychip" }, h("input", { type: "checkbox", id: prefix + "d" + d, value: d, checked: S.weekdays.includes(d) }), l));
  f.known = KNOWABLE.map(k => h("label", { class: "inline" }, h("input", { type: "checkbox", id: prefix + "k-" + k, value: k, checked: (S.known || []).includes(k) }), MODULES[k].title));
  f.read = () => ({ start: f.start.value, target: f.target.value, minutes: +f.minutes.value, time: f.time.value, level: f.level.value,
    weekdays: f.days.map(l => l.firstChild).filter(i => i.checked).map(i => +i.value), known: f.known.map(l => l.firstChild).filter(i => i.checked).map(i => i.value) });
  f.grid = h("div", { class: "form-grid" },
    h("label", { for: prefix + "start" }, "Bắt đầu tập", f.start),
    h("label", { for: prefix + "target" }, "Ngày biểu diễn", f.target),
    h("label", { for: prefix + "min" }, "Mỗi buổi", f.minutes),
    h("label", { for: prefix + "time" }, "Giờ tập", f.time),
    h("label", { for: prefix + "lvl", class: "wide" }, "Trình độ", f.level),
    h("fieldset", { class: "wide" }, h("legend", null, "Ngày tập trong tuần"), h("div", { class: "days" }, f.days)),
    h("details", { class: "wide" }, h("summary", null, "Kiến thức đã biết (bỏ qua khi xếp lộ trình)"), h("div", { class: "known" }, f.known)));
  return f;
}

function addForm() {
  const st = h("div", { class: "status" });
  const file = h("input", { type: "file", id: "newMidi", accept: ".mid,.midi,audio/midi", class: "sr" });
  const name = h("input", { type: "text", id: "newName", placeholder: "Tên bài", required: true });
  const preview = h("div", { class: "preview" });
  const f = settingsFields({ ...DEFAULT_SETTINGS }, "n-");
  let buf = null, fname = "";
  file.addEventListener("change", async () => {
    const fl = file.files && file.files[0]; if (!fl) return;
    st.textContent = ""; st.classList.remove("err");
    try {
      buf = await fl.arrayBuffer(); fname = fl.name;
      const song = buildSong(parseMidi(buf)); const A = analyze(song); const pre = findPreset(song);
      if (!name.value) name.value = pre ? pre.title : fl.name.replace(/\.(mid|midi)$/i, "").replace(/[_-]+/g, " ");
      preview.replaceChildren(h("span", { class: "chip" }, A.key.name + (A.key.detected ? " (đoán)" : "")), h("span", { class: "chip" }, "Nhịp " + A.meters.join(", ")), h("span", { class: "chip" }, A.barCount + " ô"), h("span", { class: "chip" }, Math.floor(A.duration / 60) + " phút " + Math.round(A.duration % 60) + " giây"),
        pre ? h("span", { class: "chip accent" }, "Có giáo án soạn sẵn") : null);
      if (pre) { const s = pre.settings; f.start.value = s.start; f.target.value = s.target; }
    } catch (e) { buf = null; st.textContent = "Không đọc được file: " + e.message; st.classList.add("err"); preview.replaceChildren(); }
  });
  const form = h("form", { class: "card add" },
    h("h2", null, "Thêm bài từ file MIDI"),
    h("div", { class: "row" }, h("label", { class: "btn", for: "newMidi" }, "Chọn file .mid", file), preview),
    h("label", { for: "newName" }, "Tên bài", name),
    f.grid,
    h("div", { class: "row" }, h("button", { class: "btn primary", type: "submit" }, "Phân tích và tạo lộ trình"), st));
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!buf) { st.textContent = "Hãy chọn một file .mid trước."; st.classList.add("err"); return; }
    const settings = f.read();
    if (!settings.weekdays.length) { st.textContent = "Chọn ít nhất một ngày tập trong tuần."; st.classList.add("err"); return; }
    if (settings.target <= settings.start) { st.textContent = "Ngày biểu diễn phải sau ngày bắt đầu."; st.classList.add("err"); return; }
    const song = buildSong(parseMidi(buf));
    const id = uid(); const rec = { id, name: name.value.trim() || fname, fileName: fname, midi: bytesToB64(buf), settings, usePreset: !!findPreset(song), createdAt: TODAY, fp: fingerprint(song) };
    if (!lib.put(rec)) { st.textContent = "Trình duyệt không cho lưu thêm (bộ nhớ đầy hoặc bị chặn)."; st.classList.add("err"); return; }
    lib.saveList([...lib.list(), { id, name: rec.name }]);
    go("#s-" + id);
  });
  return h("section", { class: "sec" }, form);
}

/* ───────── Trang một bài ───────── */
function renderSong(S, n) {
  const root = $("#app"); root.className = "app"; root.innerHTML = "";
  document.title = S.rec.name + " · Phòng tập piano";
  const prog = lib.prog(S.rec.id);
  const L = S.lessons;
  const target = S.rec.usePreset && S.preset ? S.preset.settings.target : S.rec.settings.target;
  const left = dayDiff(TODAY, target);
  const list = h("nav", { class: "list" });
  let wk = "";
  for (const l of L) {
    if (l.week !== wk) { wk = l.week; list.append(h("div", { class: "wk" }, wk)); }
    list.append(h("a", { class: "li", href: "#s-" + S.rec.id + "-b" + l.n, "aria-current": l.n === n ? "true" : "false" },
      h("span", { class: "n num" }, String(l.n)),
      h("span", null, h("span", { class: "t" }, l.title), h("br"), h("span", { class: "d" }, fmtDate(l.date) + (l.date === TODAY ? " · hôm nay" : ""))),
      h("span", { class: "dot" + (prog[l.n]?.done ? " done" : "") + (l.date === TODAY ? " today" : "") })));
  }
  const sel = h("select", { id: "mSel", onchange: e => go("#s-" + S.rec.id + (e.target.value === "0" ? "" : "-b" + e.target.value)) },
    h("option", { value: "0", selected: !n }, "Tổng quan bài"), L.map(l => h("option", { value: l.n, selected: l.n === n }, "Bài " + l.n + " · " + fmtDate(l.date, false) + " · " + l.title + (prog[l.n]?.done ? " ✓" : ""))));
  root.append(h("aside", { class: "rail" },
    h("div", { class: "row" }, h("a", { class: "back", href: "#" }, "‹ Thư viện"), syncChip()),
    h("div", { class: "brand" }, h("h1", null, S.rec.name), h("p", null, S.A.key.name + " · " + S.A.barCount + " ô · " + L.length + " buổi")),
    h("div", { class: "count" }, h("b", { class: "num" }, left > 0 ? String(left) : left === 0 ? "Hôm nay" : "✓"), h("span", null, left > 0 ? "ngày nữa tới " + fmtDate(target, false) : left === 0 ? "là ngày biểu diễn" : "đã qua ngày biểu diễn")),
    h("a", { class: "li ov", href: "#s-" + S.rec.id, "aria-current": !n ? "true" : "false" }, h("span", { class: "n" }, "◎"), h("span", { class: "t" }, "Tổng quan và lịch")),
    h("div", { class: "mnav" }, h("label", { class: "sr", for: "mSel" }, "Chọn bài"), sel),
    list));
  const page = h("main", { class: "page" }); root.append(page);
  if (!n) renderOverview(S, page); else renderLesson(S, n, page, prog);
  const cur = list.querySelector('[aria-current="true"]'); if (cur) cur.scrollIntoView({ block: "nearest" });
  window.scrollTo({ top: 0 });
}

/* ── Tổng quan: phân tích + chọn đoạn + lịch ── */
function renderOverview(S, page) {
  const { A, rec } = S; const P = S.plan;
  const usingPreset = rec.usePreset && S.preset;
  page.append(h("header", { class: "head" },
    h("div", { class: "eyebrow" }, "Tổng quan bài"),
    h("h2", null, rec.name),
    h("div", { class: "facts" },
      fact("Giọng", A.key.name + (A.key.detected ? " (đoán)" : "")), fact("Hóa biểu", A.key.accNames.length ? A.key.accNames.length + " dấu " + (A.key.sf < 0 ? "giáng" : "thăng") : "không có"),
      fact("Nhịp", A.meters.join(" → ")), fact("Độ dài", A.barCount + " ô · " + Math.floor(A.duration / 60) + "′" + String(Math.round(A.duration % 60)).padStart(2, "0") + "″"),
      fact("Bản biểu diễn", P.perfSegs.map(s => s[0] + "–" + s[1]).join(" → ") || "—"), fact("Số buổi", String(S.lessons.length)))));
  if (P.warnings?.length) page.append(h("div", { class: "warn" }, P.warnings.map(w => h("p", null, w))));

  // biểu đồ độ khó từng ô
  page.append(h("section", { class: "sec" }, h("h3", null, "Độ khó từng ô"),
    h("p", { class: "muted" }, "Cột cao là ô khó. Màu đậm là các ô nằm trong bản biểu diễn. Di chuột hoặc chạm vào cột để xem chi tiết."),
    diffChart(A, P)));

  // bảng câu
  const tbl = h("table", { class: "tbl" }, h("thead", null, h("tr", null, ["", "Câu", "Ô nhịp", "Nhịp · tốc độ", "Độ khó", "Nhắc lại", "Kỹ thuật", "Ước tính"].map(x => h("th", null, x)))));
  const tb = h("tbody"); const inc = P.selection.map(p => p.include);
  P.selection.forEach((p, i) => {
    const cb = h("input", { type: "checkbox", id: "inc-" + i, checked: p.include, disabled: !!usingPreset, "aria-label": "Đưa câu " + p.label + " vào bản biểu diễn", onchange: e => { inc[i] = e.target.checked; applyBtn.hidden = false; } });
    tb.append(h("tr", null, h("td", null, cb), h("td", null, h("b", null, p.label), p.role ? h("span", { class: "muted" }, " · " + p.role) : null), h("td", { class: "num" }, p.a + "–" + p.b),
      h("td", { class: "num" }, p.meter + " · " + (p.cmp ? "♩." + Math.round(p.bpm / 1.5) : "♩" + Math.round(p.bpm))),
      h("td", null, h("span", { class: "meter" }, h("i", { style: { width: (p.diff / 5 * 100) + "%" } })), " " + DIFF_LABEL(p.diff)),
      h("td", null, p.repeatOf != null ? A.phrases[p.repeatOf].label : "—"),
      h("td", { class: "feat" }, p.features.filter(f => FEAT[f]).map(f => FEAT[f]).join(", ")),
      h("td", { class: "num" }, p.cost != null ? p.cost.toFixed(1) + " buổi" : "")));
  });
  tbl.append(tb);
  const applyBtn = h("button", { class: "btn primary", hidden: true, onclick: () => { rec.settings = { ...rec.settings, include: inc }; lib.put(rec); compute(S); route(); } }, "Áp dụng lựa chọn đoạn");
  const resetSel = !usingPreset && rec.settings.include ? h("button", { class: "btn", onclick: () => { rec.settings = { ...rec.settings, include: null }; lib.put(rec); compute(S); route(); } }, "Để trang tự chọn lại") : null;
  page.append(h("section", { class: "sec" }, h("h3", null, "Các câu và bản biểu diễn"),
    h("p", { class: "muted" }, usingPreset ? "Đang dùng giáo án soạn sẵn, nên phần chọn đoạn bị khóa." : "Trang tự chọn bản vừa sức: luôn giữ mở đầu và đoạn kết, lấy thêm các câu liền nhau từ đầu cho tới khi hết số buổi. Bạn có thể tự bật/tắt từng câu."),
    h("div", { class: "tbl-wrap" }, tbl), h("div", { class: "row" }, applyBtn, resetSel)));

  // lịch
  const f = settingsFields(rec.settings, "s-");
  const st = h("div", { class: "status" });
  const dates = sessionDates(rec.settings);
  const presetToggle = S.preset ? h("label", { class: "inline" }, h("input", { type: "checkbox", id: "usePreset", checked: !!rec.usePreset, onchange: e => { rec.usePreset = e.target.checked; lib.put(rec); compute(S); route(); } }), "Dùng giáo án soạn sẵn (" + S.preset.note + ")") : null;
  const saveBtn = h("button", { class: "btn primary", type: "submit" }, "Cập nhật lộ trình");
  const form = h("form", { class: "card" }, presetToggle, usingPreset ? h("p", { class: "muted" }, "Bỏ chọn giáo án soạn sẵn để dùng lịch bên dưới.") : null, f.grid,
    h("p", { class: "muted" }, dates.length + " buổi từ " + fmtDate(rec.settings.start) + " tới trước " + fmtDate(rec.settings.target) + (P.preset ? "" : " · nền tảng " + P.T + ", học bài " + P.B + ", hoàn thiện " + P.F)),
    h("div", { class: "row" }, saveBtn, st));
  form.addEventListener("submit", e => {
    e.preventDefault(); const s = f.read();
    if (!s.weekdays.length) { st.textContent = "Chọn ít nhất một ngày tập."; st.classList.add("err"); return; }
    if (s.target <= s.start) { st.textContent = "Ngày biểu diễn phải sau ngày bắt đầu."; st.classList.add("err"); return; }
    rec.settings = { ...s, include: null }; lib.put(rec); compute(S); route();
  });
  page.append(h("section", { class: "sec" }, h("h3", null, "Lịch tập"), form));

  // lộ trình tóm tắt
  const rows = S.lessons.map(l => h("tr", null, h("td", { class: "num" }, String(l.n)), h("td", null, fmtDate(l.date)), h("td", null, l.phase), h("td", null, h("a", { href: "#s-" + rec.id + "-b" + l.n }, l.title))));
  const dl = h("button", { class: "btn", onclick: () => exportPlan(S) }, "Tải lộ trình (.json)");
  page.append(h("section", { class: "sec" }, h("h3", null, "Lộ trình"), h("div", { class: "tbl-wrap" }, h("table", { class: "tbl" }, h("thead", null, h("tr", null, ["Bài", "Ngày", "Giai đoạn", "Nội dung"].map(x => h("th", null, x)))), h("tbody", null, rows))), h("div", { class: "row" }, dl)));
}
const fact = (k, v) => h("div", { class: "fact" }, h("span", null, k), h("b", null, v));
const FEAT = { chords: "hợp âm tay phải", lhChords: "hợp âm tay trái", octave: "quãng 8", leaps: "nhảy quãng", running: "tay trái chạy", repChords: "hợp âm nhắc lại", ornaments: "hoa mỹ/tremolo", accidentals: "dấu hóa bất thường", compound: "nhịp ghép", voicing: "giai điệu trong hợp âm", rhRun: "tay phải chạy đều", longNotes: "nốt ngân dài" };

function diffChart(A, P) {
  const NS = "http://www.w3.org/2000/svg"; const n = A.barCount; const bw = 9, gap = 2, H = 150, top = 26, base = H - 18;
  const W = Math.max(600, n * (bw + gap) + 40);
  const svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("width", W); svg.setAttribute("height", H); svg.setAttribute("class", "chart");
  svg.setAttribute("role", "img"); svg.setAttribute("aria-label", "Biểu đồ độ khó từng ô nhịp");
  const el = (t, a, txt) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; svg.append(e); return e; };
  const x = i => 30 + (i - 1) * (bw + gap); const y = d => base - (d / 5) * (base - top);
  [1, 3, 5].forEach(v => { el("line", { x1: 26, x2: W - 6, y1: y(v), y2: y(v), class: "grid" }); el("text", { x: 22, y: y(v) + 4, class: "axis", "text-anchor": "end" }, String(v)); });
  const inPerf = b => P.perfSegs.some(([a, c]) => b >= a && b <= c);
  P.selection.forEach(p => {
    el("line", { x1: x(p.a), x2: x(p.b) + bw, y1: 12, y2: 12, class: "band" + (inPerf(p.a) ? " on" : "") });
    el("text", { x: x(p.a), y: 9, class: "band-lbl" }, p.label);
  });
  const tip = h("div", { class: "tip", hidden: true });
  for (const b of A.bars) {
    const hgt = Math.max(2, base - y(b.diff)); const r = el("path", { d: `M${x(b.n)},${base} V${base - hgt + 3} q0,-3 3,-3 h${bw - 6} q3,0 3,3 V${base} Z`, class: "barm" + (inPerf(b.n) ? " on" : ""), tabindex: 0 });
    const show = () => { tip.hidden = false; tip.textContent = "Ô " + b.n + " · " + DIFF_LABEL(b.diff) + " (" + b.diff.toFixed(1) + ") · " + b.meter + " · " + (b.cmp ? "♩." + Math.round(b.bpm / 1.5) : "♩" + Math.round(b.bpm)) + (inPerf(b.n) ? " · trong bản biểu diễn" : ""); };
    r.addEventListener("pointerenter", show); r.addEventListener("focus", show); r.addEventListener("click", show);
  }
  for (let i = 1; i <= n; i += (n > 60 ? 8 : 4)) el("text", { x: x(i) + bw / 2, y: H - 4, class: "axis", "text-anchor": "middle" }, String(i));
  return h("div", { class: "chart-wrap" }, h("div", { class: "chart-scroll" }, svg), tip);
}

function exportPlan(S) {
  const data = JSON.stringify({ name: S.rec.name, settings: S.rec.settings, analysis: { key: S.A.key, meters: S.A.meters, bars: S.A.barCount, phrases: S.plan.selection.map(p => ({ label: p.label, a: p.a, b: p.b, diff: +p.diff.toFixed(2), include: p.include })) }, perfSegs: S.plan.perfSegs, lessons: S.lessons }, null, 2);
  const a = h("a", { href: URL.createObjectURL(new Blob([data], { type: "application/json" })), download: (S.rec.name || "lo-trinh").replace(/[^\p{L}\p{N}]+/gu, "-") + ".json" });
  document.body.append(a); a.click(); a.remove();
}

/* ── Một buổi tập ── */
const TM = { running: false, acc: 0, start: 0, iv: null, lastBlock: -1, wake: null };
function resetTimer() { clearInterval(TM.iv); TM.running = false; TM.acc = 0; TM.lastBlock = -1; try { TM.wake && TM.wake.release(); } catch {} TM.wake = null; }

function renderLesson(S, n, page, prog) {
  const L = S.lessons[n - 1]; const N = S.lessons.length; const id = S.rec.id;
  if (!L) { page.append(h("p", null, "Không có bài này.")); return; }
  const P = (prog[n] = prog[n] || { done: false, pass: [] }); const save = () => lib.saveProg(id, prog);
  const dd = dayDiff(TODAY, L.date);
  const when = dd === 0 ? "Hôm nay" : dd > 0 ? (dd === 1 ? "Ngày mai" : "Còn " + dd + " ngày") : "Đã qua " + (-dd) + " ngày";
  const time = (S.rec.usePreset && S.preset ? S.preset.settings.time : S.rec.settings.time) || "";
  const total = L.plan.reduce((s, b) => s + b.min, 0);
  page.append(h("header", { class: "head" },
    h("div", { class: "eyebrow" }, "Bài " + L.n + " / " + N + " · " + L.week + " · " + L.phase),
    h("h2", null, L.title),
    h("div", { class: "meta" }, h("span", { class: "chip" }, fmtDate(L.date) + (time ? ", " + time : "")), h("span", null, when), h("span", null, total + " phút")),
    h("div", { class: "navrow" },
      h("a", { class: "btn" + (n === 1 ? " off" : ""), href: n > 1 ? "#s-" + id + "-b" + (n - 1) : "#s-" + id }, n > 1 ? "‹ Bài trước" : "‹ Tổng quan"),
      n < N ? h("a", { class: "btn", href: "#s-" + id + "-b" + (n + 1) }, "Bài sau ›") : null)));

  page.append(h("section", { class: "sec" }, h("h3", null, "Nhạc lý hôm nay"),
    h("div", { class: "theory" }, h("h4", null, L.theory.title), ...L.theory.body.map(t => h("p", null, t)),
      h("p", { class: "why" }, h("b", null, "Vì sao cần cho bài này? "), L.theory.why))));

  const blocks = L.plan.map((b, i) => {
    const cid = "pass-" + n + "-" + i;
    const cb = h("input", { type: "checkbox", id: cid, checked: !!P.pass[i], onchange: e => { P.pass[i] = e.target.checked; save(); } });
    return h("div", { class: "blk" },
      h("div", { class: "min num" }, b.min + "'", h("small", null, b.label)),
      h("div", { class: "blk-body" }, h("div", { class: "lbl" }, b.label), h("p", null, b.task),
        h("div", { class: "row" }, b.bpm ? h("span", { class: "chip num" }, typeof b.bpm === "number" ? "♩ = " + b.bpm : b.bpm) : null,
          h("label", { class: "pass", for: cid }, cb, h("span", null, h("b", null, "Đạt khi: "), b.pass))),
        h("div", { class: "bar" }, h("i"))));
  });
  const clock = h("span", { class: "clock num" }, String(total).padStart(2, "0") + ":00");
  const tLbl = h("span", { class: "status" }, "Bấm Bắt đầu, trang sẽ báo khi chuyển phần.");
  const startBtn = h("button", { class: "btn primary" }, "Bắt đầu buổi tập");
  const ends = []; L.plan.reduce((s, b) => { ends.push(s + b.min * 60); return s + b.min * 60; }, 0); const tot = total * 60;
  function paint() {
    const el = TM.acc + (TM.running ? (Date.now() - TM.start) / 1000 : 0);
    let bi = ends.findIndex(e => el < e); if (bi < 0) bi = ends.length;
    blocks.forEach((b, i) => { b.classList.toggle("now", (TM.running || el > 0) && i === bi); const s0 = i ? ends[i - 1] : 0; b.querySelector(".bar i").style.width = Math.min(1, Math.max(0, (el - s0) / (ends[i] - s0))) * 100 + "%"; });
    if (bi >= ends.length) { clock.textContent = "00:00"; tLbl.textContent = "Xong buổi tập. Đánh dấu các mục đạt nhé."; if (TM.running) { TM.acc = tot; TM.running = false; clearInterval(TM.iv); chime(); startBtn.textContent = "Bắt đầu lại"; } return; }
    const rem = ends[bi] - el; clock.textContent = String(Math.floor(rem / 60)).padStart(2, "0") + ":" + String(Math.floor(rem % 60)).padStart(2, "0");
    tLbl.textContent = (el > 0 ? "Đang: " : "Phần đầu: ") + L.plan[bi].label + " · còn " + Math.ceil((tot - el) / 60) + " phút cả buổi";
    if (TM.running && TM.lastBlock !== bi) { if (TM.lastBlock >= 0) chime(); TM.lastBlock = bi; }
  }
  startBtn.addEventListener("click", async () => {
    ensureAudio();
    if (TM.running) { TM.acc += (Date.now() - TM.start) / 1000; TM.running = false; clearInterval(TM.iv); startBtn.textContent = "Tiếp tục"; paint(); return; }
    if (TM.acc >= tot) TM.acc = 0;
    TM.running = true; TM.start = Date.now(); TM.iv = setInterval(paint, 250); startBtn.textContent = "Tạm dừng"; paint();
    try { TM.wake = await navigator.wakeLock.request("screen"); } catch {}
  });
  page.append(h("section", { class: "sec" }, h("h3", null, "Kế hoạch " + total + " phút"),
    h("div", { class: "timer" }, clock, startBtn, h("button", { class: "btn", onclick: () => { resetTimer(); startBtn.textContent = "Bắt đầu buổi tập"; paint(); } }, "Đặt lại"), tLbl),
    h("div", { class: "plan" }, blocks)));
  paint();

  page.append(h("div", { class: "two" },
    L.mistake ? h("div", { class: "card mistake" }, h("div", { class: "eyebrow" }, "Lỗi hay gặp"), h("h4", null, L.mistake.title), h("p", null, L.mistake.fix)) : null,
    L.check?.length ? h("div", { class: "card" }, h("div", { class: "eyebrow" }, "Tự kiểm tra"), h("div", { class: "qa" }, L.check.map(c => h("details", null, h("summary", null, c.q), h("p", null, c.a))))) : null));

  page.append(h("section", { class: "sec" }, h("h3", null, "Đàn hướng dẫn"), renderStudio(L, { song: S.song, key: S.A.key })));

  const doneCb = h("input", { type: "checkbox", id: "done-" + n, checked: P.done, onchange: e => { P.done = e.target.checked; save(); const d = document.querySelector('.li[aria-current="true"] .dot'); if (d) d.classList.toggle("done", P.done); } });
  page.append(h("div", { class: "done-row" },
    h("label", { class: "pass", for: "done-" + n }, doneCb, h("b", null, "Đã đạt bài " + n)),
    h("span", { class: "status" }, "Sau buổi tập, ghi lại mục nào đạt và chỗ nào khó."),
    n < N ? h("a", { class: "btn", href: "#s-" + id + "-b" + (n + 1) }, "Bài " + (n + 1) + " ›") : null));

  // Thanh điều hướng dưới cùng trên điện thoại
  const miniClock = h("span", { class: "num" }, clock.textContent);
  new MutationObserver(() => { miniClock.textContent = clock.textContent; }).observe(clock, { childList: true, characterData: true, subtree: true });
  page.append(h("nav", { class: "bottom-nav", "aria-label": "Điều hướng buổi tập" },
    h("a", { class: "bn" + (n === 1 ? " off" : ""), href: n > 1 ? "#s-" + id + "-b" + (n - 1) : "#s-" + id }, "‹", h("small", null, n > 1 ? "Bài " + (n - 1) : "Tổng quan")),
    h("button", { class: "bn clock-btn", type: "button", onclick: () => startBtn.click() }, miniClock, h("small", null, "Hẹn giờ")),
    h("a", { class: "bn", href: "#s-" + id }, "◎", h("small", null, "Tổng quan")),
    n < N ? h("a", { class: "bn", href: "#s-" + id + "-b" + (n + 1) }, "›", h("small", null, "Bài " + (n + 1))) : h("span", { class: "bn off" }, "›", h("small", null, "Hết"))));
}

/* ───────── theme ───────── */
const mq = window.matchMedia("(prefers-color-scheme: dark)");
mq.addEventListener && mq.addEventListener("change", studioRedraw);
new MutationObserver(studioRedraw).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

/* ───────── đồng bộ, cài đặt lên điện thoại ───────── */
function onRemoteChange() {
  for (const k in cache) delete cache[k];
  if (TM.running || document.querySelector(".studio canvas") && document.querySelector("#playBtn")?.textContent.includes("Dừng")) { pendingRefresh = true; return; }
  route();
}
let pendingRefresh = false;
document.addEventListener("visibilitychange", () => { if (pendingRefresh && document.visibilityState === "visible" && !TM.running) { pendingRefresh = false; route(); } });

const SYNC_TEXT = { off: "Lưu trên trình duyệt này", checking: "Đang tìm máy chủ…", ok: "Đã lưu trên máy chủ", saving: "Đang lưu…", offline: "Ngoại tuyến · sẽ lưu sau", auth: "Cần mã truy cập", error: "Lỗi đồng bộ" };
function syncChip() {
  const el = h("button", { class: "sync-chip", type: "button", title: "Lưu trữ và đồng bộ", onclick: () => go("#cai-dat") });
  const paint = st => { el.dataset.state = st.status; el.textContent = SYNC_TEXT[st.status] || st.status; el.title = st.msg || ""; };
  paint(SYNC); const off = onSync(paint);
  new MutationObserver((_, obs) => { if (!el.isConnected) { off(); obs.disconnect(); } }).observe(document.body, { childList: true, subtree: true });
  return el;
}

let installEvt = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; document.querySelectorAll(".install-btn").forEach(b => b.hidden = false); });
const standalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
function installCard() {
  if (standalone()) return null;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const btn = h("button", { class: "btn primary install-btn", hidden: !installEvt, onclick: async () => { if (!installEvt) return; installEvt.prompt(); await installEvt.userChoice; installEvt = null; btn.hidden = true; } }, "Cài lên màn hình chính");
  return h("div", { class: "card install" }, h("h3", null, "Dùng trên điện thoại"),
    h("p", null, ios ? "Trên iPhone: mở trang bằng Safari, bấm nút Chia sẻ rồi chọn “Thêm vào MH chính”." : "Trên Android/Chrome: bấm nút bên dưới, hoặc menu ⋮ → “Cài đặt ứng dụng” / “Thêm vào màn hình chính”."),
    h("p", { class: "muted" }, "Cài xong, trang mở toàn màn hình như một ứng dụng và vẫn mở được phần đã tải khi mất mạng. Cần mở trang qua HTTPS (hoặc localhost) thì mới cài được."),
    btn);
}

function renderSettings() {
  document.title = "Lưu trữ · Phòng tập piano";
  const root = $("#app"); root.className = "lib"; root.innerHTML = "";
  const base = h("input", { type: "url", id: "srvBase", placeholder: "Để trống nếu trang chạy trên chính máy chủ", value: SYNC.cfg.base || "" });
  const token = h("input", { type: "password", id: "srvToken", placeholder: "PTP_TOKEN (nếu máy chủ có đặt)", value: SYNC.cfg.token || "", autocomplete: "off" });
  const st = h("div", { class: "status" }, SYNC.msg);
  const last = SYNC.lastOk ? "Lần đồng bộ gần nhất: " + new Date(SYNC.lastOk).toLocaleString("vi-VN") : "Chưa đồng bộ lần nào.";
  const form = h("form", { class: "card add" },
    h("h2", null, "Lưu trên máy chủ"),
    h("p", null, "Khi bật, bài, lịch và tiến độ được lưu trên máy chủ của bạn, nên mở trên điện thoại hay máy tính đều thấy giống nhau. Trình duyệt vẫn giữ một bản sao để dùng khi mất mạng; thay đổi lúc đó sẽ tự lưu lên khi có kết nối."),
    h("div", { class: "row" }, syncChip(), h("span", { class: "muted" }, last)),
    h("label", { for: "srvBase" }, "Địa chỉ máy chủ", base),
    h("label", { for: "srvToken" }, "Mã truy cập", token),
    h("div", { class: "row" },
      h("button", { class: "btn primary", type: "submit" }, "Kết nối và đồng bộ"),
      h("button", { class: "btn", type: "button", onclick: async () => { st.textContent = "Đang đồng bộ…"; await syncAll(); st.textContent = SYNC.msg; } }, "Đồng bộ ngay"),
      h("button", { class: "btn", type: "button", onclick: () => { saveConfig({ mode: "off" }); SYNC.enabled = false; initSync(onRemoteChange); st.textContent = "Đã tắt. Dữ liệu chỉ lưu trên trình duyệt này."; } }, "Tắt đồng bộ")),
    st);
  form.addEventListener("submit", async e => {
    e.preventDefault(); st.classList.remove("err"); st.textContent = "Đang kiểm tra…";
    const err = await testServer(base.value.trim(), token.value.trim());
    if (err) { st.textContent = err; st.classList.add("err"); return; }
    saveConfig({ mode: "on", base: base.value.trim(), token: token.value.trim() });
    await initSync(onRemoteChange); st.textContent = SYNC.msg;
  });
  root.append(h("a", { class: "back", href: "#" }, "‹ Thư viện"), form, installCard(),
    h("section", { class: "sec how" }, h("h2", null, "Chạy máy chủ"),
      h("ol", null,
        h("li", null, "Trên máy tính: ", h("code", null, "npm run serve"), " (hoặc ", h("code", null, "node tools/serve.js"), "). Cửa sổ lệnh sẽ in địa chỉ cho điện thoại cùng Wi-Fi, dạng http://192.168.x.x:8080."),
        h("li", null, "Muốn mở khi ra ngoài: đưa máy chủ lên Internet (VPS, Render, Railway, Fly.io… có ổ đĩa lưu lâu dài) hoặc dùng Tailscale để điện thoại vào được máy tính ở nhà. Khi mở ra Internet, đặt biến môi trường PTP_TOKEN rồi nhập mã đó ở ô trên."),
        h("li", null, "Xem chi tiết trong docs/MAY-CHU.md của repo."))));
}

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1") && !/claude\.ai|claudeusercontent/.test(location.hostname)) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

route();
initSync(onRemoteChange);
