const SUPABASE_URL = 'https://efkcnuzbmwnslhgvpxws.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVma2NudXpibXduc2xoZ3ZweHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NzA5ODksImV4cCI6MjA4OTE0Njk4OX0.stckE-88HoROHcPU9Rjlo4g-nMFBhJKHIUhSt2jlgEc';

self.addEventListener('push', function(event) {
  event.waitUntil(handlePush(event));
});

async function handlePush(event) {
  try {
    // Try to get the message from push data first
    let body = 'הסידור שלך לשבוע הבא מוכן';
    
    if (event.data) {
      const text = event.data.text();
      if (text && text.length > 0 && !text.startsWith('{')) {
        body = text;
      }
    }
    
    // If no message from push, fetch from Supabase
    if (body === 'הסידור שלך לשבוע הבא מוכן') {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/push_messages?select=message&order=created_at.desc&limit=1`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0 && data[0].message) {
            body = data[0].message;
          }
        }
      } catch(e) {}
    }

    await showNotif('אולפנים 🎬', body);
  } catch(e) {
    await showNotif('אולפנים 🎬', 'הסידור שלך לשבוע הבא מוכן');
  }
}

async function showNotif(title, body) {
  return self.registration.showNotification(title, {
    body,
    icon: '/sidur-avoda/icon.png',
    badge: '/sidur-avoda/icon.png',
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
