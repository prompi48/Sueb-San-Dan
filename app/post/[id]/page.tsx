/* 
app/post/[id]/page.tsx
หน้าแสดงรายละเอียดโพสต์แต่ละโพสต์

โค้ดมีการเช็คสิทธิ์ซ้ำหลายชั้นเพื่อให้มั่นใจว่าข้อมูลจะไม่รั่วไหล:
Session Check: ตรวจสอบว่าล็อกอินหรือยัง ถ้าไม่ให้ดีดกลับหน้า Login ทันที
Access Control Logic: มีการดักกรณีโพสต์ที่ยังไม่ผ่านการอนุมัติ (is_pending) โดยอนุญาตให้ดูได้เฉพาะ Admin หรือ เจ้าของโพสต์ เท่านั้น
Engineering Reason: ป้องกันไม่ให้ User ทั่วไปเดา ID เพื่อเข้าไปดูโพสต์ที่ยังไม่ถูก Approve

การลบโพสต์:
Is Owner: ลบได้เพราะเป็นเจ้าของข้อมูล
Is Admin: ลบได้เพราะมีสิทธิ์ในการจัดการระบบ (Moderation)
ขึ้นเตือนให้ยืนยันกก่อนลบ


*/

'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { Toast } from '@/components/Toast';
import { Icon } from '@iconify/react';
import styles from './page.module.css';

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
    <div className={styles.loadingScreen}>
      RETRIEVING ARCHIVE
    </div>
  );

  const isOwner = user?.id === post.author_id;
  const canDelete = isOwner || isAdmin;

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header}>
        <h1
          className={styles.siteLogo}
          onClick={() => router.push('/main')}
        >
          INHERITANCE
        </h1>
      </header>

      <div className={styles.mainFrame}>

        {/* Title & Control Bar */}
        <div className={styles.titleBar}>
          <div className={styles.titleGroup}>
            <h2 className={styles.postTitle}>
              {post.title}
            </h2>
            <p className={styles.postSubject}>{post.subject_name || '-'}</p>
          </div>

          <div className={styles.actionButtons}>
            {isOwner && (
              <button
                onClick={() => router.push(`/edit/${id}`)}
                className={styles.btnEdit}
              >
                EDIT
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className={styles.btnDelete}
              >
                <Icon icon="pixelarticons:trash" width="20" />
                {isAdmin && !isOwner ? "MOD DELETE" : "DELETE"}
              </button>
            )}
          </div>
        </div>

        {/* Info Header */}
        <div className={styles.infoHeader}>
          <div className={styles.infoItem}>
            <Icon icon="la:book-solid" />
            <span>{post.subject_id || '-'}</span>
          </div>
          <div className={styles.infoItem}>
            <Icon icon="pixelarticons:user" />
            <span>{post.profiles?.username || "Deleted User"}</span>
          </div>
          <div className={styles.infoItem}>
            <Icon icon="pixelarticons:calendar" />
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className={styles.contentBody}>
          {post.description}
        </div>

        {/* Footer / Link Section */}
        <div className={styles.footer}>
          {post.media_link ? (
            <a
              href={post.media_link.startsWith('http') ? post.media_link : `https://${post.media_link}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.materialLink}
            >
              <Icon icon="pixelarticons:external-link" width="28" />
              ACCESS MATERIAL
            </a>
          ) : (
            <div className={styles.noLink}>
              [ NO EXTERNAL LINKS ATTACHED ]
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => router.push('/main')}
        className={styles.backButton}
      >
        <Icon icon="pixelarticons:arrow-left" />
        RETURN TO ARCHIVE LIST
      </button>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
