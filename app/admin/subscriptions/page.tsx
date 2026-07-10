"use client"

import { useEffect, useState } from "react"

interface AdminSubscription {
  id: string
  plan_type: string
  amount_paid: string
  status: string
  start_date: string
  end_date: string
  created_at: string
  user_id: string
  user_name: string
  email: string
  role: string
}

const STATUS_BADGE: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  expired: "bg-muted text-foreground/60",
  cancelled: "bg-destructive/10 text-destructive",
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/subscriptions")
      .then((res) => (res.ok ? res.json() : { subscriptions: [] }))
      .then((data) => setSubscriptions(data.subscriptions ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Subscriptions</h1>
      <p className="text-sm text-foreground/60 mb-6">All seller subscription purchases and their status.</p>

      {loading ? (
        <p className="text-sm text-foreground/60">Loading...</p>
      ) : (
        <div className="bg-[var(--surface-panel)] border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-foreground/60">
                <th className="p-4">Seller</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Start</th>
                <th className="p-4">End</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="border-b border-border last:border-0">
                  <td className="p-4">
                    {sub.user_name}
                    <div className="text-xs text-foreground/50">{sub.email}</div>
                  </td>
                  <td className="p-4 capitalize">{sub.plan_type}</td>
                  <td className="p-4">₹{sub.amount_paid}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[sub.status] ?? ""}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-4">{new Date(sub.start_date).toLocaleDateString()}</td>
                  <td className="p-4">{new Date(sub.end_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {subscriptions.length === 0 && <p className="p-6 text-sm text-foreground/60">No subscriptions yet.</p>}
        </div>
      )}
    </div>
  )
}
