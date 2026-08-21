// SL Curtain — Service Worker
// Forces a fresh network fetch for the main HTML on every load,
// fixing the iOS home screen shortcut caching issue on GitHub Pages.

const CACHE = 'sl-curtain-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('fetch', e => {
  // Navigation requests (loading the HTML page) — always go to network
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(() => caches.match(e.request))  // offline fallback
    );
    return;
  }

  // All other assets (JS, CSS, CDN scripts) — network first, cache as fallback
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
