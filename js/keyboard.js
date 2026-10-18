// Bàn phím piano vẽ bằng DOM: bấm để nghe, tô màu nốt theo tay, nhãn tên nốt.
import { h, nm, isBlack, NAMES } from "./util.js";
import { ensureAudio, playNote, nowA } from "./audio.js";

export class Keyboard {
  constructor(host, onPress) {
    this.host = host; this.onPress = onPress; this.keys = {}; this.marks = {}; this.labelAll = false;
    host.addEventListener("pointerdown", e => {
      const k = e.target.closest("[data-m]"); if (!k) return;
      e.preventDefault();
      const m = +k.dataset.m;
      ensureAudio().then(() => playNote(m, nowA() + 0.01, 0.9, 0.7));
      this.onPress && this.onPress(m);
    });
  }
  build(lo, hi) {
    this.lo = lo; this.hi = hi; this.host.innerHTML = ""; this.keys = {}; this.marks = {}; this.sig = "";
    let whites = 0; for (let m = lo; m <= hi; m++) if (!isBlack(m)) whites++;
    const w = 100 / whites; let wi = 0;
    for (let m = lo; m <= hi; m++) {
      if (isBlack(m)) continue;
      const k = h("div", { class: "wk-key" + (m === 60 ? " mid" : ""), "data-m": m, role: "button", "aria-label": nm(m) }, h("span", { class: "k-lbl" }));
      this.host.append(k); this.keys[m] = k;
    }
    for (let m = lo; m <= hi; m++) {
      if (!isBlack(m)) { wi++; continue; }
      const k = h("div", { class: "bk-key", "data-m": m, role: "button", "aria-label": nm(m) }, h("span", { class: "k-lbl" }));
      k.style.width = (w * 0.62) + "%"; k.style.left = "calc(" + (wi * w - w * 0.31) + "% + 2px)";
      this.host.append(k); this.keys[m] = k;
    }
    this.whites = whites;
    this.relabel();
  }
  relabel() {
    for (const m in this.keys) {
      const mm = +m; let t = "";
      if (NAMES.mode !== "off") { if (this.marks[m] || this.labelAll) t = nm(mm, mm % 12 === 0); else if (mm % 12 === 0) t = nm(mm); }
      this.keys[m].firstChild.textContent = t;
    }
  }
  mark(map) {
    const sig = JSON.stringify(map); if (sig === this.sig) return; this.sig = sig;
    for (const m in this.marks) { const k = this.keys[m]; if (k) k.className = k.className.replace(/\sk-[\w-]+/g, ""); }
    this.marks = {};
    for (const m in map) { const k = this.keys[m]; if (!k) continue; k.className += " " + map[m]; this.marks[m] = map[m]; }
    this.relabel();
  }
  keyX(m) { const k = this.keys[m]; return k ? { x: k.offsetLeft, w: k.offsetWidth } : null; }
}

export function rangeFor(lo, hi, minSpan = 24) {
  lo = Math.max(21, lo - 1); hi = Math.min(108, hi + 1);
  lo = lo - (lo % 12); hi = hi + (11 - (hi % 12));
  while (hi - lo + 1 < minSpan) { if (lo > 21) lo -= 12; else hi += 12; }
  return [Math.max(21, lo), Math.min(108, hi)];
}
