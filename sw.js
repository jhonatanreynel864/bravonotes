// Service worker mínimo — solo lo necesario para que el navegador
// considere que Bravonotes es instalable como app.
const CACHE_NAME = 'bravonotes-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

// Passthrough: no interferimos con las peticiones, solo hace que
// el navegador reconozca la app como "installable".
// Si la red falla y no hay nada en caché, dejamos que el navegador
// maneje el error de red de forma normal, en vez de romper la
// petición y mostrar un ERR_FAILED confuso.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      return fetch(event.request);
    })
  );
});
