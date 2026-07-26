const CACHE_NAME = 'todo-pomo-v2';

// Liste des fichiers indispensables
const ASSETS = [
  './',
  './index.html',
  './script.js',
  './manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // On tente de mettre en cache les fichiers principaux
      await cache.addAll(ASSETS);
      
      // On essaie de mettre l'icône en cache séparément pour ne pas tout bloquer si elle est introuvable
      try {
        await cache.add('./icon.png');
      } catch (err) {
        console.warn("Attention : icon.png n'a pas pu être mise en cache (vérifie le nom de l'image).");
      }
    })
  );
  self.skipWaiting();
});

// Activation
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes réseau
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
