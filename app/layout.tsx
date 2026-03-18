import type { Metadata } from "next";
import { Geist, Geist_Mono, Jersey_10 } from "next/font/google"; // 1. เพิ่ม Jersey_10 ตรงนี้
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 2. ตั้งค่า Jersey 10
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