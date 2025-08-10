// lib/auth.ts
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!)

export async function requireSession() {
  const store = await cookies()
  const token = store.get("session")?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { uid: string | number; email: string; name: string }
  } catch {
    return null
  }
}
