/* ============================================================
   Service Worker — מצב "ניקוי מלא" (KILL SWITCH)
   מטרה: להסיר את כל המטמון ואת ה-SW עצמו אצל כל המשתמשים,
   כדי שכולם יטענו מחדש ישירות מהשרת את הגרסה העדכנית.
   בטוח: לא נוגע ב-localStorage / התחברות. אף אחד לא יתנתק.

   גרסה 2026-08-06 — הוסר client.navigate() שגרם ללולאת רענון
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

    // ⛔ הוסר: client.navigate(client.url)
    // זה מה שגרם ללולאה — האפליקציה רשמה את ה-SW אחרי כל התחברות,
    // ה-SW ריענן את הדף, הדף התחבר שוב ורשם שוב, וחוזר חלילה.
    // הניקוי קורה גם בלי הרענון הכפוי. הדף הבא כבר נטען טרי.

    console.log('[SW] kill-switch הושלם — קאש נוקה, SW הוסר');
  })());
});

// לא מיירטים שום בקשה — הכל עובר ישירות לרשת
self.addEventListener('fetch', (event) => {});
