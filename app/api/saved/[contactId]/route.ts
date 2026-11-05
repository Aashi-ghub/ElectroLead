import { NextResponse } from "next/server"
import { backendFetch, BackendError } from "@/lib/backend"

export async function DELETE(_req: Request, { params }: { params: Promise<{ contactId: string }> }) {
  const { contactId } = await params
  try {
    const data = await backendFetch(`/api/saved/${contactId}`, { method: "DELETE" })
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.body ?? { error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Failed to remove saved contact" }, { status: 502 })
  }
}
