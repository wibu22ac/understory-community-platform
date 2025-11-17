// src/lib/sms.ts
import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID || ''
const authToken = process.env.TWILIO_AUTH_TOKEN || ''
const fromNumber = process.env.TWILIO_FROM_NUMBER || ''

// Er SMS overhovedet sat korrekt op?
export const smsEnabled =
  Boolean(accountSid) && Boolean(authToken) && Boolean(fromNumber)

const client = smsEnabled ? twilio(accountSid, authToken) : null

export async function sendSms(to: string, body: string) {
  if (!smsEnabled) {
    console.warn('SMS disabled: missing Twilio env vars')
    return
  }

  if (!to) {
    throw new Error('Missing "to" phone number')
  }

  const msg = await client!.messages.create({
    to,
    from: fromNumber,
    body,
  })

  console.log('Twilio SMS sent:', msg.sid)
  return msg
}

// (Valgfrit, men harmless – hvis du vil kunne importere default)
export default sendSms
