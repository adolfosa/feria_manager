// app/api/auth/google/route.ts
import { NextResponse } from "next/server"
import { OAuth2Client } from "google-auth-library"
import { SignJWT } from "jose"
import mysqlPool from "@/lib/mysql"

export const runtime = "nodejs" // necesario para mysql2

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const AUTH_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET)

export async function POST(req: Request) {
  try {
    const { credential } = (await req.json()) as { credential?: string }
    if (!credential) {
      return NextResponse.json({ ok: false, error: "Missing credential" }, { status: 400 })
    }

    // 1) Verificar token con Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    if (!payload) {
      return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 })
    }

    const { sub, name, email, picture } = payload
    if (!sub || !name || !email) {
      return NextResponse.json({ ok: false, error: "Incomplete Google profile" }, { status: 401 })
    }

    // 2) Upsert en MySQL
    const conn = await mysqlPool.getConnection()
    try {
      await conn.execute(
        `
        INSERT INTO users (google_sub, name, email, picture)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          email = VALUES(email),
          picture = VALUES(picture)
        `,
        [sub, name, email, picture ?? null]
      )

      const [rows] = await conn.execute(
        `SELECT id, name, email, picture FROM users WHERE google_sub = ? LIMIT 1`,
        [sub]
      )

      const user = Array.isArray(rows) ? (rows[0] as any) : null
      if (!user) {
        return NextResponse.json({ ok: false, error: "User fetch failed" }, { status: 500 })
      }

      // 3) Firmar cookie de sesión (JWT)
      const jwt = await new SignJWT({ uid: user.id, email: user.email, name: user.name })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(AUTH_SECRET)

      const res = NextResponse.json({ ok: true, user })
      res.cookies.set("session", jwt, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
      return res
    } finally {
      conn.release()
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ ok: false, error: "Auth error" }, { status: 500 })
  }
}
