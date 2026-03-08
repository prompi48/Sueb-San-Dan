'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'


// Eye Icon
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

// EyeaOff Icon
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.07.37-2.07 1-2.9M6.1 6.1A8.965 8.965 0 0112 5c5 0 9 4 9 7a8.96 8.96 0 01-2.1 3.9M3 3l18 18" />
  </svg>
)

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false) // เพิ่มสถานะโหลด
  const [showPassword, setShowPassword] = useState(false)           // เพิ่ม
  const [showConfirmPassword, setShowConfirmPassword] = useState(false) // เพิ่ม
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

          {/* PASSWORD พร้อมปุ่ม show/hide */}
          <div className="relative w-full">

          <input 
            required
            type="password" 
            placeholder={showPassword ? 'text' : 'password'} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-[65px] bg-heritage-input rounded-full px-8 pr-14 text-lg text-gray-500 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-heritage-frame/30 shadow-inner transition-all text-center [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
          />

          <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-heritage-logo transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>

          </div>

          {/* CONFIRM PASSWORD พร้อมปุ่ม show/hide */}
          <div className="relative w-full">

          <input 
            required
            type={showConfirmPassword ? 'text' : 'password'} 
            placeholder="CONFIRM PASSWORD" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-[65px] bg-heritage-input rounded-full px-8 text-lg text-gray-500 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-heritage-frame/30 shadow-inner transition-all text-center [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
          />
          <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-heritage-logo transition-colors"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

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