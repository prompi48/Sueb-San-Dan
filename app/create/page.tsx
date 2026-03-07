'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { PostForm } from '@/components/PostForm'; // อย่าลืม Import!
import { Toast } from '@/components/Toast';

export default function CreatePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
      else setUser(session.user);
    };
    getSession();
  }, [router]);

  const handleCreate = async (formData: any) => {
    const { error } = await supabase
      .from('posts')
      .insert([{ ...formData, author_id: user.id, status: 'pending' }]);

    if (error) {
      setToast({ msg: "เกิดข้อผิดพลาด!", type: 'error' });
    } else {
      setToast({ msg: "ส่งโพสต์สำเร็จ! รออนุมัติ", type: 'success' });
      setTimeout(() => router.push('/main'), 1500);
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center bg-[#F4F1EA]">
      <header className="w-full max-w-5xl flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-heritage-logo font-jersey cursor-pointer" onClick={() => router.push('/main')}>
          INHERITANCE
        </h1>
        <span className="font-vt323 text-xl">{user?.email}</span>
      </header>

      {/* เรียกใช้ Component ที่นี่ */}
      <PostForm onSubmit={handleCreate} submitText="POST" />

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}