// app/dashboard/page.tsx  (SERVER COMPONENT)
import { cookies } from "next/headers"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Pedido = {
  id: number
  estado: "Pendiente" | "Entregado" | "Cancelado"
}

async function fetchJSON<T>(url: string): Promise<T> {
  // En server components, fetch incluye cookies automáticamente
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    // si 401, se puede lanzar para que el middleware vuelva a actuar
    throw new Error(`Error ${res.status} en ${url}`)
  }
  return res.json()
}

export default async function DashboardPage() {
  // opcional: si guardaste user básico en la cookie/session, puedes leerlo de /api/session
  let user: { name?: string; picture?: string } | null = null
  try {
    const sessionRes = await fetchJSON<{ ok: boolean; user?: any }>("/api/session")
    if (sessionRes.ok) {
      user = sessionRes.user ?? null
    }
  } catch {
    // si falla, user queda null (no es crítico para mostrar el saludo)
  }

  // lee estadísticas desde tus endpoints (DB)
  // asumiendo que ya tienes /api/clientes y /api/productos adaptados a user_id
  const [clientes, productos] = await Promise.all([
    fetchJSON<any[]>("/api/clientes").catch(() => []),
    fetchJSON<any[]>("/api/productos").catch(() => []),
  ])

  // si ya tienes /api/pedidos, úsalo; si no, deja 0 y luego lo conectas
  const pedidos: Pedido[] = await fetchJSON<Pedido[]>("/api/pedidos").catch(() => [])

  const pedidosPendientes = pedidos.filter((p) => p.estado === "Pendiente").length
  const pedidosEntregados = pedidos.filter((p) => p.estado === "Entregado").length

  const saludo = user?.name ? user.name.split(" ")[0] : "Usuario"

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">¡Hola, {saludo}! 👋</h1>
        <Image
          src={user?.picture ?? "/avatar-placeholder.png"}
          alt={user?.name ?? "Usuario"}
          width={64}
          height={64}
          className="rounded-full mx-auto"
        />
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
              <div className="text-2xl font-bold text-blue-800">{clientes.length}</div>
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
              <div className="text-2xl font-bold text-purple-800">{productos.length}</div>
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
              <div className="text-2xl font-bold text-orange-800">{pedidosPendientes}</div>
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
              <div className="text-2xl font-bold text-green-800">{pedidosEntregados}</div>
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
