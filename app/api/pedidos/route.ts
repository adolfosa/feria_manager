// app/api/pedidos/route.ts
import { NextResponse } from "next/server"
import mysqlPool from "@/lib/mysql"
import { requireSession } from "@/lib/auth"
import type { Pedido } from "@/types/pedido"

export const runtime = "nodejs"

export async function GET() {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const conn = await mysqlPool.getConnection()
  try {
    const [rows] = await conn.query(
      `
      SELECT
        p.id,
        p.user_id,
        p.cliente_id,
        c.nombre AS cliente_nombre,
        p.producto_id,
        pr.nombre AS producto_nombre,
        p.cantidad,
        DATE_FORMAT(p.fecha_entrega, '%Y-%m-%d') AS fecha_entrega,
        p.estado
      FROM pedidos p
      JOIN clientes  c  ON c.id = p.cliente_id  AND c.user_id  = p.user_id
      JOIN productos pr ON pr.id = p.producto_id AND pr.user_id = p.user_id
      WHERE p.user_id = ?
      ORDER BY p.fecha_entrega DESC, p.id DESC
      `,
      [session.uid]
    )
    return NextResponse.json(rows as Pedido[])
  } catch (e) {
    console.error("GET /pedidos:", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  } finally {
    conn.release()
  }
}

export async function POST(req: Request) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const body = await req.json()
    const clienteId  = Number(body.clienteId)
    const productoId = Number(body.productoId)
    const cantidad   = Number(body.cantidad)
    const fecha      = String(body.fechaEntrega ?? "").trim()

    if (!Number.isFinite(clienteId) || !Number.isFinite(productoId) || !Number.isFinite(cantidad) || cantidad <= 0) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return NextResponse.json({ error: "Fecha inválida (YYYY-MM-DD)" }, { status: 400 })
    }
    // no permitir fechas pasadas
    const hoy = new Date(); hoy.setHours(0,0,0,0)
    const f   = new Date(fecha); f.setHours(0,0,0,0)
    if (f < hoy) {
      return NextResponse.json({ error: "La fecha de entrega no puede ser pasada" }, { status: 400 })
    }

    const conn = await mysqlPool.getConnection()
    try {
      await conn.beginTransaction()

      // validar que cliente y producto son del usuario
      const [[c]]: any = await conn.query(
        "SELECT id FROM clientes WHERE id = ? AND user_id = ? LIMIT 1",
        [clienteId, session.uid]
      )
      if (!c) {
        await conn.rollback()
        return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
      }

      const [[p]]: any = await conn.query(
        "SELECT id, cantidad FROM productos WHERE id = ? AND user_id = ? LIMIT 1",
        [productoId, session.uid]
      )
      if (!p) {
        await conn.rollback()
        return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
      }
      if (p.cantidad < cantidad) {
        await conn.rollback()
        return NextResponse.json({ error: "Stock insuficiente" }, { status: 400 })
      }

      // crear pedido
      const [result]: any = await conn.query(
        `
        INSERT INTO pedidos (user_id, cliente_id, producto_id, cantidad, fecha_entrega, estado)
        VALUES (?, ?, ?, ?, ?, 'Pendiente')
        `,
        [session.uid, clienteId, productoId, cantidad, fecha]
      )

      // descontar stock
      await conn.query(
        "UPDATE productos SET cantidad = cantidad - ? WHERE id = ? AND user_id = ?",
        [cantidad, productoId, session.uid]
      )

      await conn.commit()
      return NextResponse.json({ id: result.insertId, message: "Pedido creado" }, { status: 201 })
    } catch (e) {
      await conn.rollback()
      console.error("POST /pedidos:", e)
      return NextResponse.json({ error: "Error al crear pedido" }, { status: 500 })
    } finally {
      conn.release()
    }
  } catch (e) {
    console.error("POST /pedidos JSON:", e)
    return NextResponse.json({ error: "Error de entrada" }, { status: 400 })
  }
}
