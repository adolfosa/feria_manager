// app/api/session/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

export const runtime = "nodejs" // opcional, pero consistente con tu stack

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!)

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value
  if (!token) return NextResponse.json({ ok: false }, { status: 401 })

  try {
    const { payload } = await jwtVerify(token, secret)
    return NextResponse.json({
      ok: true,
      user: { id: payload.uid, email: payload.email, name: payload.name },
    })
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
}
