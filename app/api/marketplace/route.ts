import { NextResponse } from "next/server"
import { backendFetch, BackendError } from "@/lib/backend"

// Public: the landing page renders real marketplace numbers rather than
// invented ones, so this proxies without attaching a session.
export async function GET() {
  try {
    const data = await backendFetch("/api/public/summary", { method: "GET" }, { auth: false })
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.body ?? { error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Failed to load marketplace summary" }, { status: 502 })
  }
}
