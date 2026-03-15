'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true); // เพิ่ม State สำหรับตอนเช็ค Session แรกเริ่ม
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // เช็ค Role จาก JWT แปะไปด้วยเลย เผื่อใช้แยกหน้า
        const role = session.user.app_metadata?.role;
        if (role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/main');
        }
      } else {
        setIsChecking(false); // เช็คเสร็จแล้วแต่ไม่มี session ถึงยอมให้เห็นหน้า login
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier.trim(), // ล้างช่องว่าง
      password: password,
    });

    if (error) {
      alert("Invalid Email or Password");
      setIsLoading(false);
    } else {
      // ดึง role จาก data ที่ได้หลัง login สำเร็จทันที
      const role = data.user?.app_metadata?.role;
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/main');
      }
    }
  };

  // ถ้ากำลังเช็ค Session อยู่ ให้โชว์หน้าว่างหรือ Loading สวยๆ แทนหน้า Login
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-heritage-bg font-jersey text-4xl animate-pulse">
        RECALLING ARCHIVE...
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full bg-heritage-bg flex items-center justify-center p-4 md:p-[100px]">
      <div className="w-full h-full max-w-[1720px] max-h-[880px] bg-heritage-bg border-[10px] border-heritage-frame rounded-[50px] shadow-lg flex flex-col items-center justify-center p-10">
        
        <h1 className="font-jersey text-[80px] md:text-[96px] text-heritage-logo drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] mb-16 tracking-wider text-center">
          INHERITANCE
        </h1>

        <form onSubmit={handleLogin} className="w-full max-w-[500px] flex flex-col gap-8">
          <input 
            required
            type="email" // เปลี่ยนเป็น email เพื่อให้ browser ช่วย validation เบื้องต้น
            placeholder="E-MAIL" 
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full h-[70px] bg-heritage-input rounded-full px-8 text-lg text-gray-500 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-heritage-frame/30 shadow-inner transition-all text-center"
          />

          <input 
            required
            type="password" 
            placeholder="PASSWORD" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-[70px] bg-heritage-input rounded-full px-8 text-lg text-gray-500 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-heritage-frame/30 shadow-inner transition-all text-center"
          />

          <div className="flex justify-center mt-2">
            <button 
              disabled={isLoading}
              type="submit" 
              className="w-[200px] h-[65px] bg-heritage-btn rounded-full text-2xl font-bold text-[#E1F5FE] hover:brightness-90 transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none disabled:opacity-50"
            >
              {isLoading ? '...' : 'LOG IN'}
            </button>
          </div>
        </form>

        <div className="flex flex-col md:flex-row items-center gap-4 mt-16 text-lg text-[#171717] font-medium">
          <p>Don&apos;t have an account yet?</p>
          <Link href="/register">
            <span className="px-8 py-2 bg-heritage-register rounded-full text-heritage-logo font-bold hover:brightness-95 transition-all shadow-[0_3px_0_0_rgba(0,0,0,0.1)] active:translate-y-0.5 active:shadow-none cursor-pointer">
              Sign Up
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}