self.addEventListener('push', function(event) {
  event.waitUntil(handlePush(event));
});

async function handlePush(event) {
  try {
    let title = 'אולפנים 🎬';
    let body = 'הסידור שלך לשבוע הבא מוכן';

    if (event.data) {
      try {
        // Try parsing as JSON first
        const data = event.data.json();
        body = data.body || data.message || data.text || body;
        title = data.title || title;
      } catch(e) {
        // Fallback to plain text
        const text = event.data.text();
        if (text) body = text;
      }
    }

    await showNotif(title, body);
  } catch(e) {
    await showNotif('אולפנים 🎬', 'הסידור שלך לשבוע הבא מוכן');
  }
}

async function showNotif(title, body) {
  return self.registration.showNotification(title, {
    body,
    icon: '/sidur-avoda/icon.png',
    dir: 'rtl',
    lang: 'he',
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
