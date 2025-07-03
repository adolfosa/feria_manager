"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  {
    name: "Inicio",
    href: "/dashboard",
    icon: "🏠",
  },
  {
    name: "Clientes",
    href: "/dashboard/clientes",
    icon: "👥",
  },
  {
    name: "Productos",
    href: "/dashboard/productos",
    icon: "📦",
  },
  {
    name: "Pedidos",
    href: "/dashboard/pedidos",
    icon: "📝",
  },
  {
    name: "Historial",
    href: "/dashboard/historial",
    icon: "📚",
  },
]

export function MobileNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50",
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
