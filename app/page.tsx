"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setIsLoading(true)

    // Simular autenticación con Google
    setTimeout(() => {
      const userData = {
        uid: "user123",
        nombre: "Rosa García",
        email: "rosa.garcia@gmail.com",
        foto_url: "/placeholder.svg?height=60&width=60",
      }

      localStorage.setItem("user", JSON.stringify(userData))
      router.push("/dashboard")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo y título */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl">🏪</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mi Feria</h1>
            <p className="text-lg text-gray-600 mt-2">Gestiona tu negocio fácilmente</p>
          </div>
        </div>

        {/* Card de login */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <h2 className="text-xl font-semibold text-gray-700">¡Bienvenida!</h2>
            <p className="text-gray-500">Inicia sesión para comenzar</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <span>Entrar con Google</span>
                </div>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-500 leading-relaxed">
                Es rápido y seguro.
                <br />
                Solo un toque para empezar.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mensaje de ayuda */}
        <div className="text-center">
          <p className="text-sm text-gray-400">💡 Tip: Guarda esta página en tu inicio para acceso rápido</p>
        </div>
      </div>
    </div>
  )
}
