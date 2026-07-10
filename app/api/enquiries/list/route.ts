import { NextResponse } from "next/server"
import { backendFetch, BackendError } from "@/lib/backend"

// Seller-facing scoped enquiry list (and single-enquiry lookup via ?id=).
// Named /list to avoid colliding with the buyer routes under /api/enquiries.
export async function GET(req: Request) {
  const { search } = new URL(req.url)
  try {
    const data = await backendFetch(`/api/enquiries${search}`, { method: "GET" })
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.body ?? { error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Failed to load enquiries" }, { status: 502 })
  }
}
