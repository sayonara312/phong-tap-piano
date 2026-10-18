// Âm thanh: bộ lấy mẫu piano (Salamander Grand Piano, CC BY 3.0) + tiếng metronome.
const SAMPLES = ["A1","A2","A3","A4","A5","A6","C2","C3","C4","C5","C6","C7","Ds2","Ds3","Ds4","Ds5","Ds6","Fs2","Fs3","Fs4","Fs5","Fs6"];
const sampleMidi = n => { const p = { C: 0, Ds: 3, Fs: 6, A: 9 }[n.replace(/\d/g, "")]; return (+n.match(/\d/)[0] + 1) * 12 + p; };
export const AU = { ctx: null, buf: {}, loading: null, master: null, live: [], ready: false, failed: false, base: "samples/" };

export function ensureAudio() {
  if (!AU.ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) { AU.failed = true; return Promise.resolve(); }
    AU.ctx = new C();
    AU.master = AU.ctx.createGain(); AU.master.gain.value = 0.85;
    const comp = AU.ctx.createDynamicsCompressor(); comp.threshold.value = -12;
    AU.master.connect(comp).connect(AU.ctx.destination);
  }
  if (AU.ctx.state === "suspended") AU.ctx.resume();
  if (!AU.loading) {
    AU.loading = Promise.all(SAMPLES.map(async n => {
      const r = await fetch(AU.base + n + ".mp3");
      if (!r.ok) throw new Error("sample " + n);
      AU.buf[sampleMidi(n)] = await AU.ctx.decodeAudioData(await r.arrayBuffer());
    })).then(() => { AU.ready = true; }).catch(() => { AU.failed = true; });
  }
  return AU.loading;
}
function nearest(m) { let best = null, bd = 99; for (const k in AU.buf) { const d = Math.abs(k - m); if (d < bd) { bd = d; best = +k; } } return best; }
function track(src, g) { const rec = { src, g }; AU.live.push(rec); src.onended = () => { const i = AU.live.indexOf(rec); if (i >= 0) AU.live.splice(i, 1); }; }
export function playNote(m, when, dur, vel = 0.7) {
  const ctx = AU.ctx; if (!ctx || !AU.ready) return;
  const s = nearest(m); if (s == null) return;
  const src = ctx.createBufferSource(); src.buffer = AU.buf[s];
  src.playbackRate.value = Math.pow(2, (m - s) / 12);
  const g = ctx.createGain(); const peak = 0.6 * vel;
  g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(peak, when + 0.005);
  const end = when + Math.max(0.09, dur);
  g.gain.setTargetAtTime(0, end, 0.11);
  src.connect(g).connect(AU.master); src.start(when); src.stop(end + 0.7); track(src, g);
}
export function stopSound() {
  if (!AU.ctx) return; const now = AU.ctx.currentTime;
  for (const r of AU.live) { try { r.g.gain.cancelScheduledValues(now); r.g.gain.setTargetAtTime(0, now, 0.03); r.src.stop(now + 0.15); } catch {} }
  AU.live = [];
}
export function click(when, acc) {
  const ctx = AU.ctx; if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.value = acc ? 1560 : 1040;
  g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(acc ? 0.32 : 0.2, when + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
  o.connect(g).connect(AU.master); o.start(when); o.stop(when + 0.06); track(o, g);
}
export function chime() { if (!AU.ready) return; const t = AU.ctx.currentTime + 0.02; playNote(73, t, 0.8, 0.5); playNote(80, t + 0.18, 1.2, 0.5); }
export const nowA = () => AU.ctx ? AU.ctx.currentTime : 0;
