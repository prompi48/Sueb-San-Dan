'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { PostForm } from '@/components/PostForm';
import { Toast } from '@/components/Toast';

export default function CreatePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
      } else {
        setUser(session.user);
      }
    };
    getSession();
  }, [router]);

  const handleCreate = async (formData: any) => {
    if (!user) return;

    const { error } = await supabase
      .from('posts')
      .insert([
        { 
          ...formData, 
          author_id: user.id, 
          is_pending: true
        }
      ]);

    if (error) {
      setToast({ msg: "เกิดข้อผิดพลาดในการสร้างโพสต์: " + error.message, type: 'error' });
    } else {
      setToast({ msg: "ส่งโพสต์สำเร็จ! กำลังรอการตรวจสอบจากทีม Admin", type: 'success' });
      setTimeout(() => router.push('/main'), 2000);
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center bg-heritage-bg font-prompt">
      <header className="w-full max-w-5xl flex justify-between items-center mb-10">
        <h1 
          className="text-4xl font-bold text-heritage-logo font-jersey cursor-pointer select-none" 
          onClick={() => router.push('/main')}
        >
          INHERITANCE
        </h1>
        <div className="flex flex-col items-end">
          <span className="font-vt323 text-xl text-heritage-logo uppercase tracking-widest">New Submission</span>
          <span className="font-vt323 text-sm opacity-50">{user?.email}</span>
        </div>
      </header>

      {/* เพิ่มความมั่นใจว่ามี User ก่อนโชว์ Form */}
      {user && <PostForm onSubmit={handleCreate} submitText="SUBMIT TO ARCHIVE" />}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}