import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ROLE_COOKIE } from "@/lib/backend"

const ROLE_MESSAGES: Record<string, string> = {
  buyer: "/dashboard/buyer/messages",
  seller: "/dashboard/seller/messages",
}

// Messaging lives inside each role's dashboard (the thread list is scoped by
// role); this bare /messages entry just forwards to the right one.
export default async function MessagesIndex() {
  const role = (await cookies()).get(ROLE_COOKIE)?.value
  redirect(ROLE_MESSAGES[role ?? ""] ?? "/auth/login")
}
