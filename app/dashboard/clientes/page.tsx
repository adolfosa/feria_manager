"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MobileClientDialog } from "@/components/mobile-client-dialog"
import type { Cliente } from "@/types/cliente"// arriba de tu archivo
import { toast } from "sonner"


export default function ClientesPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filtro, setFiltro] = useState("")
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)

  const loadClientes = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/clientes")
      if (res.status === 401) return router.replace("/")
      if (!res.ok) throw new Error("Error al obtener clientes")
      const data = (await res.json()) as Cliente[]
      setClientes(data)
    } catch (e) {
      console.error(e)
      alert("No se pudieron cargar los clientes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClientes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      (c.telefono ?? "").includes(filtro)
  )

  const contarPedidosCliente = (clienteId: number) => {
    // aún cuentas desde localStorage hasta migrar 'pedidos' a la API
    const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]")
    return pedidos.filter((p: any) => String(p.clienteId) === String(clienteId)).length
  }

  const eliminarCliente = async (id: number) => {
    const cliente = clientes.find(c => c.id === id)
    const nombre = cliente?.nombre ?? "cliente"

    const ok = confirm(`¿Eliminar a ${nombre}?`)
    if (!ok) {
      toast.info("Eliminación cancelada")
      return
    }

    const t = toast.loading("Eliminando…")

    try {
      const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" })
      if (res.status === 401) {
        toast.error("Sesión expirada", { id: t })
        return router.replace("/")
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "No se pudo eliminar")
      }

      setClientes(prev => prev.filter(c => c.id !== id))
      toast.success(`Eliminado: ${nombre}`, { id: t })
    } catch (e: any) {
      toast.error(e?.message || "Error de red al eliminar", { id: t })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <span>👥</span>
          Mis Clientes
        </h1>
        <p className="text-gray-600">Gestiona tus clientes habituales</p>
      </div>

      {/* Botón agregar */}
      <Button asChild className="w-full h-14 bg-blue-500 hover:bg-blue-600 rounded-xl shadow-lg text-lg">
        <Link href="/dashboard/clientes/nuevo" className="flex items-center gap-3">
          <span className="text-2xl">➕</span>
          Agregar Nuevo Cliente
        </Link>
      </Button>

      {/* Buscador */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Buscar cliente:</label>
        <Input
          placeholder="Escribe el nombre o teléfono..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="h-12 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-400"
        />
      </div>

      {/* Lista de clientes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-semibold text-gray-700">
            {loading ? "Cargando..." : `${clientesFiltrados.length} cliente${clientesFiltrados.length !== 1 ? "s" : ""}`}
          </h2>
        </div>

        {loading ? (
          <Card className="text-center py-12 bg-gray-50">
            <CardContent>
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-3" />
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto" />
              </div>
            </CardContent>
          </Card>
        ) : clientesFiltrados.length === 0 ? (
          <Card className="text-center py-12 bg-gray-50">
            <CardContent>
              <div className="text-6xl mb-4">🤷‍♀️</div>
              <p className="text-gray-600 text-lg">{filtro ? "No encontré ese cliente" : "Aún no tienes clientes"}</p>
              <p className="text-gray-500 text-sm mt-2">
                {filtro ? "Intenta con otro nombre" : "¡Agrega tu primer cliente!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {clientesFiltrados.map((cliente) => (
              <Card key={cliente.id} className="shadow-md border-l-4 border-l-blue-400">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-800 flex items-center justify-between">
                    <span>{cliente.nombre}</span>
                    <Badge variant="secondary" className="text-xs">
                      {contarPedidosCliente(cliente.id)} pedidos
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cliente.telefono && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>📞</span>
                      <span>{cliente.telefono}</span>
                    </div>
                  )}
                  {cliente.direccion && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>📍</span>
                      <span className="text-sm">{cliente.direccion}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCliente(cliente)}
                      className="flex-1 h-10 border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      ✏️ Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => eliminarCliente(cliente.id)}
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

      {/* Dialog para editar */}
      {selectedCliente && (
      <MobileClientDialog
        cliente={selectedCliente}
        onClose={() => setSelectedCliente(null)}
        onSave={async (cActualizado) => {
          try {
            const res = await fetch(`/api/clientes/${selectedCliente.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nombre: cActualizado.nombre?.trim() ?? "",
                telefono: cActualizado.telefono ?? null,
                direccion: cActualizado.direccion ?? null,
              }),
            })
            if (res.status === 401) return router.replace("/")
            if (!res.ok) {
              const err = await res.json().catch(() => ({}))
              alert(err.error ?? "No se pudo actualizar")
              return
            }
            // ✅ cActualizado no trae id → no rompe el tipo
            setClientes(prev =>
              prev.map(c => (c.id === selectedCliente.id ? { ...c, ...cActualizado } : c))
            )
            setSelectedCliente(null)
          } catch (e) {
            console.error(e)
            alert("Error de red al actualizar")
          }
        }}
      />
    )}
    </div>
  )
}
