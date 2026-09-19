const CACHE_NAME = 'tazkorto-v2-amber-glow';
const urlsToCache = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      if (k !== CACHE_NAME) return caches.delete(k);
    }))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('chrome-extension')) return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

self.addEventListener('push', event => {
  let data = { title: 'תזכורתו', body: 'יש לך תזכורות דחופות' };
  if (event.data) {
    try { data = event.data.json(); } catch(e) { data.body = event.data.text(); }
  }
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200,100,200],
    data: { url: '/' },
    tag: 'tazkorto-push'
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(list => {
      for (const c of list) { if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus(); }
      return clients.openWindow('/');
    })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(event.data.title, { body: event.data.body, icon: '/icon-192.png' });
  }
});
