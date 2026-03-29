/*
app/register/page.tsx
หน้า Register สำหรับสมัครสมาชิกใหม่

ใช้ supabase.auth.signUp สมัครสมาชิกในระบบ Auth ของ Supabase และบันทึก username ลงตาราง Profiles
มีปุ่ม show/hide password

ก่อนจะยิง API ไปที่ Serverโค้ดมีการเรียกใช้ฟังก์ชันที่เขียนไว้ใน lib/validation.ts ตรวจชื่อและรหัสผ่าน
มีการ Query ตาราง profiles ก่อนเพื่อดูว่ามีชื่อนี้หรือยัง
ล็อคปุ่ม Register ขณะที่กำลังรอผลจาก Server เพื่อป้องกันการกดซ้ำ ด้วย isLoading

ถ้าสมัครใน Auth สำเร็จ แต่การบันทึกลงตาราง Profiles ล้มเหลว
ผู้ใช้ต้องติดต่อ Admin เพื่อรัน sql ลบ user ที่เพิ่งสร้างในตาราง auth.users ออก แล้วสมัครใหม่อีกครั้ง เพราะระบบเราแยกการจัดการข้อมูลผู้ใช้ระหว่าง Auth กับ Profiles

*/
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { validateUsername, validatePassword } from '@/lib/validation'
import styles from './register.module.css'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // --- [1. VALIDATION พื้นฐาน] ---
    const usernameValidation = validateUsername(username)
    if (usernameValidation) return alert(usernameValidation)

    const passValidationError = validatePassword(password, confirmPassword)
    if (passValidationError) return alert(passValidationError)

    setIsLoading(true)

    try {
      // --- [2. ตรวจสอบ USERNAME ซ้ำในตาราง PROFILES] ---
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single()

      if (existingUser) {
        setIsLoading(false)
        return alert('This username is already taken. Please choose another one.')
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
          .update({ username })
          .eq('id', authData.user.id)

        if (profileError) {
          setIsLoading(false)
          return alert(`Account created but profile failed: ${profileError.message}`)
        }

        alert('Registration Successful! Welcome to Inheritance.')
        router.push('/main')
      }
    } catch (err) {
      console.error(err)
      alert('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>

        <h1 className={styles.title}>INHERITANCE</h1>

        <form onSubmit={handleRegister} className={styles.form}>

          <input
            required
            type="email"
            placeholder="E-MAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />

          <input
            required
            type="text"
            placeholder="USERNAME"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className={styles.input}
          />

          {/* PASSWORD พร้อมปุ่ม show/hide */}
          <div className={styles.inputWrapper}>
            <input
              required
              type={showPassword ? 'text' : 'password'}
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${styles.input} ${styles.inputWithIcon}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.eyeButton}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <Icon icon={showPassword ? 'pixelarticons:eye-closed' : 'pixelarticons:eye'} width="24" />
            </button>
          </div>

          {/* CONFIRM PASSWORD พร้อมปุ่ม show/hide */}
          <div className={styles.inputWrapper}>
            <input
              required
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="CONFIRM PASSWORD"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${styles.input} ${styles.inputWithIcon}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={styles.eyeButton}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              <Icon icon={showConfirmPassword ? 'pixelarticons:eye-closed' : 'pixelarticons:eye'} width="24" />
            </button>
          </div>

          <div className={styles.submitWrapper}>
            <button
              disabled={isLoading}
              type="submit"
              className={styles.submitButton}
            >
              {isLoading ? '...' : 'REGISTER'}
            </button>
          </div>

        </form>

        <div className={styles.backLink}>
          <Link href="/">← Back to Login</Link>
        </div>

      </div>
    </main>
  )
}
