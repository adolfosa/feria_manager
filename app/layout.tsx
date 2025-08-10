// app/layout.tsx
import type { Metadata } from "next"
import { GoogleOAuthProvider } from "@react-oauth/google"
import "./globals.css"

export const metadata: Metadata = {
  title: "Feria Manager",
  description: "Configura y gestiona tu negocio de forma sencilla",
}

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID! // <- usa la env

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <GoogleOAuthProvider clientId={clientId}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
