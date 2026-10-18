/* 改了应用之后，把下面的版本号 +1，手机上的缓存才会更新 */
var CACHE = 'xiaotao-v2';
var ASSETS = ['./', './index.html', './apple-touch-icon.png', './icon-192.png', './icon-512.png', './manifest.webmanifest'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* 打开页面时优先走网络（保证更新），断网了才用缓存 */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  function put(req) { var copy = null; return function (res) {
    if (res && res.status === 200 && res.type === 'basic') { copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
    return res; }; }
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(put(e.request)).catch(function () {
      return caches.match(e.request).then(function (h) { return h || caches.match('./index.html'); });
    }));
    return;
  }
  e.respondWith(caches.match(e.request).then(function (hit) {
    return hit || fetch(e.request).then(put(e.request)).catch(function () { return hit; });
  }));
});