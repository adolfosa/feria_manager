import { NextResponse } from "next/server"
import mysqlPool from "@/lib/mysql"
import { requireSession } from "@/lib/auth"
import type { Cliente, ClienteCreate } from "@/types/cliente"

export const runtime = "nodejs"

export async function GET() {
  const session = await requireSession()
  const userId = Number((session as any).userId ?? (session as any).id ?? (session as any).uid)
  if (!Number.isFinite(userId)) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const conn = await mysqlPool.getConnection()
  try {
    const [rows] = await conn.execute(
      "SELECT id, nombre, telefono, direccion FROM clientes WHERE user_id = ? ORDER BY nombre ASC",
      [userId]
    )
    return NextResponse.json(rows as Cliente[])
  } catch (e) {
    console.error("GET clientes:", e)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  } finally {
    conn.release()
  }
}

export async function POST(req: Request) {
  const session = await requireSession()
  const userId = Number((session as any).userId ?? (session as any).id ?? (session as any).uid)
  if (!Number.isFinite(userId)) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const body = (await req.json()) as ClienteCreate
    const nombre = (body.nombre ?? "").trim().toLowerCase()
    const telefono = body.telefono ? String(body.telefono).trim().toLowerCase() : null
    const direccion = body.direccion ? String(body.direccion).trim().toLowerCase() : null
    if (!nombre) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 })

    const conn = await mysqlPool.getConnection()
    try {
      // duplicado por usuario
      const [dups] = await conn.execute(
        "SELECT id FROM clientes WHERE user_id = ? AND nombre = ? LIMIT 1",
        [userId, nombre]
      )
      if (Array.isArray(dups) && dups.length > 0) {
        return NextResponse.json({ error: "Ya existe un cliente con ese nombre." }, { status: 409 })
      }

      const [result] = await conn.execute(
        "INSERT INTO clientes (user_id, nombre, telefono, direccion) VALUES (?, ?, ?, ?)",
        [userId, nombre, telefono, direccion]
      )
      const insertId = (result as any)?.insertId ?? 0
      return NextResponse.json({ message: "Cliente creado correctamente", id: insertId }, { status: 201 })
    } catch (e: any) {
      if (e?.code === "ER_DUP_ENTRY") {
        return NextResponse.json({ error: "Ya existe un cliente con ese nombre." }, { status: 409 })
      }
      console.error("POST clientes:", e)
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    } finally {
      conn.release()
    }
  } catch (e) {
    console.error("POST clientes:", e)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
