// app/dashboard/layout.tsx  (SERVER COMPONENT, sin "use client")
import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { MobileNavigation } from "@/components/mobile-navigation"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // cookies() es async en tu entorno → ¡await!
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value

  if (!session) {
    redirect("/") // vuelve al login si no hay cookie de sesión
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="p-4">{children}</main>
      <MobileNavigation />
    </div>
  )
}
