'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Checking session...');

  useEffect(() => {
    const checkUser = async () => {
      // ตรวจสอบว่าผู้ใช้ Login อยู่แล้วหรือไม่
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setStatus('You are already logged in. Redirecting...');
        // ถ้า Login แล้ว ให้พากลับหน้าหลัก (Root หรือ /main ตามที่คุณตั้งไว้)
        setTimeout(() => router.push('/'), 1000); 
      } else {
        setStatus('Please sign in to continue.');
        // ตรงนี้ถ้าคุณมีระบบ Auth UI (เช่น Supabase Auth UI) สามารถเอามาแปะได้เลยครับ
      }
    };

    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F1EA] font-prompt">
      <div className="main-frame max-w-md w-full p-10 bg-[#D9D9D9] text-center shadow-xl">
        <h1 className="text-4xl font-bold text-heritage-logo font-jersey mb-6">INHERITANCE</h1>
        
        <div className="p-6 bg-[#BFD6E8] rounded-xl border-2 border-heritage-frame mb-6">
          <p className="font-vt323 text-2xl text-heritage-logo animate-pulse">
            {status}
          </p>
        </div>

        {/* ปุ่มกลับหน้าหลักกรณีที่ User หลงมาแต่ไม่อยาก Login */}
        <button 
          onClick={() => router.push('/')}
          className="font-vt323 text-xl text-gray-500 hover:text-heritage-logo transition-colors"
        >
          [ BACK TO HOME ]
        </button>
      </div>
    </div>
  );
}