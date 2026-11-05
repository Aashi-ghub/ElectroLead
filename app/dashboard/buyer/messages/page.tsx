"use client"

import { Suspense } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import MessagesView from "@/components/messages-view"
import { useSession } from "@/hooks/use-session"

export default function BuyerMessagesPage() {
  const { user, loading } = useSession()

  if (loading || !user) return null

  return (
    <DashboardLayout userRole="buyer" userName={user.name} userEmail={user.email}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-foreground/60 mt-1">Talk to the suppliers who quoted on your enquiries</p>
      </div>
      <Suspense fallback={<p className="text-foreground/60">Loading conversations...</p>}>
        <MessagesView
          currentUserId={user.id}
          counterpartyLabel="Suppliers"
          enquiryHrefBase="/dashboard/buyer/enquiry"
        />
      </Suspense>
    </DashboardLayout>
  )
}
