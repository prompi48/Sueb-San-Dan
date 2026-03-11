'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPage() {

  const router = useRouter()
  const [posts,setPosts] = useState<any[]>([])

  useEffect(() => {

    const checkAdmin = async () => {

      const { data:{session} } = await supabase.auth.getSession()

      if(!session){
        router.push('/login')
        return
      }

      const { data:profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id',session.user.id)
      .single()

      if(!profile?.is_admin){
        router.push('/main')
        return
      }

      const { data } = await supabase
      .from('posts')
      .select('*,profiles(username)')
      .eq('status','pending')
      .order('created_at',{ascending:false})

      setPosts(data || [])
    }

    checkAdmin()

  },[])

  const acceptPost = async(id:number)=>{
    await supabase
    .from('posts')
    .update({status:'accepted'})
    .eq('id',id)

    setPosts(prev=>prev.filter(p=>p.id!==id))
  }

  const rejectPost = async(id:number)=>{
    await supabase
    .from('posts')
    .update({status:'rejected'})
    .eq('id',id)

    setPosts(prev=>prev.filter(p=>p.id!==id))
  }

  const deletePost = async(id:number)=>{
    await supabase
    .from('posts')
    .delete()
    .eq('id',id)

    setPosts(prev=>prev.filter(p=>p.id!==id))
  }

  return(

  <div className="p-10">

  <h1 className="text-4xl font-bold mb-6">
  ADMIN DASHBOARD
  </h1>

  <div className="grid grid-cols-3 gap-6">

  {posts.map(post=>(

  <div key={post.id} className="p-4 bg-gray-200 rounded">

  <h2 className="text-xl font-bold">{post.title}</h2>

  <p className="text-sm">{post.description}</p>

  <p className="text-xs mt-2">
  by {post.profiles?.username}
  </p>

  <div className="flex gap-2 mt-3">

  <button onClick={()=>acceptPost(post.id)}>✔</button>

  <button onClick={()=>rejectPost(post.id)}>❌</button>

  <button onClick={()=>deletePost(post.id)}>🗑</button>

  </div>

  </div>

  ))}

  </div>

  </div>

  )

}