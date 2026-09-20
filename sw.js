/* MatchWork — service worker minimal.
   Met en cache la coquille du site pour l'ouverture hors ligne.
   Les appels à Supabase ne sont jamais mis en cache : des données
   de profil périmées n'auraient aucun sens, et rien ne doit traîner
   dans le cache du navigateur. */
const CACHE = "matchwork-v2";
const SHELL = [
  "./", "./index.html", "./style.css", "./a11y.js", "./config.js",
  "./logo.svg", "./logo-mark.svg", "./icon-192.png",
  "./mentions-legales.html", "./confidentialite.html", "./manifest.webmanifest"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.origin !== location.origin) return;          // Supabase, polices : réseau direct
  if (e.request.mode === "navigate") {                  // pages : réseau d'abord
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return res;
  }).catch(() => r)));
});
