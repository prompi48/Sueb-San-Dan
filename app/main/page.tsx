import { supabase } from '@/lib/supabase'

// บรรทัดนี้สำคัญมาก! บังคับให้ Next.js ดึงข้อมูลใหม่ทุกครั้ง (ไม่ใช้ Cache เก่า)
export const dynamic = 'force-dynamic' 

export default async function HomePage() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'approved')

  // ลองเช็ก Error ผ่านหน้าเว็บดูเลย
  if (error) return <div className="p-10">Error: {error.message}</div>
  if (!posts || posts.length === 0) return <div className="p-10">เชื่อมต่อได้ แต่ไม่พบข้อมูลที่สถานะเป็น approved</div>

  return (
    <main className="p-10">
      <h1 className="text-xl font-bold mb-5">มรดกที่อนุมัติแล้ว</h1>
      <div className="grid gap-4">
        {posts.map((post) => (
          <div key={post.id} className="border p-4 rounded bg-slate-50">
            <h3 className="font-bold">{post.title}</h3>
            <p className="text-sm text-gray-600">รหัสวิชา: {post.subject_id}</p>
          </div>
        ))}
      </div>
    </main>
  )
}