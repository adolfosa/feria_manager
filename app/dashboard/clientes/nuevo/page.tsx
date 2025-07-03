"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function NuevoClientePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const clientes = JSON.parse(localStorage.getItem("clientes") || "[]")
    const nuevoCliente = {
      id: Date.now().toString(),
      ...formData,
    }

    localStorage.setItem("clientes", JSON.stringify([...clientes, nuevoCliente]))
    router.push("/dashboard/clientes")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <span>👥</span>
          Nuevo Cliente
        </h1>
        <p className="text-gray-600">Agrega un cliente a tu lista</p>
      </div>

      {/* Botón volver */}
      <Button asChild variant="outline" className="w-full h-12 rounded-xl border-2 border-gray-300 bg-transparent">
        <Link href="/dashboard/clientes" className="flex items-center gap-2">
          <span>←</span>
          Volver a Clientes
        </Link>
      </Button>

      {/* Formulario */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span>📝</span>
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-base font-medium">
                Nombre completo *
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: María González"
                className="h-12 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-base font-medium">
                Teléfono (opcional)
              </Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Ej: 555-1234"
                className="h-12 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion" className="text-base font-medium">
                Dirección (opcional)
              </Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Ej: Calle Principal 123"
                className="h-12 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-400"
              />
            </div>

            <div className="space-y-3 pt-4">
              <Button
                type="submit"
                className="w-full h-14 bg-blue-500 hover:bg-blue-600 rounded-xl text-lg font-semibold"
              >
                💾 Guardar Cliente
              </Button>
              <Button
                type="button"
                variant="outline"
                asChild
                className="w-full h-12 rounded-xl border-2 border-gray-300 bg-transparent"
              >
                <Link href="/dashboard/clientes">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Mensaje de ayuda */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="text-center py-4">
          <div className="text-2xl mb-2">💡</div>
          <p className="text-blue-700 text-sm">
            Solo el nombre es obligatorio.
            <br />
            Puedes agregar teléfono y dirección después.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
