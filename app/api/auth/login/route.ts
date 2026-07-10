import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { backendFetch, BackendError, ROLE_COOKIE, SESSION_COOKIE } from "@/lib/backend"

const SEVEN_DAYS = 60 * 60 * 24 * 7

export async function POST(req: Request) {
  const body = await req.json()

  try {
    const data = await backendFetch("/api/login", { method: "POST", body: JSON.stringify(body) }, { auth: false })

    const cookieStore = await cookies()
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: SEVEN_DAYS,
    }
    cookieStore.set(SESSION_COOKIE, data.token, cookieOptions)
    cookieStore.set(ROLE_COOKIE, data.user.role, cookieOptions)

    return NextResponse.json({ user: data.user })
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.body ?? { error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Login failed" }, { status: 502 })
  }
}
