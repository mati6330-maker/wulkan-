const CACHE = 'wulkan-v4';
const ASSETS = [
  '/wulkan-/',
  '/wulkan-/index.html',
  '/wulkan-/manifest.json',
  '/wulkan-/icon-192.png',
  '/wulkan-/icon-512.png',
];

self.addEventListener('install', e => {
  self.skipWaiting(); // Przejmij kontrolę natychmiast
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()) // Przejmij wszystkich klientów
  );
});

self.addEventListener('fetch', e => {
  // Przepuść wszystkie zewnętrzne API bez cache
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('anthropic.com') ||
      e.request.url.includes('googleapis.com/identitytoolkit') ||
      e.request.url.includes('wl-api.mf.gov.pl') ||
      e.request.url.includes('gstatic.com')) {
    return; // nie obsługuj — przeglądarka wyśle normalnie
  }
  // Network first dla HTML — zawsze świeży index.html
  if (e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
