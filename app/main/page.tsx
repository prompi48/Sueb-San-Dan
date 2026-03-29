/*
app/main/page.tsx
หน้า Main หลักของแอป
ใช้ Suspense เพื่อรอโหลดข้อมูลจาก MainContent ถ้าข้อมูลยังไม่มา จะโชว์หน้าจอ Loading
*/
'use client';

import { Suspense } from 'react';
import MainContent from './MainContent';
import { Icon } from '@iconify/react';

export default function MainPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-heritage-bg font-jersey text-3xl tracking-widest text-dark-green gap-4">
        <Icon icon="pixelarticons:battery-charging" className="animate-bounce" width="60" />
        RELOADING SYSTEM ARCHIVES
      </div>
    }>
      <MainContent />
    </Suspense>
  );
}