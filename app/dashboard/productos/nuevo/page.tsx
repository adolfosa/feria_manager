"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function NuevoProductoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    cantidad: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const nombre = formData.nombre.trim()
    const cantidad = Number(formData.cantidad)

    if (!nombre || !Number.isFinite(cantidad) || cantidad < 0) {
      alert("Completa nombre y cantidad válidos")
      return
    }

    try {
      const res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // el backend ya lo guarda en lowercase y valida duplicados
        body: JSON.stringify({ nombre, cantidad }),
      })

      if (res.status === 401) {
        // No hay sesión -> ir a login
        return router.replace("/")
      }
      if (res.status === 409) {
        const err = await res.json().catch(() => ({}))
        alert(err.error ?? "Ya existe un producto con ese nombre")
        return
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error ?? "No se pudo crear el producto")
        return
      }

      router.push("/dashboard/productos")
    } catch (e) {
      console.error(e)
      alert("Error de red al crear producto")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <span>📦</span>
          Nuevo Producto
        </h1>
        <p className="text-gray-600">Agrega un producto a tu inventario</p>
      </div>

      {/* Botón volver */}
      <Button asChild variant="outline" className="w-full h-12 rounded-xl border-2 border-gray-300 bg-transparent">
        <Link href="/dashboard/productos" className="flex items-center gap-2">
          <span>←</span>
          Volver a Productos
        </Link>
      </Button>

      {/* Formulario */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span>📝</span>
            Información del Producto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-base font-medium">
                Nombre del producto *
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Tomates rojos"
                className="h-12 text-lg rounded-xl border-2 border-gray-200 focus:border-purple-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad" className="text-base font-medium">
                Cantidad inicial *
              </Label>
              <Input
                id="cantidad"
                type="number"
                min="0"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                placeholder="Ej: 50"
                className="h-12 text-lg rounded-xl border-2 border-gray-200 focus:border-purple-400"
                required
              />
            </div>

            <div className="space-y-3 pt-4">
              <Button
                type="submit"
                className="w-full h-14 bg-purple-500 hover:bg-purple-600 rounded-xl text-lg font-semibold"
              >
                💾 Guardar Producto
              </Button>
              <Button
                type="button"
                variant="outline"
                asChild
                className="w-full h-12 rounded-xl border-2 border-gray-300 bg-transparent"
              >
                <Link href="/dashboard/productos">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Mensaje de ayuda */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="text-center py-4">
          <div className="text-2xl mb-2">💡</div>
          <p className="text-purple-700 text-sm">
            Puedes ajustar la cantidad después
            <br />
            usando los botones + y - en la lista.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
