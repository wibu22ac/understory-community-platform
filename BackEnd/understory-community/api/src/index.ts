import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import pinoHttp from 'pino-http'

import { remindersRouter } from './features/reminders/routes'
import auth from './features/auth/routes'
import posts from './features/posts/routes'
import { startReminderWorker } from './jobs/reminderWorker'

const app = express()

app.use(helmet())
app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())
app.use(pinoHttp())
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', auth)
app.use('/api/posts', posts)
app.use('/api/reminders', remindersRouter)

// 👉 start cron-jobbet EFTER routes
startReminderWorker()

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`API on :${port}`))
