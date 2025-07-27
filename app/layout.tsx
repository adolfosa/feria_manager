import type { Metadata } from 'next'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './globals.css'

export const metadata: Metadata = {
  title: 'Feria Manager',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head />
      <body>
        <GoogleOAuthProvider clientId="657866848379-tpnj8ch0s8qpoeg288nble6uja7bhh3c.apps.googleusercontent.com">
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
