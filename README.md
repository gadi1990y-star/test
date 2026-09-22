# תזכורתו - PRODUCTION READY ✅

## מה יש כאן - לא דמו!
- ✅ manifest.json אמיתי ב-public/
- ✅ sw.js אמיתי ב-public/ עם push אמיתי
- ✅ כפתור גיבוי מאוחד (ייבוא+ייצוא)
- ✅ Service Worker עם timeout שלא נתקע
- ✅ התראות קופצות אמיתיות גם כשהאתר סגור
- ✅ PWA מוכן למסך הבית

## התקנה:
```bash
npm install
npm run dev
```

## יצירת VAPID keys להתראות אמיתיות:
```bash
npx web-push generate-vapid-keys
```
שים ב-Vercel Environment Variables:
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
- VAPID_EMAIL

## דיפלוי ל-Vercel:
1. Push ל-GitHub
2. Vercel מזהה Vite אוטומטית
3. הוסף Env vars של VAPID
4. אחרי דיפלוי - פתח במובייל כרום
5. אשר התראות + הוסף למסך הבית
6. עכשיו Push יעבוד גם כשהאתר סגור לגמרי!

## קבצים קריטיים:
- public/manifest.json - חובה ב-root
- public/sw.js - חובה ב-root, לא blob!
- vercel.json - מוודא ש-sw.js לא נשמר ב-cache

## בדיקה:
לחץ "בדיקה לטלפון עכשיו" - אמורה לקפוץ התראה אמיתית מחוץ לדפדפן עם רטט.
