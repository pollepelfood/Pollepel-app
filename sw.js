// Pollepel — service worker
// Zorgt dat de app-shell (HTML/CSS/JS/iconen) offline beschikbaar blijft na een eerste bezoek.
// Data zelf (recepten/voorraad/boodschappen) blijft afhankelijk van je backend-verbinding —
// dit cachet alleen de "vormgeving" van de app, niet de live data.

const CACHE_NAME = "pollepel-shell-v1";

// Pas dit aan naar de daadwerkelijke build-output van je project
// (bijv. de bestanden die `vite build` genereert in /dist).
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Strategie: network-first voor navigatie (altijd de nieuwste app proberen te halen),
// met een cache-fallback zodra er geen verbinding is.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
