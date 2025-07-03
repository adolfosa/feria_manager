"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function PerfilPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    if (confirm("¿Estás segura de que quieres cerrar sesión?")) {
      localStorage.removeItem("user")
      localStorage.removeItem("clientes")
      localStorage.removeItem("productos")
      localStorage.removeItem("pedidos")
      router.push("/")
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <span>👤</span>
          Mi Perfil
        </h1>
        <p className="text-gray-600">Tu información personal</p>
      </div>

      {/* Información del usuario */}
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-4">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={user.foto_url || "/placeholder.svg"} alt={user.nombre} />
            <AvatarFallback className="text-2xl bg-blue-100 text-blue-700">{getInitials(user.nombre)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl text-gray-800">{user.nombre}</CardTitle>
          <p className="text-gray-600">{user.email}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">👤</span>
              <div>
                <p className="font-medium text-gray-800">Nombre completo</p>
                <p className="text-gray-600">{user.nombre}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">📧</span>
              <div>
                <p className="font-medium text-gray-800">Correo electrónico</p>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span>📊</span>
            Tu Negocio en Números
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {JSON.parse(localStorage.getItem("clientes") || "[]").length}
              </div>
              <p className="text-xs text-gray-600">Clientes</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {JSON.parse(localStorage.getItem("productos") || "[]").length}
              </div>
              <p className="text-xs text-gray-600">Productos</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {JSON.parse(localStorage.getItem("pedidos") || "[]").length}
              </div>
              <p className="text-xs text-gray-600">Pedidos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="space-y-4">
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-800 flex items-center gap-2">
              <span>🚪</span>
              Cerrar Sesión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">Cierra tu sesión de forma segura</p>
            <Button onClick={handleLogout} className="w-full h-12 bg-red-500 hover:bg-red-600 rounded-xl text-lg">
              🚪 Cerrar Sesión
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-lg text-yellow-800 flex items-center gap-2">
              <span>💡</span>
              Consejo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 text-sm">
              Recuerda hacer respaldo de tus datos importantes. Esta aplicación guarda todo en tu teléfono.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
