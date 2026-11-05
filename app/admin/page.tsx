import { redirect } from "next/navigation"

// The login flow and middleware both send admins to /admin, so this index has
// to exist - without it an admin signing in lands on a 404. Pending KYC is the
// queue that actually needs daily attention, so that is the landing tab.
export default function AdminIndex() {
  redirect("/admin/kyc")
}
