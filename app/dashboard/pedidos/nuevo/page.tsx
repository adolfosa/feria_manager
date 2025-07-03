"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function NuevoPedidoPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [formData, setFormData] = useState({
    clienteId: "",
    productoId: "",
    cantidad: "",
    fechaEntrega: "",
  })

  useEffect(() => {
    const clientesGuardados = localStorage.getItem("clientes")
    const productosGuardados = localStorage.getItem("productos")

    if (clientesGuardados) setClientes(JSON.parse(clientesGuardados))
    if (productosGuardados) setProductos(JSON.parse(productosGuardados))

    // Establecer fecha por defecto (mañana)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setFormData((prev) => ({
      ...prev,
      fechaEntrega: tomorrow.toISOString().split("T")[0],
    }))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const cliente = clientes.find((c) => c.id === formData.clienteId)
    const producto = productos.find((p) => p.id === formData.productoId)

    const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]")
    const nuevoPedido = {
      id: Date.now().toString(),
      clienteId: formData.clienteId,
      clienteNombre: cliente?.nombre || "",
      productoId: formData.productoId,
      productoNombre: producto?.nombre || "",
      cantidad: Number.parseInt(formData.cantidad),
      fechaEntrega: formData.fechaEntrega,
      estado: "Pendiente",
    }

    localStorage.setItem("pedidos", JSON.stringify([...pedidos, nuevoPedido]))
    router.push("/dashboard/pedidos")
  }

  const clienteSeleccionado = clientes.find((c) => c.id === formData.clienteId)
  const productoSeleccionado = productos.find((p) => p.id === formData.productoId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <span>📝</span>
          Nuevo Pedido
        </h1>
        <p className="text-gray-600">Registra una nueva venta</p>
      </div>

      {/* Botón volver */}
      <Button asChild variant="outline" className="w-full h-12 rounded-xl border-2 border-gray-300 bg-transparent">
        <Link href="/dashboard/pedidos" className="flex items-center gap-2">
          <span>←</span>
          Volver a Pedidos
        </Link>
      </Button>

      {/* Verificar si hay clientes y productos */}
      {(clientes.length === 0 || productos.length === 0) && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="text-center py-6">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-yellow-800 font-medium mb-2">¡Faltan datos!</p>
            <p className="text-yellow-700 text-sm mb-4">
              {clientes.length === 0 && "Necesitas agregar al menos un cliente."}
              {productos.length === 0 && "Necesitas agregar al menos un producto."}
            </p>
            <div className="space-y-2">
              {clientes.length === 0 && (
                <Button asChild className="w-full bg-blue-500 hover:bg-blue-600">
                  <Link href="/dashboard/clientes/nuevo">👥 Agregar Cliente</Link>
                </Button>
              )}
              {productos.length === 0 && (
                <Button asChild className="w-full bg-purple-500 hover:bg-purple-600">
                  <Link href="/dashboard/productos/nuevo">📦 Agregar Producto</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulario */}
      {clientes.length > 0 && productos.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>📝</span>
              Información del Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base font-medium">1. Selecciona el cliente *</Label>
                <Select
                  value={formData.clienteId}
                  onValueChange={(value) => setFormData({ ...formData, clienteId: value })}
                >
                  <SelectTrigger className="h-12 text-lg rounded-xl border-2 border-gray-200">
                    <SelectValue placeholder="Toca para elegir cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id} className="text-lg py-3">
                        <div>
                          <div className="font-medium">{cliente.nombre}</div>
                          {cliente.telefono && <div className="text-sm text-gray-500">{cliente.telefono}</div>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {clienteSeleccionado && (
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <p className="text-blue-800 font-medium">✅ Cliente: {clienteSeleccionado.nombre}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">2. Selecciona el producto *</Label>
                <Select
                  value={formData.productoId}
                  onValueChange={(value) => setFormData({ ...formData, productoId: value })}
                >
                  <SelectTrigger className="h-12 text-lg rounded-xl border-2 border-gray-200">
                    <SelectValue placeholder="Toca para elegir producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productos.map((producto) => (
                      <SelectItem key={producto.id} value={producto.id} className="text-lg py-3">
                        <div>
                          <div className="font-medium">{producto.nombre}</div>
                          <div className="text-sm text-gray-500">Stock: {producto.cantidad} unidades</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {productoSeleccionado && (
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <p className="text-purple-800 font-medium">✅ Producto: {productoSeleccionado.nombre}</p>
                    <p className="text-purple-600 text-sm">Stock disponible: {productoSeleccionado.cantidad}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cantidad" className="text-base font-medium">
                  3. ¿Cuántas unidades? *
                </Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  max={productoSeleccionado?.cantidad || 999}
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                  placeholder="Ej: 5"
                  className="h-12 text-lg rounded-xl border-2 border-gray-200 focus:border-green-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaEntrega" className="text-base font-medium">
                  4. ¿Cuándo entregar? *
                </Label>
                <Input
                  id="fechaEntrega"
                  type="date"
                  value={formData.fechaEntrega}
                  onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                  className="h-12 text-lg rounded-xl border-2 border-gray-200 focus:border-green-400"
                  required
                />
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  type="submit"
                  className="w-full h-14 bg-green-500 hover:bg-green-600 rounded-xl text-lg font-semibold"
                >
                  💾 Guardar Pedido
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="w-full h-12 rounded-xl border-2 border-gray-300 bg-transparent"
                >
                  <Link href="/dashboard/pedidos">Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Mensaje de ayuda */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="text-center py-4">
          <div className="text-2xl mb-2">💡</div>
          <p className="text-green-700 text-sm">
            Sigue los 4 pasos en orden.
            <br />
            ¡Es súper fácil!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
