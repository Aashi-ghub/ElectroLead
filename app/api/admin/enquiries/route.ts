import { NextResponse } from "next/server"
import { backendFetch, BackendError } from "@/lib/backend"

export async function GET(req: Request) {
  const { search } = new URL(req.url)
  try {
    const data = await backendFetch(`/admin/enquiries${search}`, { method: "GET" })
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.body ?? { error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Failed to load enquiries" }, { status: 502 })
  }
}
