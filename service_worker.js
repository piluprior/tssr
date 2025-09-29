const CACHE_NAME = "site-cache-v1";
const OFFLINE_URL = "/offline.html";

const FILES_TO_CACHE = [
  OFFLINE_URL,
  "/offline.html",
  "/manifest.json",
  "/ASSET/offline_styles.css",
  "/IMG/fond.avif",
  "/IMG/icon_192.png",
  "/IMG/icon_256.png",
  "/IMG/icon_384.png",
  "/IMG/icon_512.png",
  "/IMG/logo.png"
];

// Installation du SW et pré-cache des fichiers essentiels
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation et nettoyage des anciens caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      if (event.request.mode === "navigate") {
        // Si navigation et offline → page custom
        return caches.match(OFFLINE_URL);
      }
      // Sinon → on renvoie ce qu’il y a dans le cache
      return caches.match(event.request);
    })
  );
});
