import { NextResponse } from "next/server"
import { backendFetch, BackendError } from "@/lib/backend"

export async function POST(req: Request) {
  const formData = await req.formData()
  try {
    const data = await backendFetch("/api/profile/upload-kyc", { method: "POST", body: formData })
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.body ?? { error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Upload failed" }, { status: 502 })
  }
}
