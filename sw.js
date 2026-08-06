/* ============================================================
   Service Worker — מצב "ניקוי מלא" (KILL SWITCH)
   מטרה: להסיר את כל המטמון ואת ה-SW עצמו אצל כל המשתמשים,
   כדי שכולם יטענו מחדש ישירות מהשרת את הגרסה העדכנית.
   בטוח: לא נוגע ב-localStorage / התחברות. אף אחד לא יתנתק.
   ============================================================ */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // 1. מחיקת כל המטמונים
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch (e) {}

    // 2. השתלטות על כל הלשוניות
    try { await self.clients.claim(); } catch (e) {}

    // 3. הסרת ה-SW עצמו
    try { await self.registration.unregister(); } catch (e) {}

    // 4. אילוץ רענון בכל הלשוניות — יטענו טרי מהשרת
    try {
      const clientsList = await self.clients.matchAll({ type: 'window' });
      for (const client of clientsList) {
        client.navigate(client.url);
      }
    } catch (e) {}
  })());
});

// לא מיירטים שום בקשה — הכל עובר ישירות לרשת
self.addEventListener('fetch', (event) => {});
