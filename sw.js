// Offline cache for the app shell. Network first, so a new deploy shows up on the next load;
// the cache answers when the network is off.
// SPDX-License-Identifier: GPL-3.0-or-later
const CACHE = 'rac-tracker-v1';
const FILES = [
  './', './index.html', './css/app.css',
  './js/app.js', './js/save.js', './js/data.js', './js/dom.js',
  './js/ui-progress.js', './js/ui-planets.js', './js/ui-save.js',
  './data/rac1/planets.json', './data/rac1/items.json',
  './data/rac1/gold-bolts.json', './data/rac1/skill-points.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === 'navigate') return (await cache.match('./index.html')) ?? Response.error();
      return Response.error();
    }
  })());
});
