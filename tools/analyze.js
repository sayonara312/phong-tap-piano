#!/usr/bin/env node
// Dùng thử bộ phân tích và bộ sinh lộ trình từ dòng lệnh:
//   node tools/analyze.js bai.mid --start 2026-10-19 --target 2026-12-20 --days 1,3,5 --minutes 30 --level beginner --known keyboard,treble,rhythm
import fs from "fs";
import { parseMidi, buildSong } from "../js/midi.js";
import { analyze, DIFF_LABEL } from "../js/analyze.js";
import { plan } from "../js/planner.js";

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith("--") && !args[args.indexOf(a) - 1]?.startsWith("--"));
if (!file) { console.error("Cách dùng: node tools/analyze.js <file.mid> [--start YYYY-MM-DD] [--target YYYY-MM-DD] [--days 1,3,5] [--minutes 30] [--level beginner|reader|inter] [--known a,b] [--json]"); process.exit(1); }
const opt = k => { const i = args.indexOf("--" + k); return i >= 0 ? args[i + 1] : undefined; };
const buf = fs.readFileSync(file);
const song = buildSong(parseMidi(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length)));
const A = analyze(song);
const today = new Date().toISOString().slice(0, 10);
const P = plan(A, song, {
  start: opt("start") || today,
  target: opt("target") || new Date(Date.now() + 60 * 864e5).toISOString().slice(0, 10),
  weekdays: (opt("days") || "1,3,5").split(",").map(Number),
  minutes: +(opt("minutes") || 30), level: opt("level") || "beginner",
  known: (opt("known") || "").split(",").filter(Boolean)
});
if (args.includes("--json")) { console.log(JSON.stringify({ analysis: { ...A, bars: undefined }, plan: P }, null, 2)); process.exit(0); }
console.log(`${A.key.name}${A.key.detected ? " (đoán)" : ""} · nhịp ${A.meters.join(", ")} · ${A.barCount} ô · ${Math.round(A.duration)} giây`);
console.log("Đoạn:", A.sections.map(s => `${s.a}–${s.b} ${s.meter} ♩${Math.round(s.bpm)}`).join(" | "));
console.log("\nCâu:");
for (const p of P.selection) console.log(`  ${p.include ? "✓" : " "} ${p.label.padEnd(4)} ô ${String(p.a).padStart(3)}–${String(p.b).padEnd(3)} độ khó ${p.diff.toFixed(1)} (${DIFF_LABEL(p.diff)}) chi phí ${p.cost.toFixed(1)} buổi${p.repeatOf != null ? " · nhắc lại " + A.phrases[p.repeatOf].label : ""}`);
console.log(`\nBuổi: ${P.N} (nền tảng ${P.T}, học bài ${P.B}, hoàn thiện ${P.F}) · cần ${P.totalCost?.toFixed(1)} buổi học bài`);
console.log("Bản biểu diễn:", P.perfSegs.map(s => s[0] + "–" + s[1]).join(" → "));
P.warnings.forEach(w => console.log("! " + w));
console.log("");
for (const s of P.sessions) console.log(`${String(s.n).padStart(2)} ${s.date} ${s.phase.padEnd(16)} ${s.title}${s.theory && s.kind !== "theory" ? "  [" + s.theory.title + "]" : ""}`);
