import Link from 'next/link';

export default function LoginPage() {
  return (
    // แก้ไข: ใช้ bg-heritage-bg และ flex เพื่อจัดกลางหน้าจอ
    <main className="min-h-screen w-full bg-heritage-bg flex items-center justify-center p-4 md:p-[100px]">
      
      {/* กรอบสี่เหลี่ยมขอบมน: ใช้ border-heritage-frame หนา 10px */}
      <div className="w-full h-full max-w-[1720px] max-h-[880px] bg-heritage-bg border-[10px] border-heritage-frame rounded-[50px] shadow-lg flex flex-col items-center justify-center p-10">
        
        {/* LOGO: font-jersey และ text-heritage-logo พร้อม shadow-logo ที่ตั้งไว้ใน globals.css */}
        <h1 className="font-jersey text-[80px] md:text-[96px] text-heritage-logo drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] mb-16 tracking-wider text-center">
        INHERITANCE
        </h1>

        {/* ฟอร์ม Login */}
        <form className="w-full max-w-[500px] flex flex-col gap-8">
          
          {/* ช่อง Username: ใช้ bg-heritage-input และเงา shadow-inner ตามรูป Figma */}
          <input 
            type="text" 
            placeholder="USERNAME" 
            className="w-full h-[70px] bg-heritage-input rounded-full px-8 text-lg text-gray-500 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-heritage-frame/30 shadow-inner transition-all text-center uppercase"
          />

          {/* ช่อง Password */}
          <input 
            type="password" 
            placeholder="PASSWORD" 
            className="w-full h-[70px] bg-heritage-input rounded-full px-8 text-lg text-gray-500 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-heritage-frame/30 shadow-inner transition-all text-center uppercase"
          />

          {/* ปุ่ม Login: ใช้ bg-heritage-btn และตัวหนังสือสีขาวอมฟ้าอ่อน */}
          <div className="flex justify-center mt-2">
            <button 
              type="submit" 
              className="w-[200px] h-[65px] bg-heritage-btn rounded-full text-2xl font-bold text-[#E1F5FE] hover:brightness-90 transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none"
            >
              LOG IN
            </button>
          </div>
        </form>

        {/* ส่วน Register: ใช้ bg-heritage-register */}
        <div className="flex flex-col md:flex-row items-center gap-4 mt-16 text-lg text-[#171717] font-medium">
          <p>Don&apos;t have an account yet?</p>
          <Link href="/register">
            <button className="px-8 py-2 bg-heritage-register rounded-full text-heritage-logo font-bold hover:brightness-95 transition-all shadow-[0_3px_0_0_rgba(0,0,0,0.1)] active:translate-y-0.5 active:shadow-none">
              Sign Up
            </button>
          </Link>
        </div>

      </div>
    </main>
  );
}