/* CarCare Studio PWA — increment VERSION on each release. */
const VERSION = '1.0.0';
const ROOT = new URL(self.registration.scope);
const PREFIX = 'carcare-pwa:' + ROOT.pathname + ':';
const CACHE = PREFIX + VERSION;
const paths = ['./index.html','./manifest.webmanifest','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png'];
const assets = paths.map(path => new URL(path,ROOT).href);
const shell = assets[0];
self.addEventListener('install', event => {
  // Only publish a complete release. Let existing sessions finish before activating updates.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(assets.map(url => new Request(url,{cache:'reload'})))));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for(const key of await caches.keys()) if(key.startsWith(PREFIX)&&key!==CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== ROOT.origin) return;
  const navigation = req.mode === 'navigate' && (url.pathname === ROOT.pathname || url.pathname === new URL(shell).pathname);
  const key = navigation ? shell : assets.includes(url.href) ? url.href : null;
  if(!key) return; // never cache user files, backups, or unrelated requests
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const saved = await cache.match(key);
    return saved || fetch(req);
  })());
});
