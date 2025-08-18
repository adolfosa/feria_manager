// app/dashboard/historial/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Pedido } from "@/types/pedido"

type Cliente = { id: number; nombre: string }

const formatearFecha = (fecha: string) => {
  const [y, m, d] = fecha.split("-")
  return `${d}-${m}-${y}`
}

export default function HistorialPage() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros (usar "all" como valor para "todos")
  const [filtroCliente, setFiltroCliente] = useState<string>("all")
  const [filtroEstado, setFiltroEstado] = useState<string>("all")

  const load = async () => {
    try {
      setLoading(true)
      const [rp, rc] = await Promise.all([
        fetch("/api/pedidos", { cache: "no-store" }),
        fetch("/api/clientes", { cache: "no-store" }),
      ])
      if (rp.status === 401 || rc.status === 401) return router.replace("/")

      if (!rp.ok) throw new Error("No se pudieron cargar los pedidos")
      if (!rc.ok) throw new Error("No se pudieron cargar los clientes")

      const pedidosData = (await rp.json()) as Pedido[]
      const clientesData = (await rc.json()) as Cliente[]

      setPedidos(pedidosData)
      setClientes(clientesData)
    } catch (e) {
      console.error(e)
      alert("Error al cargar historial")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pedidosFiltrados = pedidos.filter((p) => {
    const clienteOk = filtroCliente === "all" || String(p.cliente_id) === filtroCliente
    const estadoOk = filtroEstado === "all" || p.estado === filtroEstado
    return clienteOk && estadoOk
  })

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

  const limpiarFiltros = () => {
    setFiltroCliente("all")
    setFiltroEstado("all")
  }

  const totalPedidos = pedidos.length
  const pedidosEntregados = pedidos.filter((p) => p.estado === "Entregado").length
  const pedidosPendientes = pedidos.filter((p) => p.estado === "Pendiente").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <span>📚</span>
          Historial
        </h1>
        <p className="text-gray-600">Revisa todos tus pedidos</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-blue-700 text-center">Total</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-xl font-bold text-blue-800">{totalPedidos}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-green-700 text-center">Entregados</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-xl font-bold text-green-800">{pedidosEntregados}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-orange-700 text-center">Pendientes</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-xl font-bold text-orange-800">{pedidosPendientes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span>🔍</span>
            Filtrar pedidos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Por cliente:</label>
            <Select value={filtroCliente} onValueChange={setFiltroCliente}>
              <SelectTrigger className="h-12 text-lg rounded-xl">
                <SelectValue placeholder="Todos los clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={String(cliente.id)}>
                    {cliente.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Por estado:</label>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="h-12 text-lg rounded-xl">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Entregado">Entregado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={limpiarFiltros}
            variant="outline"
            className="w-full h-12 rounded-xl border-2 border-gray-300 bg-transparent"
          >
            🧹 Limpiar filtros
          </Button>
        </CardContent>
      </Card>

      {/* Lista de pedidos */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 px-2">
          {loading
            ? "Cargando..."
            : `${pedidosFiltrados.length} pedido${pedidosFiltrados.length !== 1 ? "s" : ""} encontrado${
                pedidosFiltrados.length !== 1 ? "s" : ""
              }`}
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
        ) : pedidosFiltrados.length === 0 ? (
          <Card className="text-center py-12 bg-gray-50">
            <CardContent>
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-600 text-lg">
                {pedidos.length === 0 ? "Aún no tienes pedidos" : "No encontré pedidos con esos filtros"}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {pedidos.length === 0 ? "¡Registra tu primera venta!" : "Intenta cambiar los filtros"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pedidosFiltrados
              .sort((a, b) => new Date(b.fecha_entrega).getTime() - new Date(a.fecha_entrega).getTime())
              .map((pedido) => (
                <Card key={pedido.id} className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-gray-800 flex items-center justify-between">
                      <span>{pedido.cliente_nombre}</span>
                      {getEstadoBadge(pedido.estado)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
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
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
