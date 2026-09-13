// ===== Service Worker GeStockCI — cache App Shell pour usage hors-ligne =====
const CACHE_NOM = "gestockci-v1";
const FICHIERS_A_METTRE_EN_CACHE = [
  "login.html",
  "dashboard.html",
  "produits.html",
  "caisse.html",
  "carnet.html",
  "style.css",
  "config.js",
  "i18n.js",
  "app.js",
  "login.js",
  "dashboard.js",
  "produits.js",
  "caisse.js",
  "carnet.js",
  "locales/fr.json",
  "locales/en.json",
  "manifest.json"
];

self.addEventListener("install", (evenement) => {
  evenement.waitUntil(
    caches.open(CACHE_NOM).then((cache) => cache.addAll(FICHIERS_A_METTRE_EN_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evenement) => {
  evenement.waitUntil(
    caches.keys().then((cles) =>
      Promise.all(cles.filter((c) => c !== CACHE_NOM).map((c) => caches.delete(c)))
    )
  );
  self.clients.claim();
});

// Stratégie : réseau d'abord pour rester à jour, repli sur le cache si hors-ligne.
// Les écritures Firestore (ventes, stock, crédits) restent gérées par le cache
// natif de Firestore (voir config.js) qui les synchronise au retour du réseau.
self.addEventListener("fetch", (evenement) => {
  if (evenement.request.method !== "GET") return;
  evenement.respondWith(
    fetch(evenement.request)
      .then((reponse) => {
        const copie = reponse.clone();
        caches.open(CACHE_NOM).then((cache) => cache.put(evenement.request, copie));
        return reponse;
      })
      .catch(() => caches.match(evenement.request))
  );
});
