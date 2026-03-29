/*
lib/supabase.ts
เชื่อมต่อกับ Supabase โดยใช้ URL และ ANON KEY จาก .env.local
ใช้ || (OR) เพื่อใส่ค่า 'placeholder' ไว้ในกรณีที่ลืม .env.local จะแจ้งเตือนผ่าน Error ของ API แทน
*/

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)