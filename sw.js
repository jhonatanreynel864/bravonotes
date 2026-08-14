// Service worker de Bravonotes.
// Además de dejar la app instalable, ahora también recibe y muestra
// las notificaciones push reales que manda el servidor.
const CACHE_NAME = 'bravonotes-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

// Solo tocamos peticiones GET dentro del propio dominio de la app
// (cargar la página, imágenes, css, js). Todo lo demás —subir archivos,
// llamadas a Supabase, o cualquier método que no sea GET— lo dejamos
// pasar de largo sin tocarlo, porque interceptarlo puede romper el
// cuerpo de la petición (por ejemplo, al subir una foto).
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req).catch(async () => {
      const cached = await caches.match(req);
      return cached || fetch(req);
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
