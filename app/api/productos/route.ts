import { NextResponse } from "next/server"
import mysqlPool from "@/lib/mysql"
import { requireSession } from "@/lib/auth"
import type { Producto, ProductoCreate } from "@/types/producto"

export const runtime = "nodejs"

export async function GET() {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const conn = await mysqlPool.getConnection()
  try {
    const [rows] = await conn.query("SELECT id, nombre, cantidad FROM productos ORDER BY nombre ASC")
    const data = (rows as any[]).map((r) => ({
      id: Number(r.id),
      nombre: String(r.nombre),
      cantidad: Number(r.cantidad),
    })) as Producto[]
    return NextResponse.json(data)
  } catch (e) {
    console.error("Error al listar productos:", e)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  } finally {
    conn.release()
  }
}

export async function POST(req: Request) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const body = (await req.json()) as ProductoCreate

    // normaliza a lowercase
    const nombre = (body.nombre ?? "").trim().toLowerCase()
    let cantidad = Number(body.cantidad)
    if (!Number.isFinite(cantidad) || cantidad < 0) cantidad = 0

    if (!nombre) {
      return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 })
    }

    const conn = await mysqlPool.getConnection()
    try {
      // evita duplicados por nombre (ya en lowercase)
      const [dups] = await conn.execute("SELECT id FROM productos WHERE nombre = ? LIMIT 1", [nombre])
      if (Array.isArray(dups) && dups.length > 0) {
        return NextResponse.json({ error: "Ya existe un producto con ese nombre." }, { status: 409 })
      }

      const [result] = await conn.execute(
        "INSERT INTO productos (nombre, cantidad) VALUES (?, ?)",
        [nombre, cantidad]
      )
      const insertId = (result as any)?.insertId ?? 0
      return NextResponse.json({ message: "Producto creado", id: insertId }, { status: 201 })
    } catch (e: any) {
      if (e?.code === "ER_DUP_ENTRY") {
        return NextResponse.json({ error: "Ya existe un producto con ese nombre." }, { status: 409 })
      }
      console.error("Error al crear producto:", e)
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    } finally {
      conn.release()
    }
  } catch (e) {
    console.error("POST /productos", e)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
