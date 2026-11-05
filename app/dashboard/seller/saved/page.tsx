"use client"

import DashboardLayout from "@/components/dashboard-layout"
import SavedContactsView from "@/components/saved-contacts-view"
import { useSession } from "@/hooks/use-session"

export default function SellerSavedPage() {
  const { user, loading } = useSession()

  if (loading || !user) return null

  return (
    <DashboardLayout userRole="seller" userName={user.name} userEmail={user.email}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Saved Buyers</h1>
        <p className="text-foreground/60 mt-1">Buyers you have bookmarked from enquiries you quoted on</p>
      </div>
      <SavedContactsView
        counterpartyLabel="buyer"
        messagesHref="/dashboard/seller/messages"
        emptyHint="Use Save on any quote in My Quotes to bookmark that buyer. They'll appear here so you can follow up on their next enquiry."
      />
    </DashboardLayout>
  )
}
