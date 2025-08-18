// app/api/pedidos/[id]/route.ts
import { NextResponse } from "next/server"
import mysqlPool from "@/lib/mysql"
import { requireSession } from "@/lib/auth"
import type { EstadoPedido } from "@/types/pedido"

export const runtime = "nodejs"

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await ctx.params
  const pedidoId = Number(id)
  if (!Number.isFinite(pedidoId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  const body = await req.json()
  const estado: EstadoPedido | undefined = body.estado
  if (!estado || !["Pendiente","Entregado","Cancelado"].includes(estado)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
  }

  const conn = await mysqlPool.getConnection()
  try {
    await conn.beginTransaction()

    // obtener pedido para lógica de stock (si cambias política más adelante)
    const [[pedido]]: any = await conn.query(
      "SELECT id, producto_id, cantidad, estado FROM pedidos WHERE id = ? AND user_id = ? LIMIT 1",
      [pedidoId, session.uid]
    )
    if (!pedido) {
      await conn.rollback()
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    // Ejemplo: si pasas de Cancelado -> Pendiente, deberías descontar stock (si hay)
    if (pedido.estado === "Cancelado" && estado === "Pendiente") {
      const [[prod]]: any = await conn.query(
        "SELECT cantidad FROM productos WHERE id = ? AND user_id = ? LIMIT 1",
        [pedido.producto_id, session.uid]
      )
      if (!prod || prod.cantidad < pedido.cantidad) {
        await conn.rollback()
        return NextResponse.json({ error: "Stock insuficiente al reabrir" }, { status: 400 })
      }
      await conn.query(
        "UPDATE productos SET cantidad = cantidad - ? WHERE id = ? AND user_id = ?",
        [pedido.cantidad, pedido.producto_id, session.uid]
      )
    }

    // si pasas de Pendiente -> Cancelado, restituyes stock
    if (pedido.estado === "Pendiente" && estado === "Cancelado") {
      await conn.query(
        "UPDATE productos SET cantidad = cantidad + ? WHERE id = ? AND user_id = ?",
        [pedido.cantidad, pedido.producto_id, session.uid]
      )
    }

    await conn.query(
      "UPDATE pedidos SET estado = ? WHERE id = ? AND user_id = ?",
      [estado, pedidoId, session.uid]
    )

    await conn.commit()
    return NextResponse.json({ message: "Pedido actualizado" })
  } catch (e) {
    await conn.rollback()
    console.error("PUT /pedidos/[id]:", e)
    return NextResponse.json({ error: "Error al actualizar pedido" }, { status: 500 })
  } finally {
    conn.release()
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await ctx.params
  const pedidoId = Number(id)
  if (!Number.isFinite(pedidoId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  const conn = await mysqlPool.getConnection()
  try {
    await conn.beginTransaction()

    const [[pedido]]: any = await conn.query(
      "SELECT id, producto_id, cantidad, estado FROM pedidos WHERE id = ? AND user_id = ? LIMIT 1",
      [pedidoId, session.uid]
    )
    if (!pedido) {
      await conn.rollback()
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    // restitución de stock solo si estaba Pendiente
    if (pedido.estado === "Pendiente") {
      await conn.query(
        "UPDATE productos SET cantidad = cantidad + ? WHERE id = ? AND user_id = ?",
        [pedido.cantidad, pedido.producto_id, session.uid]
      )
    }

    await conn.query(
      "DELETE FROM pedidos WHERE id = ? AND user_id = ?",
      [pedidoId, session.uid]
    )

    await conn.commit()
    return NextResponse.json({ message: "Pedido eliminado" })
  } catch (e) {
    await conn.rollback()
    console.error("DELETE /pedidos/[id]:", e)
    return NextResponse.json({ error: "Error al eliminar pedido" }, { status: 500 })
  } finally {
    conn.release()
  }
}
