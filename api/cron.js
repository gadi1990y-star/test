import webpush from 'web-push'

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails('mailto:admin@tazkorto.app', VAPID_PUBLIC, VAPID_PRIVATE)
}

// Vercel Cron - מוגדר ב-vercel.json
// כל יום ב-09:00 שולח Push לכל המנויים
export default async function handler(req, res) {
  // כאן צריך לקרוא subscriptions מ-DB (למשל Vercel KV)
  // לדמו - מחזיר OK
  res.json({ ok: true, message: 'Cron - שלח Push לכל המנויים מה-DB' })
}
