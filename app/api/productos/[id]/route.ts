import { NextResponse } from "next/server"
import mysqlPool from "@/lib/mysql"
import { requireSession } from "@/lib/auth"

export const runtime = "nodejs"

// PUT /api/productos/:id
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await ctx.params
  const numId = Number(id)
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  try {
    const body = await req.json()
    const nombre = (body.nombre ?? "").trim().toLowerCase()
    let cantidad = Number(body.cantidad)
    if (!Number.isFinite(cantidad) || cantidad < 0) cantidad = 0

    if (!nombre) {
      return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 })
    }

    const conn = await mysqlPool.getConnection()
    try {
      // evita duplicado con otros IDs
      const [dups] = await conn.execute(
        "SELECT id FROM productos WHERE nombre = ? AND id <> ? LIMIT 1",
        [nombre, numId]
      )
      if (Array.isArray(dups) && dups.length > 0) {
        return NextResponse.json({ error: "Ya existe otro producto con ese nombre." }, { status: 409 })
      }

      const [result] = await conn.execute(
        "UPDATE productos SET nombre = ?, cantidad = ? WHERE id = ?",
        [nombre, cantidad, numId]
      )
      const affected = (result as any)?.affectedRows ?? 0
      if (affected === 0) {
        return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
      }
      return NextResponse.json({ message: "Producto actualizado" })
    } catch (e: any) {
      if (e?.code === "ER_DUP_ENTRY") {
        return NextResponse.json({ error: "Ya existe otro producto con ese nombre." }, { status: 409 })
      }
      console.error("PUT productos/:id", e)
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    } finally {
      conn.release()
    }
  } catch (e) {
    console.error("PUT /productos/:id", e)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE /api/productos/:id
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await ctx.params
  const numId = Number(id)
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  const conn = await mysqlPool.getConnection()
  try {
    const [result] = await conn.execute("DELETE FROM productos WHERE id = ?", [numId])
    const affected = (result as any)?.affectedRows ?? 0
    if (affected === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }
    return NextResponse.json({ message: "Producto eliminado" })
  } catch (e) {
    console.error("DELETE productos/:id", e)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  } finally {
    conn.release()
  }
}
