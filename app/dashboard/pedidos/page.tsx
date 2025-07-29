"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Pedido {
  id: string
  clienteId: string
  clienteNombre: string
  productoId: string
  productoNombre: string
  cantidad: number
  fechaEntrega: string
  estado: "Pendiente" | "Entregado" | "Cancelado"
}

const formatearFecha = (fecha: string) => {
  const [year, month, day] = fecha.split("-")
  return `${day}-${month}-${year}`
}


export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])

  useEffect(() => {
    const pedidosGuardados = localStorage.getItem("pedidos")
    if (pedidosGuardados) {
      setPedidos(JSON.parse(pedidosGuardados))
    }
  }, [])

  const guardarPedidos = (nuevosPedidos: Pedido[]) => {
    localStorage.setItem("pedidos", JSON.stringify(nuevosPedidos))
    setPedidos(nuevosPedidos)
  }

  const cambiarEstado = (id: string, nuevoEstado: "Pendiente" | "Entregado" | "Cancelado") => {
    const pedidosActualizados = pedidos.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p))
    guardarPedidos(pedidosActualizados)
  }

  const eliminarPedido = (id: string) => {
    const pedidosActualizados = pedidos.filter((p) => p.id !== id)
    guardarPedidos(pedidosActualizados)
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

  const pedidosPendientes = pedidos.filter((p) => p.estado === "Pendiente")
  const pedidosEntregados = pedidos.filter((p) => p.estado === "Entregado")

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
              <span>⏳</span>
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{pedidosPendientes.length}</div>
            <p className="text-xs text-orange-600">Por entregar</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700 flex items-center gap-2">
              <span>✅</span>
              Entregados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{pedidosEntregados.length}</div>
            <p className="text-xs text-green-600">Completados</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de pedidos */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 px-2">
          {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""} total{pedidos.length !== 1 ? "es" : ""}
        </h2>

        {pedidos.length === 0 ? (
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
              .sort((a, b) => new Date(b.fechaEntrega).getTime() - new Date(a.fechaEntrega).getTime())
              .map((pedido) => (
                <Card key={pedido.id} className="shadow-md border-l-4 border-l-green-400">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-gray-800 flex items-center justify-between">
                      <span>{pedido.clienteNombre}</span>
                      {getEstadoBadge(pedido.estado)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>📦</span>
                        <span>{pedido.productoNombre}</span>
                        <Badge variant="outline" className="ml-auto">
                          {pedido.cantidad} unidades
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>📅</span>
                        <span>Entrega: {formatearFecha(pedido.fechaEntrega)}</span>
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
