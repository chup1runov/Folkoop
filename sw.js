const CACHE = 'sverinav-v0.9.0';
const BASE = self.registration.scope;
const APP_SHELL = new URL('', BASE).href;
const DATA_PATH = '/data/';
const CORE_PATHS = ['', 'index.html', 'styles.css', 'riksdagen.js', 'nvdb.js', 'goteborg-plans.js', 'app.js', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
const CORE = CORE_PATHS.map(path => new URL(path, BASE).href);
const CORE_SET = new Set(CORE);

async function putSuccessful(request, response) {
  if (!response || !response.ok) return response;
  const cache = await caches.open(CACHE);
  await cache.put(request, response.clone());
  return response;
}

async function navigationResponse(request) {
  try {
    return await putSuccessful(request, await fetch(request));
  } catch {
    return (await caches.match(request)) || (await caches.match(APP_SHELL)) ||
      new Response('Offline', { status:503, headers:{'Content-Type':'text/plain; charset=utf-8'} });
  }
}

async function dataResponse(request) {
  try {
    return await putSuccessful(request, await fetch(request, { cache:'no-store' }));
  } catch {
    return (await caches.match(request)) ||
      new Response(JSON.stringify({ error:'offline', items:[] }), {
        status:503,
        headers:{'Content-Type':'application/json; charset=utf-8'}
      });
  }
}

async function coreResponse(request) {
  const cached = await caches.match(request);
  if (cached) {
    fetch(request).then(response => putSuccessful(request, response)).catch(() => {});
    return cached;
  }
  return putSuccessful(request, await fetch(request));
}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(navigationResponse(request));
    return;
  }

  if (url.pathname.includes(DATA_PATH) && url.pathname.endsWith('.json')) {
    event.respondWith(dataResponse(request));
    return;
  }

  if (CORE_SET.has(url.href)) event.respondWith(coreResponse(request));
});
