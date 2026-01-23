const CACHE_NAME = 'dewa-ban-v36.2'; // v36.2 - Natural Scroll HP Landscape
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.json',
  './img/logo.png',
  './img/jasa.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
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
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  const url = new URL(request.url);
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
