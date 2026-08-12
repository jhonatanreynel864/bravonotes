// Service worker de Bravonotes.
// Además de dejar la app instalable, ahora también recibe y muestra
// las notificaciones push reales que manda el servidor.
const CACHE_NAME = 'bravonotes-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      return fetch(event.request);
    })
  );
});

// ---------- Notificaciones push reales ----------
self.addEventListener('push', (event) => {
  let payload = { title: 'Bravonotes', body: '' };
  try { payload = event.data.json(); } catch (e) {}
  event.waitUntil(
    self.registration.showNotification(payload.title || 'Bravonotes', {
      body: payload.body || '',
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      vibrate: [100, 50, 100],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});
