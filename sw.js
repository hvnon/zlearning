/* Service worker của trang chủ zzzlearning (phạm vi: cả thư mục, nhưng chỉ lo trang chủ + font + icon).
   Hai app con (toan/, saigon/) có service worker riêng với phạm vi hẹp hơn nên tự lo file của mình;
   request vào app con mà chưa có sw riêng thì cho đi mạng bình thường.
   Thêm file cho trang chủ thì thêm vào ASSETS và tăng VERSION. */
const VERSION = 'v5';
const CACHE = 'zzzlearning-' + VERSION;
const FONTS = ['Baloo2-500', 'Baloo2-700', 'Baloo2-800', 'BeVietnamPro-400', 'BeVietnamPro-500', 'BeVietnamPro-600']
  .flatMap(f => ['latin', 'latin-ext', 'vietnamese'].map(r => `./fonts/${f}-${r}.woff2`));
const ASSETS = [
  './', './index.html', './zzz.js', './phuhuynh/index.html', './manifest.webmanifest', './fonts/fonts.css', ...FONTS,
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png',
  './toan/icons/icon-192.png', './saigon/icons/icon-192.png'
];
const BASE = new URL('./', self.location.href).pathname;
const ASSET_PATHS = new Set(ASSETS.map(a => new URL(a, self.location.href).pathname));

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  // Xóa bản cũ của trang chủ và cache của Vở Ôn Toán thời còn nằm ở thư mục gốc (v1..v5); toan/sw.js giờ dùng cache riêng.
  // (BASE = thư mục của trang chủ, ví dụ /zlearning/)
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => (k.startsWith('zzzlearning-') && k !== CACHE) || /^vo-on-toan-v[1-5]$/.test(k)).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // trang của trang chủ (/, /phuhuynh/): cache theo file index.html của thư mục đó; file khác của app con thì bỏ qua
  let key = null;
  if (req.mode === 'navigate') { const p = url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname; if (ASSET_PATHS.has(p) && !/\/(toan|saigon)\//.test(p)) key = new Request(new URL(p, location.href).href); }
  else if (ASSET_PATHS.has(url.pathname)) key = req;
  if (!key) return; // của app con: đi mạng, sw của app con sẽ lo khi đã cài
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(key, { ignoreSearch: true });
    const fresh = fetch(req).then(res => { if (res.ok) cache.put(key, res.clone()); return res; }).catch(() => null);
    if (cached) { e.waitUntil(fresh); return cached; }
    return (await fresh) || new Response('Offline', { status: 503 });
  })());
});
