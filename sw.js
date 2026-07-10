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
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
