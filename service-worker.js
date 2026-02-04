const CACHE_NAME = 'dewa-ban-v53.4-edit-upgrade'; // v53.4 - Edit Upgrade with Image & Brand
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

self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  const url = new URL(request.url);

  // JANGAN cache request ke RawBT Printer Server (localhost:40213)
  if (url.hostname === 'localhost' && url.port === '40213') {
    event.respondWith(fetch(request));
    return;
  }

  const isSameOrigin = url.origin === self.location.origin;
  const path = isSameOrigin ? url.pathname.replace(/\/+$/, '') : '';
  const isAppShell = isSameOrigin && (
    request.mode === 'navigate' ||
    path.endsWith('/index.html') ||
    path.endsWith('/js/app.js')
  );

  event.respondWith(
    (async () => {
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
        return caches.match('./index.html');
      }
    })()
  );
});
