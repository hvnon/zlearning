/* Service worker của Đạp Xe Sài Gòn: lưu toàn bộ game vào máy để chạy offline.
   Có mạng thì vẫn mở ngay từ bản đã lưu và tải bản mới ở nền; lần mở sau dùng bản mới.
   Thêm file mới thì nhớ thêm vào ASSETS và tăng VERSION. Font dùng chung với Vở Ôn Toán ở ../fonts/. */
const VERSION = 'v3';
const CACHE = 'dap-xe-sai-gon-' + VERSION;
const FONTS = ['Baloo2-500', 'Baloo2-700', 'Baloo2-800', 'BeVietnamPro-400', 'BeVietnamPro-500', 'BeVietnamPro-600']
  .flatMap(f => ['latin', 'latin-ext', 'vietnamese'].map(r => `../fonts/${f}-${r}.woff2`));
const ASSETS = [
  './', './index.html', './manifest.webmanifest', './data.js', './game.js', './world.js', './vendor/three.module.min.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png',
  '../zzz.js', '../fonts/fonts.css', ...FONTS
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('dap-xe-sai-gon-') && k !== CACHE).map(k => caches.delete(k))))
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
