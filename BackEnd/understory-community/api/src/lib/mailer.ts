// src/lib/mailer.ts
import sgMail from '@sendgrid/mail'

const apiKey = process.env.SENDGRID_API_KEY || ''
const fromEmail = process.env.SENDGRID_FROM_EMAIL || ''

export const mailEnabled = Boolean(apiKey) && Boolean(fromEmail)

if (mailEnabled) {
  sgMail.setApiKey(apiKey)
  console.log('SendGrid enabled')
} else {
  console.warn('Email disabled: missing SendGrid env vars')
}

export async function sendMail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  if (!mailEnabled) {
    console.warn('sendMail called but email is disabled')
    return
  }

  if (!to) {
    throw new Error('Missing "to" email address')
  }

  const msg = {
    to,                     // 👈 VIGTIG: to er direkte parameteren
    from: fromEmail,        // 👈 SKAL være en verificeret afsender i SendGrid
    subject,
    text,
    html: html ?? text,
  }

  const res = await sgMail.send(msg)
  console.log('SendGrid email sent:', res[0].statusCode)
  return res
}

export default sendMail
