/*
app/layout.tsx
โครงสร้างพื้นฐาน ของทั้งแอป กำหนดค่าส่วนกลางที่จะถูกนำไปใช้ในทุกหน้า

โหลดฟอนต์มาเก็บไว้ที่ Server ของเราเองตอน Build ระบบ ทำให้เว็บโหลดเร็วขึ้นและลดปัญหาหน้าเว็บกระตุกตอนฟอนต์โหลด
มีการตั้งค่า Metadata สำหรับ SEO และการแสดงผลในเบราว์เซอร์ เช่น ชื่อเว็บและคำอธิบาย
*/

import type { Metadata } from "next";
import { Geist, Geist_Mono, Jersey_10 } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jersey10 = Jersey_10({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jersey",
});

export const metadata: Metadata = {
  title: "Inheritance - มรดกวิชา",
  description: "ระบบสืบสันดานวิชาจากรุ่นพี่สู่รุ่นน้อง",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jersey10.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}