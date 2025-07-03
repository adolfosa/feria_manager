"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MobileClientDialog } from "@/components/mobile-client-dialog"

interface Cliente {
  id: string
  nombre: string
  telefono: string
  direccion: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filtro, setFiltro] = useState("")
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)

  useEffect(() => {
    const clientesGuardados = localStorage.getItem("clientes")
    if (clientesGuardados) {
      setClientes(JSON.parse(clientesGuardados))
    }
  }, [])

  const clientesFiltrados = clientes.filter(
    (cliente) => cliente.nombre.toLowerCase().includes(filtro.toLowerCase()) || cliente.telefono.includes(filtro),
  )

  const contarPedidosCliente = (clienteId: string) => {
    const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]")
    return pedidos.filter((p: any) => p.clienteId === clienteId).length
  }

  const eliminarCliente = (id: string) => {
    const clientesActualizados = clientes.filter((c) => c.id !== id)
    localStorage.setItem("clientes", JSON.stringify(clientesActualizados))
    setClientes(clientesActualizados)
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
            {clientesFiltrados.length} cliente{clientesFiltrados.length !== 1 ? "s" : ""}
          </h2>
        </div>

        {clientesFiltrados.length === 0 ? (
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
                      onClick={() => {
                        if (confirm(`¿Eliminar a ${cliente.nombre}?`)) {
                          eliminarCliente(cliente.id)
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

      {/* Dialog para editar */}
      {selectedCliente && (
        <MobileClientDialog
          cliente={selectedCliente}
          onClose={() => setSelectedCliente(null)}
          onSave={(clienteActualizado) => {
            const clientesActualizados = clientes.map((c) => (c.id === selectedCliente.id ? clienteActualizado : c))
            localStorage.setItem("clientes", JSON.stringify(clientesActualizados))
            setClientes(clientesActualizados)
            setSelectedCliente(null)
          }}
        />
      )}
    </div>
  )
}
