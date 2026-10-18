// Service worker: lưu sẵn giao diện và tiếng đàn để mở được khi mất mạng.
// Dữ liệu bài và tiến độ không đi qua đây (nằm trong localStorage + máy chủ /api).
const VERSION = "ptp-v2";
const SHELL = [
  "./", "index.html", "manifest.webmanifest", "css/style.css",
  "js/app.js", "js/util.js", "js/midi.js", "js/analyze.js", "js/modules.js", "js/planner.js", "js/audio.js", "js/keyboard.js", "js/studio.js", "js/sync.js",
  "presets/index.js", "presets/mr-lawrence.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/favicon.png", "icons/apple-touch-icon.png"
];
const SAMPLES = ["A1","A2","A3","A4","A5","A6","C2","C3","C4","C5","C6","C7","Ds2","Ds3","Ds4","Ds5","Ds6","Fs2","Fs3","Fs4","Fs5","Fs6"].map(n => "samples/" + n + ".mp3");

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL).then(() => c.addAll(SAMPLES).catch(() => {}))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.includes("/api/")) return;
  // Mã và giao diện: lấy bản mới khi có mạng, dùng bản đã lưu khi mất mạng. Tiếng đàn: dùng bản đã lưu trước.
  const isSample = url.pathname.endsWith(".mp3");
  e.respondWith(isSample
    ? caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; }))
    : fetch(e.request).then(r => { if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); } return r; }).catch(() => caches.match(e.request).then(hit => hit || caches.match("index.html"))));
});
