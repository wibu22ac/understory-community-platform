import { Router } from 'express'
import { sendMail, mailEnabled } from '../../lib/mailer'
import { sendSms, smsEnabled } from '../../lib/sms'
import { runReminderCycle } from '../../jobs/reminderWorker'

export const remindersRouter = Router()

// Demo: send mail/sms med direkte upload-link
remindersRouter.post('/demo', async (req, res) => {
  try {
    const { email, phone, experienceId } = req.body as {
      email?: string
      phone?: string
      experienceId?: string
    }

    if (!email && !phone) {
      return res.status(400).json({ error: 'email or phone required' })
    }

    const base = (process.env.CORS_ORIGIN?.replace(/\/$/, '') || 'http://localhost:3000')
    const uploadUrl = `${base}/upload?ref=${encodeURIComponent(experienceId || 'ref')}`

    const subject = 'Vil du dele et billede fra oplevelsen?'
    const text = `Tak for at deltage! Del gerne et billede eller en anbefaling:\n${uploadUrl}`

    const results: Record<string, any> = {}

    if (email && mailEnabled) {
      const mail = await sendMail({
        to: email,
        subject,
        text,
        html: `<p>Tak for at deltage! 🙌</p><p>Del gerne et billede eller en anbefaling:</p><p><a href="${uploadUrl}">${uploadUrl}</a></p> med venlig hilsen, Understory`
      })
      results.email = mail
    }

    if (phone && smsEnabled) {
      const sms = await sendSms(phone, `Tak for besøget! Del billede/anbefaling: ${uploadUrl} med venlig hilsen, Understory`)
      results.sms = sms
    }

    return res.json({ ok: true, results, uploadUrl })
  } catch (err) {
    console.error('reminders/demo error', err)
    return res.status(500).json({ error: 'internal error' })
  }
})

// Manuelt “kør nu” af det planlagte job (praktisk til test)
remindersRouter.post('/run-now', async (req, res) => {
  try {
    const { email } = (req.body || {}) as { email?: string }
    const out = await runReminderCycle(email)
    return res.json({ ok: true, out })
  } catch (e) {
    console.error('run-now error', e)
    return res.status(500).json({ error: 'internal error' })
  }
})
