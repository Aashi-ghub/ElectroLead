import { NextResponse } from "next/server"
import { backendFetch, BackendError } from "@/lib/backend"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const data = await backendFetch(`/admin/users/${id}/documents`, { method: "GET" })
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.body ?? { error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Failed to load documents" }, { status: 502 })
  }
}
