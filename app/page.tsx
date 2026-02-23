// ตัวอย่างหน้าสรุป "มรดกความรู้"
import { supabase } from '@/lib/supabase'

export default async function HomePage() {
  // ดึงข้อมูลจากตาราง posts เฉพาะตัวที่ status เป็น approved
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'approved')

  if (error) return <div>โหลดข้อมูลมรดกไม่ได้...</div>

  return (
    <main>
      <h1>มรดกความรู้จากรุ่นพี่</h1>
      <div className="grid gap-4">
        {posts?.map((post) => (
          <div key={post.id} className="border p-4 rounded-lg">
            <h3>{post.title}</h3>
            <p>รหัสวิชา: {post.subject_code}</p>
          </div>
        ))}
      </div>
    </main>
  )
}