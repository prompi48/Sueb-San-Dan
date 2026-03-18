// app/main/page.tsx
'use client';

import { Suspense } from 'react';
import MainContent from './MainContent'; // Import จากไฟล์ที่เราแยกออกไป
import { Icon } from '@iconify/react';

export default function MainPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-heritage-bg font-jersey text-3xl tracking-widest text-heritage-logo gap-4">
        <Icon icon="pixelarticons:battery-charging" className="animate-bounce" width="60" />
        RELOADING SYSTEM ARCHIVES
      </div>
    }>
      <MainContent />
    </Suspense>
  );
}