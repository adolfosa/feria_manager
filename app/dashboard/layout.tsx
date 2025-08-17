// app/dashboard/layout.tsx  (SERVER COMPONENT)
import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { MobileNavigation } from "@/components/mobile-navigation"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  if (!session) redirect("/")

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="p-4">{children}</main>
      <MobileNavigation />
    </div>
  )
}
