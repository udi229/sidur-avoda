/* ============================================================
   Service Worker — סידור עבודה (אולפנים)
   מטרה: לוודא שהמשתמשים תמיד מקבלים את הגרסה העדכנית,
   בלי לנקות מטמון ידנית ובלי להתנתק מהחשבון.

   אסטרטגיה:
   - HTML / ניווט: "רשת קודם" (Network-First) — תמיד מנסה להביא
     את הגרסה החדשה מהרשת; אם אין רשת — נופל למטמון.
   - שאר הקבצים (JS/CSS/תמונות): "רשת קודם" עם שמירה למטמון,
     כדי שגם הם יתעדכנו מיד.
   - שומר על התראות Push כרגיל.
   - לא נוגע ב-localStorage / IndexedDB — ההתחברות נשמרת.
   ============================================================ */

// מספר גרסה — כל שינוי כאן מכריח רענון מלא של המטמון.
const SW_VERSION = 'v4-20260806-141121';
const CACHE_NAME = 'sidur-cache-' + SW_VERSION;

// התקנה: מפעיל מיד את הגרסה החדשה (בלי להמתין)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// הפעלה: מוחק מטמונים ישנים ומשתלט על כל הלשוניות
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

// הודעה מה-HTML: לדלג על ההמתנה ולהשתלט מיד
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// אחזור: רשת-קודם, עם נפילה למטמון כשאין רשת
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // רק בקשות GET מאותו מקור; שאר הבקשות עוברות כרגיל
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      // מנסים רשת קודם — תמיד מביא את הגרסה העדכנית
      const fresh = await fetch(req, { cache: 'no-store' });
      // שומרים עותק למטמון (לשימוש כשאין רשת)
      try {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
      } catch (e) {}
      return fresh;
    } catch (err) {
      // אין רשת — מגישים מהמטמון אם קיים
      const cached = await caches.match(req);
      if (cached) return cached;
      // אם זה ניווט (HTML) ואין כלום — מנסים את דף הבית מהמטמון
      if (req.mode === 'navigate') {
        const home = await caches.match('/sidur-avoda/sidur-avoda.html')
                  || await caches.match('/sidur-avoda/')
                  || await caches.match('/sidur-avoda/index.html');
        if (home) return home;
      }
      throw err;
    }
  })());
});

/* ============================================================
   התראות Push — נשמר כדי שההתראות ימשיכו לעבוד
   ============================================================ */
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    try { data = { title: 'אולפנים', body: event.data ? event.data.text() : '' }; }
    catch (e2) { data = {}; }
  }
  const title = data.title || 'סידור עבודה';
  const options = {
    body: data.body || '',
    icon: data.icon || '/sidur-avoda/icon-192.png',
    badge: data.badge || '/sidur-avoda/icon-192.png',
    dir: 'rtl',
    lang: 'he',
    data: { url: data.url || '/sidur-avoda/sidur-avoda.html' },
    tag: data.tag || undefined,
    renotify: !!data.tag
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// לחיצה על התראה — פותח/ממקד את האפליקציה
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url)
    || '/sidur-avoda/sidur-avoda.html';
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      if (client.url.includes('/sidur-avoda/') && 'focus' in client) {
        return client.focus();
      }
    }
    if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
  })());
});
