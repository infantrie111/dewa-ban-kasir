// DEWA BAN POS — Service Worker v4.10-safe-ui
// Smart Auto-Routing: USB OTG → RawBT Intent
// ========================================

const CACHE_NAME = 'dewa-ban-v4.10-safe-ui';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.json',
  './img/logo.png',
  './img/jasa.png',
  './img/logoapkbaru.png'
];

// ── INSTALL ─────────────────────────────
// skipWaiting() agar SW baru langsung aktif tanpa menunggu tab ditutup
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// ── ACTIVATE ────────────────────────────
// Hapus SEMUA cache lama (termasuk v55-monthly-report, dll)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log(`[SW] 🗑️ Purging old cache: ${key}`);
            return caches.delete(key);
          })
      )
    )
  );
  // Ambil kontrol semua tab yang terbuka (tanpa perlu reload manual)
  self.clients.claim();
});

// ── FETCH ───────────────────────────────
// Strategi:
//   App Shell (navigate / index.html / app.js / style.css) → Network First, fallback Cache
//   Aset lain same-origin → Cache First, fallback Network
//   Cross-origin (Firebase, CDN, dsb) → Network Only (tidak di-cache)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // Jangan cache cross-origin requests (Firebase, CDN Bootstrap, dll)
  if (!isSameOrigin) return;

  const path = url.pathname.replace(/\/+$/, '');
  const isAppShell =
    request.mode === 'navigate' ||
    path.endsWith('/index.html') ||
    path.endsWith('/js/app.js') ||
    path.endsWith('/css/style.css');

  event.respondWith(
    (async () => {
      // ── APP SHELL: Network First ──────────
      if (isAppShell) {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (_) {
          const cached = await caches.match(request);
          return cached || caches.match('./index.html');
        }
      }

      // ── ASET LAIN: Cache First ────────────
      const cached = await caches.match(request);
      if (cached) return cached;

      try {
        const response = await fetch(request);
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
        return response;
      } catch (_) {
        // Offline dan tidak ada cache — tampilkan index.html sebagai fallback
        return caches.match('./index.html');
      }
    })()
  );
});
