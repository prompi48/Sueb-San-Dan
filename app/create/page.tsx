/* 
app/create/page.tsx
หน้าสร้างโพสต์ใหม่

ส่ง is_pending: true ไปด้วยตั้งแต่ตอนสร้าง เพื่อให้โพสต์ใหม่ทุกโพสต์ต้องรอการอนุมัติจาก Admin ก่อนถึงจะแสดงในหน้า Main ได้
แต่ไม่น่าเชื่อถือ จึงใช้ RLS โดยตั้งให้ insert policy รับเฉพาะ post ที่ is_pending: true ซ้ำอีกชั้นเพื่อความปลอดภัย
*/

'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { PostForm } from '@/components/PostForm';
import { Toast } from '@/components/Toast';
import styles from './page.module.css';

export default function CreatePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!user || isSubmitting) return;

    setIsSubmitting(true);

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
      setIsSubmitting(false);
    } else {
      setToast({ msg: "ส่งโพสต์สำเร็จ! กำลังรอการตรวจสอบจากทีม Admin", type: 'success' });
      setTimeout(() => router.push('/main'), 2000);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1
          className={styles.logo}
          onClick={() => router.push('/main')}
        >
          INHERITANCE
        </h1>
        <div className={styles.headerRight}>
          <span className={styles.submissionLabel}>New Submission</span>
          <span className={styles.userEmail}>{user?.email}</span>
        </div>
      </header>

{user && (
      <PostForm 
        onSubmit={handleCreate} 
        submitText={isSubmitting ? "UPLOADING..." : "SUBMIT TO ARCHIVE"} 
        disabled={isSubmitting}
      />
    )}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
