// app/dashboard/pedidos/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Pedido } from "@/types/pedido"

const formatearFecha = (fecha: string) => {
  const [y, m, d] = fecha.split("-")
  return `${d}-${m}-${y}`
}

export default function PedidosPage() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/pedidos", { cache: "no-store" })
      if (res.status === 401) return router.replace("/")
      if (!res.ok) throw new Error("No se pudieron cargar los pedidos")
      const data = (await res.json()) as Pedido[]
      setPedidos(data)
    } catch (e) {
      console.error(e)
      alert("Error al cargar pedidos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const cambiarEstado = async (id: number, estado: "Pendiente" | "Entregado" | "Cancelado") => {
    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      })
      if (res.status === 401) return router.replace("/")
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "No se pudo actualizar")
      }
      setPedidos(prev => prev.map(p => (p.id === id ? { ...p, estado } : p)))
    } catch (e: any) {
      console.error(e)
      alert(e.message || "Error al cambiar estado")
    }
  }

  const eliminarPedido = async (id: number) => {
    if (!confirm("¿Eliminar este pedido?")) return
    try {
      const res = await fetch(`/api/pedidos/${id}`, { method: "DELETE" })
      if (res.status === 401) return router.replace("/")
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "No se pudo eliminar")
      }
      setPedidos(prev => prev.filter(p => p.id !== id))
    } catch (e: any) {
      console.error(e)
      alert(e.message || "Error al eliminar")
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return <Badge className="bg-orange-500">⏳ Pendiente</Badge>
      case "Entregado":
        return <Badge className="bg-green-500">✅ Entregado</Badge>
      case "Cancelado":
        return <Badge variant="destructive">❌ Cancelado</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const pendientes = pedidos.filter(p => p.estado === "Pendiente")
  const entregados = pedidos.filter(p => p.estado === "Entregado")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <span>📝</span>
          Mis Pedidos
        </h1>
        <p className="text-gray-600">Gestiona tus ventas</p>
      </div>

      {/* Botón agregar */}
      <Button asChild className="w-full h-14 bg-green-500 hover:bg-green-600 rounded-xl shadow-lg text-lg">
        <Link href="/dashboard/pedidos/nuevo" className="flex items-center gap-3">
          <span className="text-2xl">➕</span>
          Registrar Nuevo Pedido
        </Link>
      </Button>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-700 flex items-center gap-2">
              <span>⏳</span> Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{pendientes.length}</div>
            <p className="text-xs text-orange-600">Por entregar</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700 flex items-center gap-2">
              <span>✅</span> Entregados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{entregados.length}</div>
            <p className="text-xs text-green-600">Completados</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 px-2">
          {loading ? "Cargando..." : `${pedidos.length} pedido${pedidos.length !== 1 ? "s" : ""} total${pedidos.length !== 1 ? "es" : ""}`}
        </h2>

        {loading ? (
          <Card className="text-center py-12 bg-gray-50">
            <CardContent>
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-3" />
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto" />
              </div>
            </CardContent>
          </Card>
        ) : pedidos.length === 0 ? (
          <Card className="text-center py-12 bg-gray-50">
            <CardContent>
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-600 text-lg">Aún no tienes pedidos</p>
              <p className="text-gray-500 text-sm mt-2">¡Registra tu primera venta!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pedidos
              .sort((a, b) => new Date(b.fecha_entrega).getTime() - new Date(a.fecha_entrega).getTime())
              .map((pedido) => (
                <Card key={pedido.id} className="shadow-md border-l-4 border-l-green-400">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-gray-800 flex items-center justify-between">
                      <span>{pedido.cliente_nombre}</span>
                      {getEstadoBadge(pedido.estado)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>📦</span>
                        <span>{pedido.producto_nombre}</span>
                        <Badge variant="outline" className="ml-auto">
                          {pedido.cantidad} unidades
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>📅</span>
                        <span>Entrega: {formatearFecha(pedido.fecha_entrega)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {pedido.estado === "Pendiente" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            if (confirm("¿Marcar como entregado?")) {
                              cambiarEstado(pedido.id, "Entregado")
                            }
                          }}
                          className="flex-1 h-10 bg-green-500 hover:bg-green-600"
                        >
                          ✅ Marcar Entregado
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm("¿Eliminar este pedido?")) {
                            eliminarPedido(pedido.id)
                          }
                        }}
                        className="h-10 border-red-200 text-red-700 hover:bg-red-50"
                      >
                        🗑️
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
