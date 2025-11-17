import cron from 'node-cron'
import { sendMail, mailEnabled } from '../lib/mailer'

/**
 * Kernen i jobbet – kan kaldes af cron ELLER manuelt via endpointet /api/reminders/run-now.
 * Du kan putte din egen logik her (fx slå op i DB, hvem der skal have en reminder i dag).
 */
export async function runReminderCycle(debugEmail?: string) {
  const to = debugEmail || process.env.REMINDER_TEST_EMAIL
  const base = (process.env.CORS_ORIGIN?.replace(/\/$/, '') || 'http://localhost:3000')
  const uploadUrl = `${base}/upload?ref=daglig-ping`

  const subject = 'Understory – vil du dele et billede/anbefaling i dag?'
  const html = `
    <div style="font-family:system-ui,Segoe UI,Roboto,Arial">
      <h2>Hej 👋</h2>
      <p>Har du et billede eller en kort anbefaling at dele i dag?</p>
      <p><a href="${uploadUrl}" style="background:#111;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Del nu</a></p>
      <p style="color:#666;font-size:12px">Direkte link: ${uploadUrl}</p>
    </div>
  `

  const results: any = { attempted: false, sent: false }

  if (!mailEnabled) {
    results.reason = 'MAIL_DISABLED'
    return results
  }
  if (!to) {
    results.reason = 'NO_RECIPIENT'
    return results
  }

  results.attempted = true
  const res = await sendMail({ to, subject, html })
  results.sent = res.ok
  results.provider = res
  return results
}

/**
 * Planlæg cron-job: hver dag kl. 09:00 Copenhagen-tid.
 */
export function startReminderWorker() {
  cron.schedule(
    '0 9 * * *',
    async () => {
      try {
        await runReminderCycle()
        // evt. console.log('Daily reminder cycle executed')
      } catch (e) {
        console.error('Daily reminder failed', e)
      }
    },
    { timezone: 'Europe/Copenhagen' }
  )
}
