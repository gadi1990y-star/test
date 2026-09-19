# תזכורתו - Amber Glow + PWA

## התקנה
npm install
npm run dev

## קבצים חשובים ל-PWA (כמו אות והמספר):
- public/manifest.json - מגדיר שהאתר הוא אפליקציה
- public/sw.js - Service Worker שמאפשר offline + התראות כשסגור
- vercel.json - מוודא שה-SW לא נשמר ב-cache

## דיפלוי ל-Vercel:
1. Push ל-GitHub
2. Vercel יזהה Vite אוטומטית
3. אחרי דיפלוי - פתח במובייל כרום > ⋮ > הוסף למסך הבית
4. האפליקציה תיפתח ב-standalone (בלי שורת כתובת)

## התראות:
- כשהאתר פתוח: new Notification + registration.showNotification
- כשהאתר סגור לגמרי: צריך VAPID keys + web-push (ראה api/push.js)
