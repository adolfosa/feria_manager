import { NextResponse } from "next/server"
import mysqlPool from "@/lib/mysql"
import { requireSession } from "@/lib/auth"

export const runtime = "nodejs"

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  const userId = Number((session as any).userId ?? (session as any).id ?? (session as any).uid)
  if (!Number.isFinite(userId)) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await ctx.params
  const numId = Number(id)
  if (!Number.isFinite(numId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  const body = await req.json()
  const nombre = (body.nombre ?? "").trim().toLowerCase()
  const telefono = body.telefono ? String(body.telefono).trim().toLowerCase() : null
  const direccion = body.direccion ? String(body.direccion).trim().toLowerCase() : null
  if (!nombre) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 })

  const conn = await mysqlPool.getConnection()
  try {
    // duplicado por usuario (excluyendo este id)
    const [dups] = await conn.execute(
      "SELECT id FROM clientes WHERE user_id = ? AND nombre = ? AND id <> ? LIMIT 1",
      [userId, nombre, numId]
    )
    if (Array.isArray(dups) && dups.length > 0) {
      return NextResponse.json({ error: "Ya existe otro cliente con ese nombre." }, { status: 409 })
    }

    const [result] = await conn.execute(
      "UPDATE clientes SET nombre = ?, telefono = ?, direccion = ? WHERE id = ? AND user_id = ?",
      [nombre, telefono, direccion, numId, userId]
    )
    const affected = (result as any)?.affectedRows ?? 0
    if (affected === 0) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })

    return NextResponse.json({ message: "Cliente actualizado correctamente" })
  } catch (e: any) {
    if (e?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Ya existe otro cliente con ese nombre." }, { status: 409 })
    }
    console.error("PUT clientes/:id", e)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  } finally {
    conn.release()
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  const userId = Number((session as any).userId ?? (session as any).id ?? (session as any).uid)
  if (!Number.isFinite(userId)) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await ctx.params
  const numId = Number(id)
  if (!Number.isFinite(numId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  const conn = await mysqlPool.getConnection()
  try {
    const [result] = await conn.execute("DELETE FROM clientes WHERE id = ? AND user_id = ?", [numId, userId])
    const affected = (result as any)?.affectedRows ?? 0
    if (affected === 0) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    return NextResponse.json({ message: "Cliente eliminado correctamente" })
  } catch (e) {
    console.error("DELETE clientes/:id", e)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  } finally {
    conn.release()
  }
}
