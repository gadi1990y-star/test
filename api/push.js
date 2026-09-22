import webpush from 'web-push'

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@tazkorto.app'

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const { subscription, title, body } = req.body
  
  if (!subscription) {
    return res.status(400).json({ error: 'Missing subscription' })
  }

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return res.status(500).json({ error: 'VAPID keys not configured in Vercel env' })
  }

  try {
    const payload = JSON.stringify({
      title: title || 'תזכורתו',
      body: body || 'יש לך תזכורות דחופות'
    })

    await webpush.sendNotification(subscription, payload)
    res.json({ ok: true })
  } catch (err) {
    console.error('Push failed', err)
    res.status(500).json({ error: err.message })
  }
}
