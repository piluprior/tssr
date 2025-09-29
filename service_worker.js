const CACHE_NAME = "site-cache-v1";
const OFFLINE_URL = "/offline.html";

const FILES_TO_CACHE = [
  OFFLINE_URL,
  "/ASSET/offline_styles.css",
  "/IMG/logo.png"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      if (event.request.mode === "navigate") {
        return caches.match(OFFLINE_URL);
      } else {
        return caches.match(event.request);
      }
    })
  );
});
