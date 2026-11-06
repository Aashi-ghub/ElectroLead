import { NextResponse } from "next/server"
import { backendFetch, BackendError } from "@/lib/backend"

export async function POST(req: Request) {
  const body = await req.text()
  try {
    const data = await backendFetch("/api/forgot-password", { method: "POST", body }, { auth: false })
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.body ?? { error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Could not start password reset" }, { status: 502 })
  }
}
