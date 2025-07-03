"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MobileProductDialog } from "@/components/mobile-product-dialog"

interface Producto {
  id: string
  nombre: string
  cantidad: number
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [filtro, setFiltro] = useState("")
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)

  useEffect(() => {
    const productosGuardados = localStorage.getItem("productos")
    if (productosGuardados) {
      setProductos(JSON.parse(productosGuardados))
    }
  }, [])

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(filtro.toLowerCase()),
  )

  const guardarProductos = (nuevosProductos: Producto[]) => {
    localStorage.setItem("productos", JSON.stringify(nuevosProductos))
    setProductos(nuevosProductos)
  }

  const ajustarStock = (id: string, cambio: number) => {
    const productosActualizados = productos.map((p) =>
      p.id === id ? { ...p, cantidad: Math.max(0, p.cantidad + cambio) } : p,
    )
    guardarProductos(productosActualizados)
  }

  const eliminarProducto = (id: string) => {
    const productosActualizados = productos.filter((p) => p.id !== id)
    guardarProductos(productosActualizados)
  }

  const getEstadoBadge = (cantidad: number) => {
    if (cantidad > 10) {
      return <Badge className="bg-green-500">✅ Disponible</Badge>
    } else if (cantidad > 0) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          ⚠️ Poco stock
        </Badge>
      )
    } else {
      return <Badge variant="destructive">❌ Agotado</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <span>📦</span>
          Mi Inventario
        </h1>
        <p className="text-gray-600">Controla tus productos</p>
      </div>

      {/* Botón agregar */}
      <Button asChild className="w-full h-14 bg-purple-500 hover:bg-purple-600 rounded-xl shadow-lg text-lg">
        <Link href="/dashboard/productos/nuevo" className="flex items-center gap-3">
          <span className="text-2xl">➕</span>
          Agregar Nuevo Producto
        </Link>
      </Button>

      {/* Buscador */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Buscar producto:</label>
        <Input
          placeholder="Escribe el nombre del producto..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="h-12 text-lg rounded-xl border-2 border-gray-200 focus:border-purple-400"
        />
      </div>

      {/* Lista de productos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-semibold text-gray-700">
            {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? "s" : ""}
          </h2>
        </div>

        {productosFiltrados.length === 0 ? (
          <Card className="text-center py-12 bg-gray-50">
            <CardContent>
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-600 text-lg">{filtro ? "No encontré ese producto" : "Aún no tienes productos"}</p>
              <p className="text-gray-500 text-sm mt-2">
                {filtro ? "Intenta con otro nombre" : "¡Agrega tu primer producto!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {productosFiltrados.map((producto) => (
              <Card key={producto.id} className="shadow-md border-l-4 border-l-purple-400">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-800 flex items-center justify-between">
                    <span>{producto.nombre}</span>
                    {getEstadoBadge(producto.cantidad)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800">{producto.cantidad}</div>
                    <p className="text-sm text-gray-600">unidades disponibles</p>
                  </div>

                  {/* Controles de stock */}
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => ajustarStock(producto.id, -1)}
                      disabled={producto.cantidad === 0}
                      className="w-12 h-12 rounded-full border-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <span className="text-xl">−</span>
                    </Button>

                    <div className="text-center min-w-[80px]">
                      <div className="text-2xl font-bold">{producto.cantidad}</div>
                    </div>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => ajustarStock(producto.id, 1)}
                      className="w-12 h-12 rounded-full border-2 border-green-200 text-green-600 hover:bg-green-50"
                    >
                      <span className="text-xl">+</span>
                    </Button>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProducto(producto)}
                      className="flex-1 h-10 border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      ✏️ Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`¿Eliminar ${producto.nombre}?`)) {
                          eliminarProducto(producto.id)
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
      {selectedProducto && (
        <MobileProductDialog
          producto={selectedProducto}
          onClose={() => setSelectedProducto(null)}
          onSave={(productoActualizado) => {
            const productosActualizados = productos.map((p) => (p.id === selectedProducto.id ? productoActualizado : p))
            guardarProductos(productosActualizados)
            setSelectedProducto(null)
          }}
        />
      )}
    </div>
  )
}
