/* ============================================================
   Service Worker — מצב נייטרלי (לא עושה כלום)

   למה זה פותר את הלולאה:
   הגרסה הקודמת עשתה clients.claim() ואז unregister().
   ה-claim גרם ל-controllerchange להישרף, וב-HTML (שורה 11465)
   יושב מאזין שעושה location.reload() בדיוק על האירוע הזה.
   ה-unregister דאג שבטעינה הבאה שוב לא יהיה SW רשום,
   אז ה-HTML רשם מחדש — וחוזר חלילה, בלי סוף.

   הקובץ הזה לא עושה claim, לא עושה skipWaiting,
   ולא מוחק את עצמו. הוא נרשם פעם אחת ונשאר בשקט.
   אין controllerchange → אין רענון → אין לולאה.

   גרסה 2026-08-06
   ============================================================ */

self.addEventListener('install', function () {
  // בכוונה ריק — בלי skipWaiting
});

self.addEventListener('activate', function () {
  // בכוונה ריק — בלי clients.claim ובלי unregister
});

self.addEventListener('fetch', function () {
  // לא מיירטים שום בקשה. הכל עובר ישירות לרשת.
  // אין קאש, ולכן אין סכנה שתעלה גרסה ואנשים יקבלו ישנה.
});
