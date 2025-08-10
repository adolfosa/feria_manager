// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const hasSession = req.cookies.get("session")?.value
    if (!hasSession) {
      const url = req.nextUrl.clone()
      url.pathname = "/"
      url.searchParams.set("from", req.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

export const config = { matcher: ["/dashboard/:path*"] }
