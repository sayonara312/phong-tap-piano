// Đồng bộ với máy chủ (tools/serve.js). Trình duyệt vẫn giữ bản sao trong localStorage để dùng khi mất mạng;
// mọi thay đổi được đánh dấu "chưa lưu" và đẩy lên máy chủ ngay khi có kết nối.
import { store } from "./util.js";

const CFG = "ptp-sync";
export const SYNC = {
  cfg: store.get(CFG, { mode: "auto", base: "", token: "" }), // mode: auto | on | off
  status: "off", msg: "", lastOk: store.get("ptp-sync-last", 0),
  dirty: new Set(store.get("ptp-dirty", [])),
  enabled: false, timer: null, listeners: new Set(), onRemote: null, busy: false
};
const saveDirty = () => store.set("ptp-dirty", [...SYNC.dirty]);
function setStatus(status, msg = "") { SYNC.status = status; SYNC.msg = msg; SYNC.listeners.forEach(f => { try { f(SYNC); } catch {} }); }
export const onSync = fn => { SYNC.listeners.add(fn); return () => SYNC.listeners.delete(fn); };
export function saveConfig(cfg) { SYNC.cfg = { ...SYNC.cfg, ...cfg }; store.set(CFG, SYNC.cfg); }

const apiUrl = p => (SYNC.cfg.base ? SYNC.cfg.base.replace(/\/+$/, "") + "/api/" : "api/") + p;
async function call(method, p, body) {
  const headers = { "Content-Type": "application/json" };
  if (SYNC.cfg.token) headers.Authorization = "Bearer " + SYNC.cfg.token;
  let r;
  try { r = await fetch(apiUrl(p), { method, headers, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store" }); }
  catch { throw Object.assign(new Error("offline"), { offline: true }); }
  if (r.status === 401) throw Object.assign(new Error("auth"), { auth: true });
  const data = await r.json().catch(() => null);
  if (r.status === 409) return { conflict: true, data };
  if (!r.ok) throw Object.assign(new Error((data && data.error) || "HTTP " + r.status), { status: r.status });
  return { data };
}

/* Gộp tiến độ: buổi đã đạt ở thiết bị nào cũng giữ là đạt. */
export function mergeProgress(a = {}, b = {}) {
  const out = { updatedAt: Math.max(a.updatedAt || 0, b.updatedAt || 0) };
  for (const src of [a, b]) for (const k in src) {
    if (k === "updatedAt") continue; const x = src[k]; if (!x || typeof x !== "object") continue;
    const o = out[k] || (out[k] = { done: false, pass: [] });
    o.done = o.done || !!x.done; (x.pass || []).forEach((v, i) => { o.pass[i] = !!(o.pass[i] || v); });
  }
  return out;
}

const strip = p => { const o = {}; for (const k in p || {}) if (k !== "updatedAt") o[k] = { done: !!p[k].done, pass: (p[k].pass || []).map(Boolean) }; return JSON.stringify(o); };
const sameProgress = (a, b) => strip(a) === strip(b);

export async function initSync(onRemote) {
  SYNC.onRemote = onRemote;
  if (SYNC.cfg.mode === "off") { SYNC.enabled = false; return setStatus("off", "Chỉ lưu trên trình duyệt này"); }
  setStatus("checking", "Đang tìm máy chủ…");
  try {
    const { data } = await call("GET", "health");
    if (!data || data.app !== "phong-tap-piano") throw new Error("not ours");
    SYNC.enabled = true;
    if (SYNC.cfg.mode === "auto") saveConfig({ mode: "on" });
  } catch (e) {
    SYNC.enabled = false;
    if (SYNC.cfg.mode === "on") return setStatus(e.offline ? "offline" : "error", e.offline ? "Không kết nối được máy chủ. Thay đổi sẽ được lưu khi có mạng." : "Địa chỉ này không phải máy chủ Phòng tập piano.");
    return setStatus("off", "Chỉ lưu trên trình duyệt này");
  }
  await syncAll();
  window.addEventListener("online", () => syncAll());
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") syncAll(); });
  setInterval(() => { if (document.visibilityState === "visible") syncAll(); }, 60000);
}

export function markDirty(kind, id) {
  SYNC.dirty.add(kind + ":" + id); saveDirty();
  if (!SYNC.enabled && SYNC.cfg.mode !== "on") return;
  clearTimeout(SYNC.timer); SYNC.timer = setTimeout(() => flush(), 800);
}

async function flush() {
  if (SYNC.busy) { clearTimeout(SYNC.timer); SYNC.timer = setTimeout(flush, 1000); return false; }
  if (!SYNC.dirty.size) return false;
  SYNC.busy = true; setStatus("saving", "Đang lưu lên máy chủ…"); let changed = false;
  try {
    for (const key of [...SYNC.dirty]) {
      const [kind, id] = key.split(":");
      if (kind === "song") {
        const rec = store.get("ptp-song-" + id, null);
        if (!rec) { await call("DELETE", "songs/" + id); }
        else {
          const r = await call("PUT", "songs/" + id, rec);
          if (r.conflict && r.data) { if (r.data.deleted) removeLocal(id); else store.set("ptp-song-" + id, r.data); changed = true; }
        }
      } else if (kind === "prog") {
        const local = store.get("ptp-prog-" + id, {});
        const r = await call("PUT", "progress/" + id, local);
        if (r.data) { const changedHere = sameProgress(r.data, local) === false; store.set("ptp-prog-" + id, r.data); if (changedHere) changed = true; }
      }
      SYNC.dirty.delete(key); saveDirty();
    }
    ok();
  } catch (e) { fail(e); }
  SYNC.busy = false;
  if (changed && SYNC.onRemote) SYNC.onRemote();
  return changed;
}

function removeLocal(id) {
  store.del("ptp-song-" + id); store.del("ptp-prog-" + id);
  store.set("ptp-songs", store.get("ptp-songs", []).filter(s => s.id !== id));
}
function ok() { SYNC.lastOk = Date.now(); store.set("ptp-sync-last", SYNC.lastOk); setStatus("ok", "Đã lưu trên máy chủ"); }
function fail(e) {
  if (e.auth) setStatus("auth", "Máy chủ yêu cầu mã truy cập (hoặc mã chưa đúng).");
  else if (e.offline) setStatus("offline", "Mất kết nối máy chủ. Thay đổi sẽ được lưu khi có mạng.");
  else setStatus("error", "Lỗi khi đồng bộ: " + e.message);
}

// Kéo thay đổi từ máy chủ về và đẩy thay đổi của máy này lên.
export async function syncAll() {
  if (!SYNC.enabled || SYNC.busy) return false;
  SYNC.busy = true; setStatus("saving", "Đang đồng bộ…"); let changed = false;
  try {
    const { data: remote } = await call("GET", "songs");
    const list = store.get("ptp-songs", []); const ids = new Set(list.map(s => s.id));
    for (const r of remote || []) {
      const local = store.get("ptp-song-" + r.id, null);
      if (r.deleted) { if (local && !SYNC.dirty.has("song:" + r.id)) { removeLocal(r.id); changed = true; } continue; }
      if (!local || (local.updatedAt || 0) < r.updatedAt) {
        const { data } = await call("GET", "songs/" + r.id);
        if (data && !data.deleted) {
          if (!store.set("ptp-song-" + r.id, data)) throw new Error("Bộ nhớ trình duyệt đã đầy");
          if (!ids.has(r.id)) { list.push({ id: r.id, name: data.name }); ids.add(r.id); }
          else list.forEach(s => { if (s.id === r.id) s.name = data.name; });
          changed = true;
        }
      } else if ((local.updatedAt || 0) > r.updatedAt) SYNC.dirty.add("song:" + r.id);
    }
    store.set("ptp-songs", list);
    const remoteIds = new Set((remote || []).map(r => r.id));
    for (const s of list) { if (!remoteIds.has(s.id)) SYNC.dirty.add("song:" + s.id); SYNC.dirty.add("prog:" + s.id); }
    saveDirty();
  } catch (e) { SYNC.busy = false; fail(e); return false; }
  SYNC.busy = false;
  const pushed = await flush();
  if (changed && SYNC.onRemote) SYNC.onRemote();
  return changed || pushed;
}

export async function testServer(base, token) {
  const prev = SYNC.cfg; SYNC.cfg = { ...prev, base, token };
  try { const { data } = await call("GET", "health"); if (!data || data.app !== "phong-tap-piano") return "Địa chỉ này không phải máy chủ Phòng tập piano."; await call("GET", "songs"); return ""; }
  catch (e) { return e.auth ? "Mã truy cập chưa đúng." : e.offline ? "Không kết nối được tới địa chỉ này." : e.message; }
  finally { SYNC.cfg = prev; }
}
