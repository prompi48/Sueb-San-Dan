'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { Toast } from '@/components/Toast';
import { Icon } from '@iconify/react';

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  
  useEffect(() => {
    const fetchPostAndUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/'); return; }
      setUser(session.user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      const adminStatus = profile?.role === 'admin';
      setIsAdmin(adminStatus);

      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(username)')
        .eq('id', id)
        .single();

      if (error || !data) {
        setToast({ msg: "ไม่พบข้อมูลโพสต์ที่คุณต้องการ", type: 'error' });
        setTimeout(() => router.push('/main'), 1500);
        return;
      }

      if (data?.is_pending && !adminStatus && session.user.id !== data.author_id) {
        setToast({ msg: "This post is pending review.", type: 'error' });
        setTimeout(() => router.push('/main'), 1500);
        return;
      }

      setPost(data);
      setLoading(false);
    };

    fetchPostAndUser();
  }, [id, router]);

  const handleDelete = async () => {
    const confirmMsg = isAdmin && user?.id !== post.author_id 
      ? "SYSTEM WARNING: คุณกำลังใช้สิทธิ์ ADMIN เพื่อลบโพสต์นี้ ยืนยันหรือไม่?" 
      : "ยืนยันการลบโพสต์ของคุณออกจากระบบ?";

    if (!confirm(confirmMsg)) return;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      setToast({ msg: "เกิดข้อผิดพลาดในการลบ: " + error.message, type: 'error' });
    } else {
      setToast({ msg: "ลบโพสต์ออกจากสารบบเรียบร้อยแล้ว", type: 'success' });
      setTimeout(() => router.push('/main'), 1500);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-jersey text-3xl text-heritage-logo bg-heritage-bg animate-pulse">
      RETRIEVING ARCHIVE...
    </div>
  );

  const isOwner = user?.id === post.author_id;
  const canDelete = isOwner || isAdmin;

  return (
    <div className="min-h-screen p-8 flex flex-col items-center bg-heritage-bg font-prompt">
      <header className="w-full max-w-6xl flex justify-between items-center mb-10">
        <h1 
          className="text-4xl font-bold text-heritage-logo font-jersey cursor-pointer select-none" 
          onClick={() => router.push('/main')}
        >
          INHERITANCE
        </h1>
        <div className="font-vt323 text-xl bg-white border-2 border-black px-4 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase max-w-[250px] break-all">
          Subject ID: {post.subject_id}
        </div>
      </header>

      <div className="main-frame max-w-5xl w-full p-8 md:p-12 bg-[#D9D9D9] border-4 border-heritage-frame shadow-[16px_16px_0px_0px_rgba(0,0,0,0.1)] relative min-h-[500px] flex flex-col overflow-hidden">
        
        {/* Title & Control Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-4xl md:text-6xl font-bold font-jersey text-heritage-logo mb-2 uppercase break-all leading-tight">
              {post.title}
            </h2>
            <p className="text-xl font-prompt text-gray-600 font-bold break-all">{post.subject_name}</p>
          </div>

          <div className="flex gap-3 font-jersey text-xl self-end md:self-start shrink-0">
            {isOwner && (
              <button 
                onClick={() => router.push(`/edit/${id}`)}
                className="px-6 py-2 bg-[#6CAFA5] text-white border-2 border-black hover:brightness-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all"
              >
                EDIT
              </button>
            )}
            {canDelete && (
              <button 
                onClick={handleDelete}
                className="px-6 py-2 bg-[#d44c24] text-white border-2 border-black hover:brightness-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all flex items-center gap-2"
              >
                <Icon icon="pixelarticons:trash" width="20" />
                {isAdmin && !isOwner ? "MOD DELETE" : "DELETE"}
              </button>
            )}
          </div>
        </div>

        {/* Info Header */}
        <div className="flex flex-wrap gap-6 mb-8 font-vt323 text-2xl text-black/60 border-y-2 border-black/5 py-4">
          <div className="flex items-center gap-2">
            <Icon icon="pixelarticons:user" />
            <span>{post.profiles?.username || "Deleted User"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="pixelarticons:calendar" />
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 font-prompt text-lg leading-relaxed text-black break-all mb-12 bg-white/30 p-6 border-2 border-dashed border-black/10 rounded-sm">
          {post.description}
        </div>

        {/* Footer/Link Section */}
        <div className="mt-auto">
          {post.media_link ? (
            <a 
              href={post.media_link.startsWith('http') ? post.media_link : `https://${post.media_link}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex justify-center items-center gap-3 p-4 bg-white border-2 border-black font-jersey text-2xl text-heritage-logo hover:bg-heritage-logo hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1"
            >
              <Icon icon="pixelarticons:external-link" width="28" />
              ACCESS MATERIAL
            </a>
          ) : (
            <div className="text-center p-4 border-2 border-dashed border-black/20 font-vt323 text-xl text-gray-400">
              [ NO EXTERNAL LINKS ATTACHED ]
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={() => router.push('/main')} 
        className="mt-12 font-vt323 text-gray-400 hover:text-heritage-logo transition-colors text-2xl flex items-center gap-2"
      >
        <Icon icon="pixelarticons:arrow-left" />
        RETURN TO ARCHIVE LIST
      </button>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}