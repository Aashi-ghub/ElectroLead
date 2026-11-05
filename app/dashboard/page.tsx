import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ROLE_COOKIE } from "@/lib/backend"

const ROLE_HOME: Record<string, string> = {
  buyer: "/dashboard/buyer",
  seller: "/dashboard/seller",
  admin: "/admin",
}

// /dashboard is only ever an entry point - each role has its own dashboard
// with its own data, so send people straight there rather than rendering a
// generic page that would have to invent numbers it cannot source.
export default async function DashboardIndex() {
  const role = (await cookies()).get(ROLE_COOKIE)?.value
  redirect(ROLE_HOME[role ?? ""] ?? "/auth/login")
}
