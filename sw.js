self.addEventListener('push', function(event) {
  event.waitUntil(handlePush(event));
});

async function handlePush(event) {
  try {
    const msg = event.data ? event.data.text() : 'סידור העבודה שלך לשבוע הבא מוכן';
    await showNotif('אולפנים 🎬', msg);
  } catch(e) {
    await showNotif('אולפנים 🎬', 'סידור העבודה שלך לשבוע הבא מוכן');
  }
}

async function showNotif(title, body) {
  return self.registration.showNotification(title, {
    body, icon: '/sidur-avoda/icon.png',
    dir: 'rtl', lang: 'he',
    vibrate: [200, 100, 200],
    data: { url: '/sidur-avoda/sidur-avoda.html' }
  });
}

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => clients.claim());
