'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';

// Interface สำหรับจัดการ Queue การลบ/ยอมรับ
interface PendingAction {
  id: number;
  type: 'accept' | 'delete';
  timeoutId: NodeJS.Timeout;
  postData: any;
}

export default function AdminPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isChecking, setIsChecking] = useState(true); // เพิ่มสถานะเช็ค Admin
  
  const pendingRef = useRef<PendingAction | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      // 1. ตรวจสอบ Session (ถ้าไม่มีให้กลับหน้าแรก /)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/');

      // 2. ตรวจสอบ Role จากตาราง Profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/main');
        return;
      }

      // 3. ดึงโพสต์ที่รอการตรวจสอบ (is_pending = true)
      const { data } = await supabase
        .from('posts')
        .select('*, profiles(username)')
        .eq('is_pending', true)
        .order('created_at', { ascending: false });

      setPosts(data || []);
      setIsChecking(false);
    };
    checkAdmin();
  }, [router]);

  // --- ระบบ Optimistic UI พร้อมหน่วงเวลาลง DB ---
  const triggerAction = (id: number, type: 'accept' | 'delete') => {
    if (pendingAction) {
      executeDatabaseAction(pendingAction.id, pendingAction.type);
      clearTimeout(pendingAction.timeoutId);
    }

    const postToProcess = posts.find(p => p.id === id);
    setPosts(prev => prev.filter(p => p.id !== id));

    const timeoutId = setTimeout(() => {
      executeDatabaseAction(id, type);
      setPendingAction(null);
      pendingRef.current = null;
    }, 5000);

    const newAction = { id, type, timeoutId, postData: postToProcess };
    setPendingAction(newAction);
    pendingRef.current = newAction;
  };

  // --- ฟังก์ชันเขียนลง Database จริง (อ้างอิง Column is_pending) ---
  const executeDatabaseAction = async (id: number, type: 'accept' | 'delete') => {
    if (type === 'accept') {
      // เปลี่ยนจาก pending เป็น accepted (is_pending: false)
    const { error } = await supabase
      .from('posts')
      .update({ is_pending: false })
      .eq('id', id);

    if (error) console.error('Approve Error:', error.message);

    } else {
      // ปฏิเสธ = ลบทิ้งออกจากระบบ
      await supabase.from('posts').delete().eq('id', id);
    }
  };

  const handleUndo = () => {
    if (pendingAction) {
      clearTimeout(pendingAction.timeoutId);
      setPosts(prev => [pendingAction.postData, ...prev]);
      setPendingAction(null);
      pendingRef.current = null;
    }
  };

  // แสดง Loading ระหว่างเช็คสิทธิ์เพื่อความปลอดภัย
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-jersey text-2xl tracking-widest text-heritage-logo">
        VALIDATING AUTHORITY...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10 bg-gray-50 font-prompt">
      <div className="flex justify-between items-center mb-10 border-b-4 border-black pb-4">
        <div>
          <h1 className="text-4xl font-bold font-jersey text-heritage-logo">ADMIN QUEUE</h1>
          <p className="text-xs font-bold opacity-50 uppercase tracking-tighter">Review pending archives for approval</p>
        </div>
        <button 
          onClick={() => router.push('/main')} 
          className="font-jersey text-xl bg-white border-2 border-black px-4 py-1 hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
        >
          BACK TO MAIN
        </button>
      </div>

      {posts.length === 0 && !pendingAction && (
        <div className="flex flex-col items-center justify-center py-40 opacity-20">
          <Icon icon="pixelarticons:Check" width="80" />
          <p className="text-3xl font-jersey mt-4">SYSTEM CLEAR - NO PENDING POSTS</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map(post => (
          <div key={post.id} className="p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4 border-b-2 border-dashed border-gray-200 pb-2">
                <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5">{post.subject_id}</span>
                <span className="text-[10px] opacity-40">{new Date(post.created_at).toLocaleString()}</span>
              </div>
              <h2 className="text-xl font-bold mb-2 text-heritage-logo">{post.title}</h2>
              <p className="text-sm text-gray-600 mb-4 line-clamp-4 leading-relaxed italic">"{post.description}"</p>
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-black/5">
              <span className="text-xs font-vt323 bg-heritage-input px-3 py-1 border border-black/10 rounded-full font-bold">
                BY: {post.profiles?.username || 'UNKNOWN'}
              </span>
              <div className="flex gap-3">
                <button 
                  onClick={() => triggerAction(post.id, 'accept')}
                  className="w-12 h-12 flex items-center justify-center bg-[#6CAFA5] border-2 border-black hover:brightness-110 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
                  title="Approve Post"
                >
                  <Icon icon="pixelarticons:check" width="28" className="text-white" />
                </button>
                <button 
                  onClick={() => triggerAction(post.id, 'delete')}
                  className="w-12 h-12 flex items-center justify-center bg-[#d44c24] border-2 border-black hover:brightness-110 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
                  title="Reject and Delete"
                >
                  <Icon icon="pixelarticons:close" width="28" className="text-white" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Undo Snackbar: แจ้งเตือนพร้อมปุ่มยกเลิกภายใน 5 วินาที */}
      {pendingAction && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 px-8 py-5 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.3)] z-[100] text-white animate-bounce-short ${pendingAction.type === 'accept' ? 'bg-[#4a8a7f]' : 'bg-[#a33a1d]'}`}>
          <div className="flex items-center gap-3">
            <Icon icon={pendingAction.type === 'accept' ? "pixelarticons:check" : "pixelarticons:close"} width="24" />
            <span className="font-bold uppercase tracking-widest text-sm">
              {pendingAction.type === 'accept' ? 'Accepted' : 'Deleted'}: {pendingAction.postData.title.substring(0, 12)}...
            </span>
          </div>
          <button 
            onClick={handleUndo}
            className="bg-white text-black px-6 py-2 font-jersey text-xl hover:bg-gray-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
          >
            UNDO
          </button>
        </div>
      )}
    </div>
  );
}
