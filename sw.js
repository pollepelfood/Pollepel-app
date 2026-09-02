// Pollepel — service worker
//
// Uitgangspunt: code (HTML en JS) komt altijd vers van het netwerk zolang er
// verbinding is. De vorige versie haalde app.js eerst uit de cache, waardoor
// gebruikers na elke oplevering nog de oude app zagen tot ze hun cache leegden.
//
// Alleen wanneer het netwerk faalt vallen we terug op de cache, zodat de app
// offline blijft werken.

const VERSION = "v2";
const CACHE_NAME = `pollepel-shell-${VERSION}`;

// app.js hoorde hier ook in: zonder dat bestand start de app offline helemaal niet.
const APP_SHELL = [
  "/",
  "/index.html",
  "/app.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Eén ontbrekend bestand mag de hele installatie niet laten mislukken.
      Promise.allSettled(APP_SHELL.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => {
        // Draaide er al een versie? Dan is dit een update en mag de app dat melden.
        clients.forEach((client) => client.postMessage({ type: "SW_UPDATED", version: VERSION }));
      })
  );
});

// Netwerk eerst, cache als vangnet. Werkt de verbinding, dan krijg je de nieuwste code.
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
    }
    return response;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const shell = await caches.match("/index.html");
      if (shell) return shell;
    }
    throw e;
  }
}

// Cache eerst, met stille verversing op de achtergrond. Voor bestanden die
// nauwelijks wijzigen: iconen, lettertypen, vaste bibliotheken van een CDN.
async function cacheFirst(request) {
  const cached = await caches.match(request);
  const update = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return response;
    })
    .catch(() => cached);
  return cached || update;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // Verzoeken naar de backend nooit onderscheppen: die moeten altijd live zijn.
  if (url.hostname.endsWith("supabase.co") || url.pathname.startsWith("/.netlify/")) return;

  // Code: altijd de nieuwste proberen te halen.
  if (request.mode === "navigate" || (sameOrigin && /\.(js|css|html)$/.test(url.pathname))) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

// Laat de app een wachtende versie meteen activeren.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
