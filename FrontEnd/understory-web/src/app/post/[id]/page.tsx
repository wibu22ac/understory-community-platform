'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { API_BASE } from '@/lib/api'
type Comment={id:string;text:string;createdAt:string;author:{id:string;name:string}}
type Post={id:string;imageUrl:string;caption:string;tags:string[];createdAt:string;author:{id:string;name:string};_count:{likes:number;comments:number};comments:Comment[]}
export default function PostDetail(){
  const { id } = useParams<{id:string}>()
  const { access } = useAuth()
  const [post,setPost]=useState<Post|null>(null)
  const [err,setErr]=useState<string>()
  const [text,setText]=useState('')
  const [liking,setLiking]=useState(false)
  const [commenting,setCommenting]=useState(false)
  async function load(){ try{ const r=await fetch(`${API_BASE}/api/posts/${id}`); setPost(await r.json()) }catch(e:any){ setErr(e.message||'Kunne ikke hente post') } }
  useEffect(()=>{ load() },[id])
  async function toggleLike(){ if(!access) return setErr('Login for at like'); setLiking(true); try{ const r=await fetch(`${API_BASE}/api/posts/${id}/like`,{method:'POST',headers:{Authorization:`Bearer ${access}`},credentials:'include'}); const j=await r.json(); setPost(p=>p?{...p,_count:{...p._count,likes:j.count}}:p)}catch(e:any){setErr(e.message||'Kunne ikke like')}finally{setLiking(false)} }
  async function addComment(e:React.FormEvent){ e.preventDefault(); if(!access) return setErr('Login for at kommentere'); if(!text.trim()) return; setCommenting(true); try{ const r=await fetch(`${API_BASE}/api/posts/${id}/comments`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${access}`},body:JSON.stringify({text}),credentials:'include'}); const c=await r.json(); setText(''); setPost(p=>p?{...p,_count:{...p._count,comments:p._count.comments+1},comments:[...p.comments,c]}:p)}catch(e:any){setErr(e.message||'Kunne ikke kommentere')}finally{setCommenting(false)} }
  if(!post) return <p>{err||'Henter...'}</p>
  return (<div>
    <img src={post.imageUrl} alt={post.caption} style={{width:'100%',borderRadius:8}}/>
    <h2 style={{marginTop:8}}>{post.caption}</h2>
    {post.tags?.length ? <p style={{color:'#777'}}>#{post.tags.join(' #')}</p> : null}
    <p style={{fontSize:14,color:'#555'}}>❤️ {post._count.likes} · 💬 {post._count.comments}</p>
    <div style={{display:'flex',gap:8,marginTop:12}}><button onClick={toggleLike} disabled={liking}>👍 Like</button></div>
    <form onSubmit={addComment} style={{display:'grid',gap:8,marginTop:16}}>
      <input placeholder="Skriv en kommentar…" value={text} onChange={e=>setText(e.target.value)}/>
      <button disabled={commenting}>Kommentér</button>
    </form>
    <ul style={{marginTop:16,padding:0,listStyle:'none',display:'grid',gap:8}}>
      {post.comments.map(c=>(<li key={c.id} style={{border:'1px solid #eee',padding:8,borderRadius:6}}>
        <div style={{fontSize:12,color:'#777'}}>{c.author.name}</div><div>{c.text}</div>
      </li>))}
    </ul>
    {err && <p style={{color:'crimson'}}>{err}</p>}
  </div>)
}
