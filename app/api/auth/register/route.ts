import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { backendFetch, BackendError, ROLE_COOKIE, SESSION_COOKIE } from "@/lib/backend"

const SEVEN_DAYS = 60 * 60 * 24 * 7

export async function POST(req: Request) {
  const body = await req.json()

  // Backend expects a bare 10-digit phone number; strip formatting like "+91 98765 43210".
  if (typeof body.phone === "string") {
    const digits = body.phone.replace(/\D/g, "")
    body.phone = digits.length >= 10 ? digits.slice(-10) : undefined
  }

  try {
    const registerData = await backendFetch(
      "/api/register",
      { method: "POST", body: JSON.stringify(body) },
      { auth: false },
    )

    // Backend has no login-gating on OTP verification today, so log the user
    // straight in for a smoother onboarding flow.
    const loginData = await backendFetch(
      "/api/login",
      { method: "POST", body: JSON.stringify({ email: body.email, password: body.password }) },
      { auth: false },
    )

    const cookieStore = await cookies()
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: SEVEN_DAYS,
    }
    cookieStore.set(SESSION_COOKIE, loginData.token, cookieOptions)
    cookieStore.set(ROLE_COOKIE, loginData.user.role, cookieOptions)

    return NextResponse.json({ user: loginData.user, message: registerData.message })
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.body ?? { error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 502 })
  }
}
