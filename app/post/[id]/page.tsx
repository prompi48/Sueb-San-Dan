'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { Toast } from '@/components/Toast';

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
      // 1. ดึงข้อมูล Session และเช็คสิทธิ์ Admin จาก Profile
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        setIsAdmin(profile?.is_admin || false);
      }

      // 2. ดึงรายละเอียดโพสต์
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(username)')
        .eq('id', id)
        .single();

      if (error || !data) {
        alert("ไม่พบโพสต์ที่คุณต้องการ");
        router.push('/main');
        return;
      }

      setPost(data);
      setLoading(false);
    };

    fetchPostAndUser();
  }, [id, router]);

  const handleDelete = async () => {
    const confirmMsg = isAdmin && user?.id !== post.author_id 
      ? "คุณกำลังใช้สิทธิ์ ADMIN เพื่อลบโพสต์นี้ ยืนยันหรือไม่?" 
      : "ยืนยันการลบโพสต์ของคุณ?";

    if (!confirm(confirmMsg)) return;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      setToast({ msg: "เกิดข้อผิดพลาดในการลบ", type: 'error' });
    } else {
      setToast({ msg: "ลบโพสต์เรียบร้อยแล้ว", type: 'success' });
      setTimeout(() => router.push('/main'), 1500);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-jersey text-2xl text-heritage-logo">
      LOADING POST DETAILS...
    </div>
  );

  const isOwner = user?.id === post.author_id;
  const canDelete = isOwner || isAdmin;

  return (
    <div className="min-h-screen p-8 flex flex-col items-center bg-[#F4F1EA]">
      {/* Header Section */}
      <header className="w-full max-w-5xl flex justify-between items-center mb-10">
        <h1 
          className="text-4xl font-bold text-heritage-logo font-jersey cursor-pointer" 
          onClick={() => router.push('/main')}
        >
          INHERITANCE
        </h1>
        <div className="font-vt323 text-lg bg-white/50 px-4 py-1 rounded-full border border-heritage-frame uppercase">
          CODE: {post.subject_id}
        </div>
      </header>

      {/* Main Content Frame */}
      <div className="main-frame max-w-4xl w-full p-10 bg-[#D9D9D9] relative border-[6px] border-[#6CAFA5] rounded-sm shadow-2xl min-h-[500px] flex flex-col">
        
        {/* Title & Actions Section */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-5xl font-bold font-jersey text-black mb-2 uppercase tracking-wide">
              {post.title}
            </h2>
            <p className="text-xl font-prompt text-gray-700">{post.subject_name}</p>
          </div>

          <div className="flex gap-3 font-vt323 text-xl">
            {isOwner && (
              <button 
                onClick={() => router.push(`/edit/${id}`)}
                className="px-6 py-2 bg-gray-500 text-white font-bold rounded-md hover:bg-gray-600 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button 
                onClick={handleDelete}
                className="px-6 py-2 bg-[#E63946] text-white font-bold rounded-md hover:bg-red-700 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                {isAdmin && !isOwner ? "Admin Delete" : "Delete"}
              </button>
            )}
          </div>
        </div>

        {/* Info Bar */}
        <div className="flex gap-10 mb-8 font-vt323 text-xl text-gray-600 border-b-2 border-gray-300 pb-4">
          <span>by {post.profiles?.username || 'Unknown'}</span>
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
        </div>

        {/* Description Body */}
        <div className="flex-1 font-prompt text-lg leading-relaxed text-black whitespace-pre-wrap mb-10">
          {post.description}
        </div>

        {/* External Link Section */}
        <div className="mt-auto pt-6 text-center border-t-2 border-gray-300">
          {post.media_link ? (
            <a 
              href={post.media_link.startsWith('http') ? post.media_link : `https://${post.media_link}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-vt323 text-2xl text-heritage-logo hover:underline hover:scale-105 transition-transform inline-block"
            >
              {post.media_link} 🔗
            </a>
          ) : (
            <span className="font-vt323 text-gray-400">No external link provided</span>
          )}
        </div>
      </div>

      <button 
        onClick={() => router.back()} 
        className="mt-8 font-vt323 text-gray-500 hover:text-heritage-logo transition-colors text-xl"
      >
        [ BACK TO LIST ]
      </button>

      {/* Toast Notification */}
      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}