import { NextResponse } from "next/server"
import { backendFetch, BackendError } from "@/lib/backend"

export async function GET() {
  try {
    const data = await backendFetch("/api/profile", { method: "GET" })
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.body ?? { error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Failed to load session" }, { status: 502 })
  }
}
