'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Post = {
  id: string
  imageUrl: string
  caption: string
  tags: string[]
  author?: { name: string | null }
  _count: { likes: number; comments: number }
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/posts`,
          { credentials: 'include' }
        )
        const data = await res.json()
        setPosts(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="feed-page">
      <header>
        <h1 className="feed-header-title">Feed</h1>
        <p className="feed-header-subtitle">
          Se billeder og anbefalinger fra Understory-oplevelser.
        </p>
      </header>

      {loading && (
        <p className="feed-loading">Henter opslag…</p>
      )}

      <section className="feed-list">
        {posts.map((post) => (
          <article key={post.id} className="feed-card">
            {/* Billede */}
            <Link href={`/post/${post.id}`}>
              <div className="feed-card-image-wrap">
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                />
              </div>
            </Link>

            {/* Tekst + meta */}
            <div className="feed-card-body">
              <div className="feed-card-meta">
                <span>by {post.author?.name ?? 'Unknown'}</span>
                <span className="feed-card-stats">
                  <span>❤️ {post._count.likes}</span>
                  <span>💬 {post._count.comments}</span>
                </span>
              </div>

              {post.caption && (
                <p className="feed-card-caption">
                  {post.caption}
                </p>
              )}

              {post.tags?.length > 0 && (
                <p className="feed-card-tags">
                  {post.tags.map((t) => `#${t}`).join(' ')}
                </p>
              )}
            </div>
          </article>
        ))}

        {!loading && posts.length === 0 && (
          <p className="feed-loading">
            Der er endnu ingen opslag. Prøv at uploade det første ✨
          </p>
        )}
      </section>
    </div>
  )
}
