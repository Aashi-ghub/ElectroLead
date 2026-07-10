"use client"

import { useEffect, useState } from "react"

interface AdminEnquiry {
  id: string
  title: string
  city: string
  state: string | null
  status: "open" | "closed" | "awarded"
  created_at: string
  buyer_name: string
  buyer_email: string
  quote_count: number
}

const STATUS_BADGE: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  awarded: "bg-green-500/10 text-green-600",
  closed: "bg-muted text-foreground/60",
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/enquiries")
      .then((res) => (res.ok ? res.json() : { enquiries: [] }))
      .then((data) => setEnquiries(data.enquiries ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Enquiries</h1>
      <p className="text-sm text-foreground/60 mb-6">All enquiries posted across the platform.</p>

      {loading ? (
        <p className="text-sm text-foreground/60">Loading...</p>
      ) : (
        <div className="bg-[var(--surface-panel)] border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-foreground/60">
                <th className="p-4">Title</th>
                <th className="p-4">Buyer</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4">Quotes</th>
                <th className="p-4">Posted</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enquiry) => (
                <tr key={enquiry.id} className="border-b border-border last:border-0">
                  <td className="p-4">{enquiry.title}</td>
                  <td className="p-4">
                    {enquiry.buyer_name}
                    <div className="text-xs text-foreground/50">{enquiry.buyer_email}</div>
                  </td>
                  <td className="p-4">{[enquiry.city, enquiry.state].filter(Boolean).join(", ")}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[enquiry.status]}`}>
                      {enquiry.status}
                    </span>
                  </td>
                  <td className="p-4">{enquiry.quote_count}</td>
                  <td className="p-4">{new Date(enquiry.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {enquiries.length === 0 && <p className="p-6 text-sm text-foreground/60">No enquiries yet.</p>}
        </div>
      )}
    </div>
  )
}
