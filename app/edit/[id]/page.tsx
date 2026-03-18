'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { PostForm } from '@/components/PostForm';
import { Toast } from '@/components/Toast';

interface PostFormType {
  title: string;
  subject_name: string;
  subject_id: string;
  description: string;
  media_link: string | null;
}

export default function EditPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [postData, setPostData] = useState<PostFormType | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchOldData = async () => {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/');

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setToast({ msg: "ไม่พบข้อมูลโพสต์", type: 'error' });
        setTimeout(() => router.push('/main'), 1500);
        return;
      }

      // Security Check: ถ้าไม่ใช่เจ้าของ ไล่กลับหน้าหลัก
      if (data.author_id !== session.user.id) {
        setToast({ msg: "คุณไม่มีสิทธิ์แก้ไขโพสต์นี้", type: 'error' });
        setTimeout(() => router.push('/main'), 1500);
        return;
      }

      setPostData({
        title: data.title,
        subject_name: data.subject_name,
        subject_id: data.subject_id,
        description: data.description,
        media_link: data.media_link
      });
      
      setLoading(false);
    };

    fetchOldData();
  }, [id, router]);

  const handleUpdate = async (formData: PostFormType) => {
    const { error } = await supabase
      .from('posts')
      .update(formData) 
      .eq('id', id);

    if (error) {
      setToast({ msg: "อัปเดตไม่สำเร็จ: " + error.message, type: 'error' });
    } else {
      setToast({ msg: "อัปเดตข้อมูลสำเร็จแล้ว", type: 'success' });
      // กลับไปหน้า Detail ของโพสต์นั้นๆ เพื่อดูความเปลี่ยนแปลง
      setTimeout(() => router.push(`/post/${id}`), 1500);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-heritage-bg font-jersey text-3xl tracking-tighter text-dark-green">
      ACCESSING ARCHIVE
    </div>
  );

  return (
    <div className="min-h-screen p-8 flex flex-col items-center bg-heritage-bg font-prompt">
      <header className="w-full max-w-4xl flex justify-between items-end mb-10 border-b-2 border-black/10 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-dark-green font-jersey cursor-pointer" onClick={() => router.push('/main')}>
            INHERITANCE
          </h1>
          <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Archive Modification Module</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-vt323 text-xl uppercase text-[#d44c24] bg-white px-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Edit Mode
          </span>
        </div>
      </header>

      {/* ใช้ PostForm ที่ดึง initialData มาแสดง */}
      <PostForm 
        initialData={postData || undefined} 
        onSubmit={handleUpdate} 
        submitText="UPDATE ARCHIVE" 
      />

      <button 
        onClick={() => router.back()} 
        className="mt-8 text-sm font-vt323 opacity-50 hover:opacity-100 hover:underline"
      >
        [ CANCEL AND GO BACK ]
      </button>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}