// Cambia este número cada vez que subas una versión nueva para que se actualice la app
const VERSION = 'sans-v5';
const ARCHIVOS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Primero intenta la red; si no hay conexión usa lo guardado
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // La nube (Supabase) nunca se guarda en caché; solo la propia app, el script y las fuentes
  const u = new URL(e.request.url);
  if (u.origin !== self.location.origin && !/cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(u.host)) return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copia = resp.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copia));
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
