// Service worker de Bravonotes.
// - Deja la app instalable y que abra aunque no haya internet (antes no guardaba nada en caché).
// - Recibe y muestra las notificaciones push reales que manda el servidor.
const CACHE_NAME = 'bravonotes-v8-premium';
const APP_SHELL = [
  './',
  'index.html',
  'app.js',
  'snow.js',
  'lights.js',
  'manifest.json',
  'intro-poster.jpg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'icons/mascot-navidad.png',
  'icons/mascot-duende.png',
];
// Librerías y fuentes externas que también conviene guardar
const CDN_HOSTS = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.all(APP_SHELL.map((url) => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                 // subir archivos, guardar datos: no se toca
  if (req.headers.has('range')) return;             // el video usa peticiones parciales
  const url = new URL(req.url);

  // Mismo dominio: primero internet (para tener siempre lo último), si falla, la copia guardada.
  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith('/api/')) return;
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req, { ignoreSearch: req.mode === 'navigate' });
          if (cached) return cached;
          if (req.mode === 'navigate') {
            const shell = await caches.match('index.html') || await caches.match('./');
            if (shell) return shell;
          }
          return new Response('', { status: 504, statusText: 'Sin conexión' });
        })
    );
    return;
  }

  // Librería de Supabase y fuentes: se usa la copia guardada y se actualiza por detrás.
  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => { if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()).catch(() => {}); return res; })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
  // Todo lo demás (Supabase, Google...) pasa directo.
});

// ---------- Notificaciones push reales ----------
self.addEventListener('push', (event) => {
  let payload = { title: 'Bravonotes', body: '' };
  try { payload = event.data.json(); } catch (e) {
    try { payload.body = event.data ? event.data.text() : ''; } catch (e2) {}
  }
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
