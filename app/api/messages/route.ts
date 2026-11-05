import { NextResponse } from "next/server"
import { backendFetch, BackendError } from "@/lib/backend"

export async function POST(req: Request) {
  const body = await req.text()
  try {
    const data = await backendFetch("/api/messages", { method: "POST", body })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.body ?? { error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Failed to send message" }, { status: 502 })
  }
}
