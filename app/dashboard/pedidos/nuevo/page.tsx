// app/dashboard/pedidos/nuevo/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Cliente  = { id: number; nombre: string; telefono?: string | null }
type Producto = { id: number; nombre: string; cantidad: number }

export default function NuevoPedidoPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    clienteId: "",
    productoId: "",
    cantidad: "",
    fechaEntrega: "",
  })

  const load = async () => {
    try {
      setLoading(true)
      const [rc, rp] = await Promise.all([
        fetch("/api/clientes"),
        fetch("/api/productos"),
      ])
      if (rc.status === 401 || rp.status === 401) return router.replace("/")
      if (!rc.ok || !rp.ok) throw new Error("Error al cargar datos")

      setClientes(await rc.json())
      setProductos(await rp.json())
      setFormData(prev => prev.fechaEntrega ? prev : {
        ...prev,
        fechaEntrega: new Date().toISOString().split("T")[0],
      })
    } catch (e) {
      console.error(e)
      alert("No se pudieron cargar clientes/productos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const clienteSel  = clientes.find(c => String(c.id) === formData.clienteId)
  const productoSel = productos.find(p => String(p.id) === formData.productoId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones básicas en UI
    if (!clienteSel || !productoSel) {
      alert("Debes seleccionar cliente y producto")
      return
    }
    const cant = Number(formData.cantidad)
    if (!Number.isFinite(cant) || cant <= 0) {
      alert("Cantidad inválida")
      return
    }
    if (productoSel.cantidad < cant) {
      alert("Stock insuficiente")
      return
    }
    const fecha = formData.fechaEntrega
    const hoy = new Date(); hoy.setHours(0,0,0,0)
    const f = new Date(fecha); f.setHours(0,0,0,0)
    if (f < hoy) {
      alert("La fecha de entrega no puede ser en el pasado")
      return
    }

    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: Number(clienteSel.id),
          productoId: Number(productoSel.id),
          cantidad: cant,
          fechaEntrega: fecha,
        }),
      })
      if (res.status === 401) return router.replace("/")
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "No se pudo crear el pedido")
      }
      router.push("/dashboard/pedidos")
    } catch (e: any) {
      console.error(e)
      alert(e.message || "Error al crear pedido")
    }
  }

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

      {/* Volver */}
      <Button asChild variant="outline" className="w-full h-12 rounded-xl border-2 border-gray-300 bg-transparent">
        <Link href="/dashboard/pedidos" className="flex items-center gap-2">
          <span>←</span>
          Volver a Pedidos
        </Link>
      </Button>

      {/* Mensajes/Faltantes */}
      {loading ? (
        <Card className="text-center py-12 bg-gray-50">
          <CardContent>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-3" />
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto" />
            </div>
          </CardContent>
        </Card>
      ) : (clientes.length === 0 || productos.length === 0) ? (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="text-center py-6">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-yellow-800 font-medium mb-2">¡Faltan datos!</p>
            <p className="text-yellow-700 text-sm mb-4">
              {clientes.length === 0 && "Necesitas agregar al menos un cliente. "}
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
      ) : (
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
                      <SelectItem key={cliente.id} value={String(cliente.id)} className="text-lg py-3">
                        <div>
                          <div className="font-medium">{cliente.nombre}</div>
                          {cliente.telefono && <div className="text-sm text-gray-500">{cliente.telefono}</div>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      <SelectItem key={producto.id} value={String(producto.id)} className="text-lg py-3">
                        <div>
                          <div className="font-medium">{producto.nombre}</div>
                          <div className="text-sm text-gray-500">Stock: {producto.cantidad} unidades</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cantidad" className="text-base font-medium">
                  3. ¿Cuántas unidades? *
                </Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  max={productoSel?.cantidad || 999}
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
                <Button type="submit" className="w-full h-14 bg-green-500 hover:bg-green-600 rounded-xl text-lg font-semibold">
                  💾 Guardar Pedido
                </Button>
                <Button type="button" variant="outline" asChild className="w-full h-12 rounded-xl border-2 border-gray-300 bg-transparent">
                  <Link href="/dashboard/pedidos">Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-green-50 border-green-200">
        <CardContent className="text-center py-4">
          <div className="text-2xl mb-2">💡</div>
          <p className="text-green-700 text-sm">
            Sigue los 4 pasos en orden.
            <br />¡Es súper fácil!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
