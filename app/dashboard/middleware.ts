// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rutas que queremos proteger con cookie "session"
  const protectedPaths = ["/dashboard"]

  const isProtected = protectedPaths.some((p) =>
    pathname === p || pathname.startsWith(`${p}/`)
  )

  if (isProtected) {
    const token = req.cookies.get("session")?.value
    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = "/"
      // opcional: recordar a dónde quería ir
      url.searchParams.set("from", pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// protege todas las subrutas de /dashboard
export const config = {
  matcher: ["/dashboard/:path*"],
}
