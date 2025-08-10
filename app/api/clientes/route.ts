import { NextResponse } from "next/server"
import mysqlPool from "@/lib/mysql"
import { requireSession } from "@/lib/auth"
import type { Cliente, ClienteCreate } from "@/types/cliente"

export const runtime = "nodejs"

export async function GET() {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const conn = await mysqlPool.getConnection()
  try {
    const [rows] = await conn.query(
      "SELECT id, nombre, telefono, direccion FROM clientes ORDER BY nombre ASC"
    )
    return NextResponse.json(rows as Cliente[])
  } catch (e) {
    console.error("Error al listar clientes:", e)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  } finally {
    conn.release()
  }
}

export async function POST(req: Request) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const body = (await req.json()) as ClienteCreate

    // 🔽 Normaliza a lowercase y trim
    const nombre = (body.nombre ?? "").trim().toLowerCase()
    const telefono = body.telefono ? String(body.telefono).trim().toLowerCase() : null
    const direccion = body.direccion ? String(body.direccion).trim().toLowerCase() : null

    if (!nombre) {
      return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 })
    }

    const conn = await mysqlPool.getConnection()
    try {
      // ❌ Evitar duplicado por nombre (case-insensitive)
      const [dups] = await conn.execute(
        "SELECT id FROM clientes WHERE nombre = ? LIMIT 1",
        [nombre]
      )
      if (Array.isArray(dups) && dups.length > 0) {
        return NextResponse.json(
          { error: "Ya existe un cliente con ese nombre." },
          { status: 409 }
        )
      }

      // ✅ Insert ya normalizado en lowercase
      const [result] = await conn.execute(
        "INSERT INTO clientes (nombre, telefono, direccion) VALUES (?, ?, ?)",
        [nombre, telefono, direccion]
      )
      const insertId = (result as any)?.insertId ?? 0

      return NextResponse.json(
        { message: "Cliente creado correctamente", id: insertId },
        { status: 201 }
      )
    } catch (e: any) {
      // Si agregas índice UNIQUE, capturamos 1062
      if (e?.code === "ER_DUP_ENTRY") {
        return NextResponse.json(
          { error: "Ya existe un cliente con ese nombre." },
          { status: 409 }
        )
      }
      console.error("Error al crear cliente:", e)
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    } finally {
      conn.release()
    }
  } catch (e) {
    console.error("Error al crear cliente:", e)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
