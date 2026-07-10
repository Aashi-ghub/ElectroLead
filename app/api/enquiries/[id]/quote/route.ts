import { NextResponse } from "next/server"
import { backendFetch, BackendError } from "@/lib/backend"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  try {
    const data = await backendFetch(`/api/enquiries/${id}/quote`, { method: "POST", body: JSON.stringify(body) })
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.body ?? { error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Failed to submit quotation" }, { status: 502 })
  }
}
