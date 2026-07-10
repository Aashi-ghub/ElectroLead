import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ROLE_COOKIE, SESSION_COOKIE } from "@/lib/backend"

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  cookieStore.delete(ROLE_COOKIE)
  return NextResponse.json({ message: "Logged out" })
}
