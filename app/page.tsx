"use client"

import { GoogleLogin, CredentialResponse } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// Tipo para los datos decodificados del token
interface GoogleJwtPayload {
  sub: string
  name: string
  email: string
  picture: string
}

export default function LoginPage() {
  const router = useRouter()

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      alert("Token inválido")
      return
    }

    const decoded = jwtDecode<GoogleJwtPayload>(credentialResponse.credential)

    const userData = {
      uid: decoded.sub,
      nombre: decoded.name,
      email: decoded.email,
      foto_url: decoded.picture,
    }

    localStorage.setItem("user", JSON.stringify(userData))
    router.push("/dashboard")
  }

  const handleError = () => {
    alert("Error al iniciar sesión con Google")
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
            <div className="flex justify-center">
              <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
            </div>

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
