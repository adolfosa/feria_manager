// app/api/session/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import mysqlPool from "@/lib/mysql"

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!)

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value
  if (!token) return NextResponse.json({ ok: false }, { status: 401 })

  try {
    const { payload } = await jwtVerify(token, secret)
    const uid = Number(payload.uid)
    if (!Number.isFinite(uid)) return NextResponse.json({ ok: false }, { status: 401 })

    // Opción A: devolver lo del JWT (rápido)
    // return NextResponse.json({
    //   ok: true,
    //   user: { id: uid, name: payload.name, email: payload.email, picture: (payload as any).picture ?? null },
    // })

    // Opción B (recomendada): refrescar desde DB
    const conn = await mysqlPool.getConnection()
    try {
      const [rows] = await conn.execute(
        "SELECT id, name, email, picture FROM users WHERE id = ? LIMIT 1",
        [uid]
      )
      const user = Array.isArray(rows) ? rows[0] : null
      if (!user) return NextResponse.json({ ok: false }, { status: 401 })
      return NextResponse.json({ ok: true, user })
    } finally {
      conn.release()
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
}
