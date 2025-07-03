"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    clientes: 0,
    productos: 0,
    pedidosPendientes: 0,
    pedidosEntregados: 0,
  })

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Cargar estadísticas
    const clientes = JSON.parse(localStorage.getItem("clientes") || "[]")
    const productos = JSON.parse(localStorage.getItem("productos") || "[]")
    const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]")

    const pedidosPendientes = pedidos.filter((p) => p.estado === "Pendiente").length
    const pedidosEntregados = pedidos.filter((p) => p.estado === "Entregado").length

    setStats({
      clientes: clientes.length,
      productos: productos.length,
      pedidosPendientes,
      pedidosEntregados,
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* Saludo personalizado */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">¡Hola, {user?.nombre?.split(" ")[0] || "Usuario"}! 👋</h1>
        <p className="text-gray-600">¿Qué quieres hacer hoy?</p>
      </div>

      {/* Acciones principales */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 px-2">Acciones Rápidas</h2>
        <div className="grid gap-4">
          <Button asChild className="h-16 bg-green-500 hover:bg-green-600 rounded-xl shadow-lg">
            <Link href="/dashboard/pedidos/nuevo" className="flex items-center gap-4 text-lg">
              <span className="text-2xl">📝</span>
              <div className="text-left">
                <div className="font-semibold">Nuevo Pedido</div>
                <div className="text-sm opacity-90">Registrar una venta</div>
              </div>
            </Link>
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <Button
              asChild
              variant="outline"
              className="h-16 border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl"
            >
              <Link href="/dashboard/clientes/nuevo" className="flex flex-col items-center gap-1">
                <span className="text-2xl">👥</span>
                <span className="text-sm font-medium">Nuevo Cliente</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-16 border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 rounded-xl"
            >
              <Link href="/dashboard/productos/nuevo" className="flex flex-col items-center gap-1">
                <span className="text-2xl">📦</span>
                <span className="text-sm font-medium">Nuevo Producto</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Resumen del negocio */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 px-2">Tu Negocio Hoy</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-700 flex items-center gap-2">
                <span>👥</span>
                Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{stats.clientes}</div>
              <p className="text-xs text-blue-600">Total registrados</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-700 flex items-center gap-2">
                <span>📦</span>
                Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">{stats.productos}</div>
              <p className="text-xs text-purple-600">En inventario</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-700 flex items-center gap-2">
                <span>⏳</span>
                Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">{stats.pedidosPendientes}</div>
              <p className="text-xs text-orange-600">Por entregar</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-700 flex items-center gap-2">
                <span>✅</span>
                Entregados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{stats.pedidosEntregados}</div>
              <p className="text-xs text-green-600">Completados</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mensaje motivacional */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="text-center py-6">
          <div className="text-3xl mb-2">🌟</div>
          <p className="text-gray-700 font-medium">¡Tu negocio está creciendo!</p>
          <p className="text-sm text-gray-600 mt-1">Sigue así, cada pedido cuenta</p>
        </CardContent>
      </Card>
    </div>
  )
}
