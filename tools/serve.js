#!/usr/bin/env node
// Máy chủ của Phòng tập piano: phục vụ trang tĩnh + API lưu dữ liệu (bài, lịch, tiến độ) thành file JSON.
// Không cần cài thêm gói nào. Chạy:  node tools/serve.js [cổng]
//
// Biến môi trường:
//   PORT       cổng (mặc định 8080)
//   DATA_DIR   thư mục lưu dữ liệu (mặc định ./data)
//   PTP_TOKEN  mã truy cập. Nếu đặt, mọi lệnh /api phải gửi "Authorization: Bearer <mã>".
//              Nên đặt khi mở máy chủ ra Internet.
import http from "http";
import fs from "fs";
import fsp from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = +(process.argv[2] || process.env.PORT || 8080);
const DATA = path.resolve(process.env.DATA_DIR || path.join(root, "data"));
const TOKEN = process.env.PTP_TOKEN || "";
const MAX_BODY = 12 * 1024 * 1024;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json", ".mp3": "audio/mpeg", ".svg": "image/svg+xml", ".png": "image/png", ".txt": "text/plain; charset=utf-8", ".ico": "image/x-icon" };
const KINDS = { songs: "songs", progress: "progress" };
const ID = /^[a-z0-9]{4,40}$/;

for (const k of Object.values(KINDS)) fs.mkdirSync(path.join(DATA, k), { recursive: true });

function send(res, code, body, headers = {}) {
  const isObj = body !== undefined && typeof body !== "string" && !Buffer.isBuffer(body);
  res.writeHead(code, { "Content-Type": isObj ? "application/json; charset=utf-8" : "text/plain; charset=utf-8", "Cache-Control": "no-store", ...headers });
  res.end(isObj ? JSON.stringify(body) : body);
}
function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
}
function authorized(req) {
  if (!TOKEN) return true;
  const got = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(got), b = Buffer.from(TOKEN);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", c => { size += c.length; if (size > MAX_BODY) { reject(Object.assign(new Error("Dữ liệu quá lớn"), { code: 413 })); req.destroy(); } else chunks.push(c); });
    req.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); } catch { reject(Object.assign(new Error("JSON không hợp lệ"), { code: 400 })); } });
    req.on("error", reject);
  });
}
const file = (kind, id) => path.join(DATA, kind, id + ".json");
async function readJSON(p) { try { return JSON.parse(await fsp.readFile(p, "utf8")); } catch { return null; } }
async function writeJSON(p, obj) { const tmp = p + "." + process.pid + ".tmp"; await fsp.writeFile(tmp, JSON.stringify(obj)); await fsp.rename(tmp, p); }

async function api(req, res, parts) {
  if (req.method === "OPTIONS") return send(res, 204, "");
  if (parts[0] === "health") return send(res, 200, { app: "phong-tap-piano", ok: true, auth: !!TOKEN, time: new Date().toISOString() });
  if (!authorized(req)) return send(res, 401, { error: "Sai hoặc thiếu mã truy cập" });
  const kind = KINDS[parts[0]]; const id = parts[1];
  if (!kind) return send(res, 404, { error: "Không có API này" });

  if (!id) {
    if (req.method !== "GET") return send(res, 405, { error: "Phương thức không hỗ trợ" });
    const names = (await fsp.readdir(path.join(DATA, kind))).filter(f => f.endsWith(".json"));
    const out = [];
    for (const f of names) {
      const d = await readJSON(path.join(DATA, kind, f)); if (!d) continue;
      out.push(kind === "songs" ? { id: d.id, name: d.name, updatedAt: d.updatedAt || 0, deleted: !!d.deleted } : { id: f.slice(0, -5), updatedAt: d.updatedAt || 0 });
    }
    return send(res, 200, out);
  }
  if (!ID.test(id)) return send(res, 400, { error: "Mã bài không hợp lệ" });
  const p = file(kind, id);

  if (req.method === "GET") { const d = await readJSON(p); return d ? send(res, 200, d) : send(res, 404, { error: "Chưa có dữ liệu" }); }
  if (req.method === "PUT") {
    const body = await readBody(req);
    if (typeof body !== "object" || Array.isArray(body)) return send(res, 400, { error: "Dữ liệu phải là một object" });
    const cur = await readJSON(p);
    if (kind === "progress") {
      // Tiến độ được gộp: buổi nào đã đạt ở bất kỳ thiết bị nào thì giữ là đạt.
      const merged = mergeProgress(cur || {}, body);
      await writeJSON(p, merged); return send(res, 200, merged);
    }
    if (body.id !== id) return send(res, 400, { error: "id không khớp" });
    if (cur && (cur.updatedAt || 0) > (body.updatedAt || 0)) return send(res, 409, cur);
    await writeJSON(p, body); return send(res, 200, { ok: true, updatedAt: body.updatedAt });
  }
  if (req.method === "DELETE") {
    // Giữ lại một "bia mộ" để thiết bị khác biết bài đã bị xóa.
    await writeJSON(p, kind === "songs" ? { id, deleted: true, updatedAt: Date.now() } : { updatedAt: Date.now() });
    return send(res, 200, { ok: true });
  }
  return send(res, 405, { error: "Phương thức không hỗ trợ" });
}

export function mergeProgress(a, b) {
  const out = { updatedAt: Math.max(a.updatedAt || 0, b.updatedAt || 0, Date.now()) };
  for (const src of [a, b]) for (const k in src) {
    if (k === "updatedAt") continue;
    const x = src[k]; if (!x || typeof x !== "object") continue;
    const o = out[k] || (out[k] = { done: false, pass: [] });
    o.done = o.done || !!x.done;
    (x.pass || []).forEach((v, i) => { o.pass[i] = !!(o.pass[i] || v); });
    if (x.note && (!o.note || (x.noteAt || 0) > (o.noteAt || 0))) { o.note = x.note; o.noteAt = x.noteAt; }
  }
  return out;
}

async function stat(req, res, p) {
  if (p.endsWith("/")) p += "index.html";
  const f = path.join(root, p);
  if (!f.startsWith(root + path.sep) || f.startsWith(DATA)) return send(res, 403, "Không được phép");
  try {
    const data = await fsp.readFile(f);
    const ext = path.extname(f);
    res.writeHead(200, { "Content-Type": TYPES[ext] || "application/octet-stream", "Cache-Control": ext === ".mp3" || ext === ".png" ? "public, max-age=604800" : "no-cache" });
    res.end(data);
  } catch { send(res, 404, "Không tìm thấy " + p); }
}

const server = http.createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.startsWith("/api/")) { cors(res); return await api(req, res, p.slice(5).split("/").filter(Boolean)); }
    if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Phương thức không hỗ trợ");
    return await stat(req, res, p);
  } catch (e) { send(res, e.code >= 400 && e.code < 600 ? e.code : 500, { error: e.message || "Lỗi máy chủ" }); }
});

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  server.listen(port, "0.0.0.0", () => {
    console.log("Phòng tập piano đang chạy:");
    console.log("  Trên máy này:   http://localhost:" + port);
    for (const list of Object.values(os.networkInterfaces())) for (const a of list || []) if (a.family === "IPv4" && !a.internal) console.log("  Điện thoại cùng Wi-Fi: http://" + a.address + ":" + port);
    console.log("  Dữ liệu lưu ở: " + DATA + (TOKEN ? "  (có mã truy cập)" : "  (chưa đặt PTP_TOKEN)"));
    console.log("Nhấn Ctrl+C để dừng.");
  });
}
export { server };
