import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full bg-heritage-bg flex items-center justify-center p-4 md:p-[100px]">
      <div className="w-full h-full max-w-[1720px] max-h-[880px] bg-heritage-bg border-[10px] border-heritage-frame rounded-[50px] shadow-lg flex flex-col items-center justify-center p-10">
        
        {/* LOGO */}
        <h1 className="font-jersey text-[70px] md:text-[80px] text-heritage-logo drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] mb-10 tracking-wider text-center">
          INHERITANCE
        </h1>

        {/* ฟอร์ม Register: เพิ่มช่องตามรูป Figma */}
        <form className="w-full max-w-[500px] flex flex-col gap-5">
          <input 
            type="email" 
            placeholder="E-MAIL" 
            className="w-full h-[65px] bg-heritage-input rounded-full px-8 text-lg text-gray-500 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-heritage-frame/30 shadow-inner transition-all text-center"
          />
          <input 
            type="text" 
            placeholder="USERNAME" 
            className="w-full h-[65px] bg-heritage-input rounded-full px-8 text-lg text-gray-500 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-heritage-frame/30 shadow-inner transition-all text-center uppercase"
          />
          <input 
            type="password" 
            placeholder="PASSWORD" 
            className="w-full h-[65px] bg-heritage-input rounded-full px-8 text-lg text-gray-500 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-heritage-frame/30 shadow-inner transition-all text-center uppercase"
          />
          <input 
            type="password" 
            placeholder="CONFIRM PASSWORD" 
            className="w-full h-[65px] bg-heritage-input rounded-full px-8 text-lg text-gray-500 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-heritage-frame/30 shadow-inner transition-all text-center uppercase"
          />

          {/* ปุ่ม REGISTER */}
          <div className="flex justify-center mt-4">
            <button 
              type="submit" 
              className="w-[200px] h-[60px] bg-heritage-btn rounded-full text-2xl font-bold text-[#E1F5FE] hover:brightness-90 transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none"
            >
              REGISTER
            </button>
          </div>
        </form>

        <div className="mt-8">
          <Link href="/" className="text-heritage-logo font-bold hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}