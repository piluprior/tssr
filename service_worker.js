const CACHE_NAME = "offline-cache-v2";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        OFFLINE_URL,
        "/ASSET/offline_styles.css",
        "/IMG/logo.png"
      ]);
    })
  );
  self.skipWaiting(); // ⚡ prend la main tout de suite
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  clients.claim(); // ⚡ force tous les onglets à utiliser ce SW
});

self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  }
});
