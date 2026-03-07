'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { PostForm } from '@/components/PostForm'; // Import!
import { Toast } from '@/components/Toast';

export default function EditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [postData, setPostData] = useState(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchOldData = async () => {
      const { data } = await supabase.from('posts').select('*').eq('id', id).single();
      if (data) setPostData(data);
    };
    fetchOldData();
  }, [id]);

  const handleUpdate = async (formData: any) => {
    const { error } = await supabase
      .from('posts')
      .update({ ...formData, status: 'pending' }) // เมื่อแก้แล้วให้กลับไปสถานะรออนุมัติใหม่
      .eq('id', id);

    if (error) {
      setToast({ msg: "อัปเดตไม่สำเร็จ", type: 'error' });
    } else {
      setToast({ msg: "แก้ไขข้อมูลเรียบร้อย", type: 'success' });
      setTimeout(() => router.push('/main'), 1500);
    }
  };

  if (!postData) return <div className="p-20 text-center font-jersey text-3xl">LOADING...</div>;

  return (
    <div className="min-h-screen p-8 flex flex-col items-center bg-[#F4F1EA]">
      <header className="w-full max-w-5xl flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-heritage-logo font-jersey cursor-pointer" onClick={() => router.push('/main')}>
          INHERITANCE
        </h1>
        <span className="font-vt323 text-xl uppercase">Edit Mode</span>
      </header>

      {/* ส่งข้อมูลเก่าเข้าไปผ่าน initialData */}
      <PostForm 
        initialData={postData} 
        onSubmit={handleUpdate} 
        submitText="SAVE CHANGES" 
      />

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}