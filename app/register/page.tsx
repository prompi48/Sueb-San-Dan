'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react';

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false) // เพิ่มสถานะโหลด
  const [showPassword, setShowPassword] = useState(false) // เพิ่ม State สำหรับ show/hide password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false) // เพิ่ม State สำหรับ show/hide confirm password
  const router = useRouter()

const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // --- [1. VALIDATION พื้นฐาน] ---
    const reservedWords = ['admin', 'system', 'root', 'moderator', 'support', 'inheritance', 'null', 'undefined', 'void', 'select', 'insert', 'delete', 'update', 'drop', 'alter', 'create', 'table', 'database'];
    if (reservedWords.includes(username.toLowerCase())) {
      return alert("This username is reserved.");
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/
    if (!usernameRegex.test(username)) {
      return alert("Username must be 3-16 characters (English letters, numbers, underscores).")
    }

    if (password !== confirmPassword) return alert("Passwords do not match!")
    if (password.length < 6) return alert("Password must be at least 6 characters.")

    setIsLoading(true)

    try {
      // --- [2. ตรวจสอบ USERNAME ซ้ำในตาราง PROFILES] ---
      // เราเช็คก่อนเลยว่ามีใครใช้ชื่อนี้หรือยัง เพื่อไม่ให้เกิดขยะในระบบ Auth
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single()

      if (existingUser) {
        setIsLoading(false)
        return alert("This username is already taken. Please choose another one.")
      }

      // --- [3. สมัครสมาชิกในระบบ AUTH] ---
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      })

      if (authError) {
        setIsLoading(false)
        return alert(authError.message)
      }

      // --- [4. บันทึกลงตาราง PROFILES] ---
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ username: username }) // ✅ update instead of insert
          .eq('id', authData.user.id)

        if (profileError) {
          setIsLoading(false)
          return alert(`Account created but profile failed: ${profileError.message}`);
        }

        alert("Registration Successful! Welcome to Inheritance.")
        router.push('/main')
      }
    } catch (err) {
      console.error(err)
      alert("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
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
              type={showPassword ? 'text' : 'password'} 
              placeholder="PASSWORD" 
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
              <Icon icon={showPassword ? 'pixelarticons:eye-closed' : 'pixelarticons:eye'} width="24" />
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
              className="w-full h-[65px] bg-heritage-input rounded-full px-8 pr-14 text-lg text-gray-500 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-heritage-frame/30 shadow-inner transition-all text-center [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-heritage-logo transition-colors"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              <Icon icon={showConfirmPassword ? 'pixelarticons:eye-closed' : 'pixelarticons:eye'} width="24" />
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