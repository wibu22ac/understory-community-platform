import { Router } from 'express'
import multer from 'multer'
import { prisma } from '../../lib/prisma'
import { authGuard } from '../../middlewares/authGuard'
import { cloudinary } from '../../lib/cloudinary'
import { z } from 'zod'

const r = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

// Create post (image upload)
r.post('/', authGuard, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'missing file' })
  const body = z.object({
    caption: z.string().max(300).optional().default(''),
    tags: z.string().optional() // comma-separated
  }).parse(req.body)

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'understory', resource_type: 'image' },
      (err, out) => (err ? reject(err) : resolve(out as any))
    )
    stream.end(req.file!.buffer)
  })

  const user = (req as any).user as { sub: string }
  const post = await prisma.post.create({
    data: {
      authorId: user.sub,
      imageUrl: result.secure_url,
      caption: body.caption || '',
      tags: body.tags ? body.tags.split(',').map(s => s.trim()).filter(Boolean) : []
    },
    select: { id: true, imageUrl: true, caption: true, tags: true, createdAt: true, authorId: true }
  })

  res.status(201).json(post)
})

// Public feed
r.get('/', async (req, res) => {
  const take = Math.min(Number(req.query.limit ?? 20), 50)
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    select: {
      id: true, imageUrl: true, caption: true, tags: true, createdAt: true,
      author: { select: { id: true, name: true } },
      _count: { select: { likes: true, comments: true } }
    }
  })
  res.json(posts)
})

// Single post incl. comments
r.get('/:id', async (req, res) => {
  const { id } = req.params
  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true, imageUrl: true, caption: true, tags: true, createdAt: true,
      author: { select: { id: true, name: true } },
      _count: { select: { likes: true, comments: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        select: { id: true, text: true, createdAt: true, author: { select: { id: true, name: true } } }
      }
    }
  })
  if (!post) return res.status(404).json({ error: 'not found' })
  res.json(post)
})

// Toggle like
r.post('/:id/like', authGuard, async (req, res) => {
  const user = (req as any).user as { sub: string }
  const { id: postId } = req.params

  const exists = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } })
  if (!exists) return res.status(404).json({ error: 'not found' })

  const existing = await prisma.like.findUnique({ where: { postId_userId: { postId, userId: user.sub } } })
  let liked: boolean
  if (existing) {
    await prisma.like.delete({ where: { postId_userId: { postId, userId: user.sub } } })
    liked = false
  } else {
    await prisma.like.create({ data: { postId, userId: user.sub } })
    liked = true
  }
  const count = await prisma.like.count({ where: { postId } })
  res.json({ liked, count })
})

// Add comment
r.post('/:id/comments', authGuard, async (req, res) => {
  const user = (req as any).user as { sub: string }
  const { id: postId } = req.params
  const body = z.object({ text: z.string().min(1).max(500) }).safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: body.error.flatten() })

  const exists = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } })
  if (!exists) return res.status(404).json({ error: 'not found' })

  const c = await prisma.comment.create({
    data: { postId, authorId: user.sub, text: body.data.text },
    select: { id: true, text: true, createdAt: true, author: { select: { id: true, name: true } } }
  })
  res.status(201).json(c)
})

export default r
