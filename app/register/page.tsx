'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false) // เพิ่มสถานะโหลด
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault() // ป้องกันหน้าเว็บรีโหลด

    // รายชื่อคำต้องห้าม
    const reservedWords = ['admin', 'system', 'root', 'moderator', 'support', 'inheritance'];

    // ตรวจสอบว่า Username ที่พิมพ์มา อยู่ในรายชื่อไหม
    if (reservedWords.includes(username.toLowerCase())) {
      return alert("This username is reserved. Please choose another one.");
    }

    // ตรวจสอบ Username: ภาษาอังกฤษ, ตัวเลข, _ และต้องยาว 3-16 ตัว
    const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/

    if (!usernameRegex.test(username)) {
      return alert("Username must be 3-16 characters and contain only English letters, numbers, or underscores.")
    }

    // 2. เช็กว่ารหัสผ่านตรงกันไหม
    if (password !== confirmPassword) {
      return alert("Passwords do not match!")
    }

    if (password.length < 6) {
      return alert("Password must be at least 6 characters.")
    }

    setIsLoading(true)

    // 3. สมัครสมาชิกในระบบ Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setIsLoading(false)
      return alert(authError.message)
    }

    // 4. ถ้าสมัครผ่าน บันทึกลงตาราง profiles
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: authData.user.id, 
            username: username,
            role: 'student' 
          }
        ])

      if (profileError) {
        alert("Error saving profile: " + profileError.message)
      } else {
        alert("Registration Successful! Welcome to Inheritance.")
        router.push('/main')
      }
    }
    setIsLoading(false)
  }

  return (
    <main className="min-h-screen w-full bg-heritage-bg flex items-center justify-center p-4 md:p-[100px]">
      <div className="w-full h-full max-w-[1720px] max-h-[880px] bg-heritage-bg border-[10px] border-heritage-frame rounded-[50px] shadow-lg flex flex-col items-center justify-center p-10">
        
        <h1 className="font-jersey text-[70px] md:text-[80px] text-heritage-logo drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] mb-10 tracking-wider text-center">
          INHERITANCE
        </h1>

        <form onSubmit={handleRegister} className="w-full max-w-[500px] flex flex-col gap-5">
          <input 
            required
            type="email" 
            placeholder="E-MAIL" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-[65px] bg-heritage-input rounded-full px-8 text-lg text-gray-500 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-heritage-frame/30 shadow-inner transition-all text-center"
          />
          <input 
            required
            type="text" 
            placeholder="USERNAME" 
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}//allow only lowercase in username for search and consistency
            className="w-full h-[65px] bg-heritage-input rounded-full px-8 text-lg text-gray-500 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-heritage-frame/30 shadow-inner transition-all text-center"
          />
          <input 
            required
            type="password" 
            placeholder="PASSWORD" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-[65px] bg-heritage-input rounded-full px-8 text-lg text-gray-500 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-heritage-frame/30 shadow-inner transition-all text-center"
          />
          <input 
            required
            type="password" 
            placeholder="CONFIRM PASSWORD" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-[65px] bg-heritage-input rounded-full px-8 text-lg text-gray-500 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-heritage-frame/30 shadow-inner transition-all text-center"
          />

          <div className="flex justify-center mt-4">
            <button 
              disabled={isLoading}
              type="submit" 
              className="w-[200px] h-[60px] bg-heritage-btn rounded-full text-2xl font-bold text-[#E1F5FE] hover:brightness-90 transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none disabled:opacity-50"
            >
              {isLoading ? '...' : 'REGISTER'}
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