/* Service worker: lưu toàn bộ app vào máy để chạy offline.
   Khi có mạng, app vẫn mở ngay từ bản đã lưu và tải bản mới ở nền; lần mở sau sẽ dùng bản mới.
   Thêm file mới vào app thì nhớ thêm vào ASSETS và tăng VERSION. Font dùng chung ở ../fonts/ (chung với zzzlearning và Đạp Xe Sài Gòn). */
const VERSION = 'v8';
const CACHE = 'vo-on-toan-' + VERSION;
const ASSETS = [
  './', './index.html', './manifest.webmanifest', '../zzz.js', '../fonts/fonts.css',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png',
  '../fonts/Baloo2-500-latin-ext.woff2',
  '../fonts/Baloo2-500-latin.woff2',
  '../fonts/Baloo2-500-vietnamese.woff2',
  '../fonts/Baloo2-700-latin-ext.woff2',
  '../fonts/Baloo2-700-latin.woff2',
  '../fonts/Baloo2-700-vietnamese.woff2',
  '../fonts/Baloo2-800-latin-ext.woff2',
  '../fonts/Baloo2-800-latin.woff2',
  '../fonts/Baloo2-800-vietnamese.woff2',
  '../fonts/BeVietnamPro-400-latin-ext.woff2',
  '../fonts/BeVietnamPro-400-latin.woff2',
  '../fonts/BeVietnamPro-400-vietnamese.woff2',
  '../fonts/BeVietnamPro-500-latin-ext.woff2',
  '../fonts/BeVietnamPro-500-latin.woff2',
  '../fonts/BeVietnamPro-500-vietnamese.woff2',
  '../fonts/BeVietnamPro-600-latin-ext.woff2',
  '../fonts/BeVietnamPro-600-latin.woff2',
  '../fonts/BeVietnamPro-600-vietnamese.woff2',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('vo-on-toan-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = req.mode === 'navigate' ? './index.html' : req;
    const cached = await cache.match(key, { ignoreSearch: req.mode === 'navigate' });
    const fresh = fetch(req).then(res => {
      if (res.ok) cache.put(key, res.clone());
      return res;
    }).catch(() => null);
    if (cached) { e.waitUntil(fresh); return cached; }
    return (await fresh) || new Response('Offline', { status: 503 });
  })());
});
