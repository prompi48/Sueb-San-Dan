/* 
lib/validation.ts
เก็บ reserved words และ regex สำหรับกฏการตั้งชื่อ
เก็บ function ตรวจชื่อ และ fn ตรวจรหัส
*/
export const RESERVED_WORDS = ['admin', 'system', 'root', 'moderator', 'support', 'inheritance', 'null', 'undefined', 'void', 'select', 'insert', 'delete', 'update', 'drop', 'alter', 'create', 'table', 'database'];

export const USERNAME_REGEX = /^[a-z0-9_]{3,16}$/;

export function validateUsername(username: string): string | null {
  if (RESERVED_WORDS.includes(username.toLowerCase())) return "That username is reserved.";
  if (!USERNAME_REGEX.test(username)) return "Username must be 3-16 characters (lowercase letters, numbers, underscores).";
  return null; // null = valid
}

export function validatePassword(password: string, confirmPassword?: string): string | null {
  if (password.length < 6) return "Password must be at least 6 characters.";
  if (confirmPassword !== undefined && password !== confirmPassword) return "Passwords do not match.";
  return null;
}