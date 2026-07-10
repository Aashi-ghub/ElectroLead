import { NextResponse } from "next/server"
import { backendFetch, BackendError } from "@/lib/backend"

export async function POST(req: Request) {
  const body = await req.json()
  try {
    const data = await backendFetch("/api/subscriptions/activate-test", { method: "POST", body: JSON.stringify(body) })
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.body ?? { error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Failed to activate test subscription" }, { status: 502 })
  }
}
