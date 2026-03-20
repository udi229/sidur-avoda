// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'אולפנים 🎬';
  const options = {
    body: data.body || 'יש עדכון בסידור שלך',
    icon: '/sidur-avoda/icon.png',
    badge: '/sidur-avoda/icon.png',
    dir: 'rtl',
    lang: 'he',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/sidur-avoda/sidur-avoda.html' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => clients.claim());
