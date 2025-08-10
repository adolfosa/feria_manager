// app/api/clientes/[id]/route.ts
import { NextResponse } from "next/server"
import mysqlPool from "@/lib/mysql"
import { requireSession } from "@/lib/auth"

export const runtime = "nodejs"

// PUT /api/clientes/:id
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

    // 🔽 Normaliza a lowercase y trim
    const nombre = (body.nombre ?? "").trim().toLowerCase()
    const telefono = body.telefono ? String(body.telefono).trim().toLowerCase() : null
    const direccion = body.direccion ? String(body.direccion).trim().toLowerCase() : null

    if (!nombre) {
      return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 })
    }

    const conn = await mysqlPool.getConnection()
    try {
      // ❌ Evitar duplicado de nombre en otro registro
      const [dups] = await conn.execute(
        "SELECT id FROM clientes WHERE nombre = ? AND id <> ? LIMIT 1",
        [nombre, numId]
      )
      if (Array.isArray(dups) && dups.length > 0) {
        return NextResponse.json(
          { error: "Ya existe otro cliente con ese nombre." },
          { status: 409 }
        )
      }

      const [result] = await conn.execute(
        "UPDATE clientes SET nombre = ?, telefono = ?, direccion = ? WHERE id = ?",
        [nombre, telefono, direccion, numId]
      )
      const affected = (result as any)?.affectedRows ?? 0
      if (affected === 0) {
        return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
      }

      return NextResponse.json({ message: "Cliente actualizado correctamente" })
    } catch (e: any) {
      if (e?.code === "ER_DUP_ENTRY") {
        return NextResponse.json(
          { error: "Ya existe otro cliente con ese nombre." },
          { status: 409 }
        )
      }
      console.error("PUT clientes/:id", e)
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    } finally {
      conn.release()
    }
  } catch (e) {
    console.error("PUT clientes/:id", e)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE /api/clientes/:id
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params                      // 👈 await
  const numId = Number(id)
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  const conn = await mysqlPool.getConnection()
  try {
    const [result] = await conn.execute("DELETE FROM clientes WHERE id = ?", [numId])
    const affected = (result as any)?.affectedRows ?? 0
    if (affected === 0) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }
    return NextResponse.json({ message: "Cliente eliminado correctamente" })
  } catch (e) {
    console.error("DELETE clientes/:id", e)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  } finally {
    conn.release()
  }
}
