const CACHE = 'wulkan-v1';
const ASSETS = [
  '/wulkan-/',
  '/wulkan-/index.html',
  '/wulkan-/manifest.json',
  '/wulkan-/icon-192.png',
  '/wulkan-/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Share+Tech+Mono&display=swap',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Firebase i API — zawsze sieć
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis.com/identitytoolkit') ||
      e.request.url.includes('wl-api.mf.gov.pl')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
