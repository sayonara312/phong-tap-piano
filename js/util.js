// Tiện ích dùng chung: tạo DOM, lưu trữ cục bộ, tên nốt, ngày tháng.

export function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === "class") e.className = v;
    else if (k === "text") e.textContent = v;
    else if (k === "style" && typeof v === "object") Object.assign(e.style, v);
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? "" : v);
  }
  for (const c of kids.flat(Infinity)) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}

export const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch {} }
};

/* ── Tên nốt ── */
const SOL_FLAT  = ["Đô","Rê♭","Rê","Mi♭","Mi","Fa","Sol♭","Sol","La♭","La","Si♭","Si"];
const SOL_SHARP = ["Đô","Đô♯","Rê","Rê♯","Mi","Fa","Fa♯","Sol","Sol♯","La","La♯","Si"];
const LET_FLAT  = ["C","D♭","D","E♭","E","F","G♭","G","A♭","A","B♭","B"];
const LET_SHARP = ["C","C♯","D","D♯","E","F","F♯","G","G♯","A","A♯","B"];
export const NAMES = { mode: store.get("ptp-names", "sol"), sf: -1 };
export function setNameMode(m) { NAMES.mode = m; store.set("ptp-names", m); }
export const pc = m => ((m % 12) + 12) % 12;
export function nm(m, oct = true, sf = NAMES.sf) {
  const sharp = sf > 0;
  const arr = NAMES.mode === "let" ? (sharp ? LET_SHARP : LET_FLAT) : (sharp ? SOL_SHARP : SOL_FLAT);
  return arr[pc(m)] + (oct ? (Math.floor(m / 12) - 1) : "");
}
export const isBlack = m => [1, 3, 6, 8, 10].includes(pc(m));
export const fmtNum = x => String(Math.round(x * 100) / 100).replace(".", ",");

/* ── Giọng ── */
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
export function keyInfo(sf, minor) {
  const majTonic = pc(sf * 7);
  const tonic = minor ? pc(majTonic + 9) : majTonic;
  const scale = minor ? [0, 2, 3, 5, 7, 8, 10].map(x => pc(tonic + x)) : MAJOR.map(x => pc(tonic + x));
  const name = nm(60 + tonic, false, sf) + (minor ? " thứ" : " trưởng");
  const accNames = sf < 0 ? ["Si","Mi","La","Rê","Sol","Đô","Fa"].slice(0, -sf) : ["Fa","Đô","Sol","Rê","La","Mi","Si"].slice(0, sf);
  return { sf, minor: !!minor, tonic, scale, name, accNames, accSymbol: sf < 0 ? "♭" : "♯" };
}

/* ── Ngày (giờ Việt Nam) ── */
export const todayVN = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
export const dayDiff = (a, b) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 864e5);
export const addDays = (iso, n) => new Date(Date.parse(iso + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);
export const weekday = iso => new Date(iso + "T00:00:00Z").getUTCDay(); // 0 = CN
export function fmtDate(iso, long = true) {
  const d = new Date(iso + "T00:00:00Z"); const wd = d.getUTCDay();
  const w = wd === 0 ? "Chủ nhật" : "Thứ " + (wd + 1);
  return (long ? w + ", " : "") + d.getUTCDate() + "/" + (d.getUTCMonth() + 1);
}
export function mondayOf(iso) { const wd = weekday(iso); return addDays(iso, wd === 0 ? -6 : 1 - wd); }
export const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
