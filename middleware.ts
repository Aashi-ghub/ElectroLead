import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ROLE_HOME: Record<string, string> = {
  buyer: "/dashboard/buyer",
  seller: "/dashboard/seller",
  admin: "/admin",
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = req.cookies.get("el_session")?.value
  const role = req.cookies.get("el_role")?.value

  const isAdminRoute = pathname.startsWith("/admin")
  const isDashboardRoute = pathname.startsWith("/dashboard")

  if ((isAdminRoute || isDashboardRoute) && !session) {
    const loginUrl = new URL("/auth/login", req.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL(ROLE_HOME[role ?? ""] ?? "/auth/login", req.url))
  }

  if (pathname.startsWith("/dashboard/buyer") && role !== "buyer") {
    return NextResponse.redirect(new URL(ROLE_HOME[role ?? ""] ?? "/auth/login", req.url))
  }

  if (pathname.startsWith("/dashboard/seller") && role !== "seller") {
    return NextResponse.redirect(new URL(ROLE_HOME[role ?? ""] ?? "/auth/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
