"use client"

import DashboardLayout from "@/components/dashboard-layout"
import SavedContactsView from "@/components/saved-contacts-view"
import { useSession } from "@/hooks/use-session"

export default function BuyerSavedPage() {
  const { user, loading } = useSession()

  if (loading || !user) return null

  return (
    <DashboardLayout userRole="buyer" userName={user.name} userEmail={user.email}>
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Saved Suppliers</h1>
        <p className="text-foreground/60 mt-1">Suppliers you have bookmarked from quotes you received</p>
      </div>
      <SavedContactsView
        counterpartyLabel="supplier"
        messagesHref="/dashboard/buyer/messages"
        emptyHint="Open an enquiry that has quotes and use Save on a supplier's quote. They'll appear here for quick access on your next project."
      />
    </DashboardLayout>
  )
}
