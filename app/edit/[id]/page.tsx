'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { Toast } from '@/components/Toast';

export default function EditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    subject_name: '',
    subject_id: '',
    description: '',
    media_link: ''
  });

  useEffect(() => {
    const fetchAndCheckOwner = async () => {
      // 1. ตรวจสอบ Session ผู้ใช้ปัจจุบัน
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      // 2. ดึงข้อมูลโพสต์เดิม
      const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !post) {
        alert("ไม่พบข้อมูลโพสต์");
        router.push('/main');
        return;
      }

      // 3. 🚨 Security Check: เจ้าของโพสต์เท่านั้นถึงจะมีสิทธิ์แก้
      // (ถ้าไม่ใช่เจ้าของ ให้เด้งกลับหน้าหลักทันที)
      if (post.author_id !== session.user.id) {
        alert("คุณไม่มีสิทธิ์แก้ไขโพสต์นี้");
        router.push('/main');
        return;
      }

      // 4. บรรจุข้อมูลเดิมลงใน State
      setFormData({
        title: post.title,
        subject_name: post.subject_name || '',
        subject_id: post.subject_id,
        description: post.description,
        media_link: post.media_link || ''
      });
      setLoading(false);
    };

    fetchAndCheckOwner();
  }, [id, router]);

const handleUpdate = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const { error } = await supabase
    .from('posts')
    .update({ ...formData, status: 'pending' })
    .eq('id', id);

  if (!error) {
    setShowSuccess(true);
    // หน่วงเวลาแป๊บหนึ่งให้ User เห็น Toast ก่อนเด้งกลับ
    setTimeout(() => router.push('/main'), 2000);
  } else {
    alert("Error updating post");
  }
};

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-jersey text-2xl text-heritage-logo">
      LOADING POST DATA...
    </div>
  );

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
        <div className="font-vt323 text-lg bg-white/50 px-4 py-1 rounded-full border border-heritage-frame">
          USER: {user?.email}
        </div>
      </header>

      {/* Main Content (Frame อิงตามรูป image_c88525.png) */}
      <div className="main-frame max-w-4xl w-full p-8 bg-[#D9D9D9] relative border-[6px] border-heritage-frame rounded-sm shadow-2xl">
        <h2 className="text-2xl font-bold font-prompt mb-6 text-center text-gray-800">EDIT & RESUBMIT</h2>
        
        <form onSubmit={handleUpdate} className="space-y-5 font-prompt">
          {/* ชื่อโพสต์ */}
          <input 
            type="text" 
            placeholder="กรอกชื่อโพสต์" 
            className="w-full p-4 bg-[#B8D4EE] rounded-full border-none shadow-inner placeholder:text-gray-500 focus:ring-2 focus:ring-heritage-logo outline-none"
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* ชื่อวิชา */}
            <input 
              type="text" 
              placeholder="กรอกชื่อวิชา" 
              className="p-4 bg-[#B8D4EE] rounded-full border-none shadow-inner placeholder:text-gray-500 focus:ring-2 focus:ring-heritage-logo outline-none"
              value={formData.subject_name} 
              onChange={(e) => setFormData({...formData, subject_name: e.target.value})}
            />
            {/* รหัสวิชา */}
            <input 
              type="text" 
              placeholder="กรอกรหัสวิชา" 
              className="p-4 bg-[#B8D4EE] rounded-full border-none shadow-inner placeholder:text-gray-500 focus:ring-2 focus:ring-heritage-logo outline-none"
              value={formData.subject_id} 
              onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
              required
            />
          </div>

          {/* รายละเอียด */}
          <textarea 
            placeholder="กรอกรายละเอียดโพสต์" 
            className="w-full p-6 bg-[#B8D4EE] rounded-3xl border-none shadow-inner placeholder:text-gray-500 focus:ring-2 focus:ring-heritage-logo outline-none min-h-[200px]"
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />

          {/* ลิงก์ และปุ่มกดยืนยัน */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <input 
                type="text" 
                placeholder="กรอกลิงก์ (Drive / Canva)" 
                className="w-full p-4 bg-[#B8D4EE] rounded-l-none rounded-r-none border-none shadow-inner placeholder:text-gray-500 focus:ring-2 focus:ring-heritage-logo outline-none"
                value={formData.media_link} 
                onChange={(e) => setFormData({...formData, media_link: e.target.value})}
              />
              <span className="absolute right-4 top-3.5 opacity-50">📤</span>
            </div>
            
            <button 
              type="submit" 
              className="w-full md:w-auto px-12 py-4 bg-[#F2EA7E] text-heritage-logo font-bold rounded-full border-2 border-heritage-frame hover:bg-[#fff9a0] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none font-jersey text-xl"
            >
              RESUBMIT
            </button>
          </div>
        </form>
      </div>

      <button 
        onClick={() => router.back()} 
        className="mt-8 font-vt323 text-gray-500 hover:text-red-500 transition-colors"
      >
        [ CANCEL AND RETURN TO MAIN ]
      </button>
      {showSuccess && (
  <Toast 
    message="แก้ไขข้อมูลและส่งตรวจใหม่เรียบร้อยแล้ว!" 
    onClose={() => setShowSuccess(false)} 
  />
)}
    </div>
    
  );
}