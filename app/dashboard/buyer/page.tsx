"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { useSession } from "@/hooks/use-session"
import { BarChart3, TrendingUp, Clock, Plus } from "lucide-react"

interface Enquiry {
  id: string
  title: string
  city: string
  state: string | null
  budget_min: string | null
  budget_max: string | null
  status: "open" | "closed" | "awarded"
  created_at: string
  quote_count: number
}

const STATUS_LABEL: Record<string, string> = { open: "Active", closed: "Closed", awarded: "Awarded" }
const STATUS_CLASS: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  awarded: "bg-green-500/10 text-green-600",
  closed: "bg-muted text-foreground/60",
}

export default function BuyerDashboard() {
  const { user, loading } = useSession()
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loadingEnquiries, setLoadingEnquiries] = useState(true)

  useEffect(() => {
    fetch("/api/enquiries/my-enquiries")
      .then((res) => (res.ok ? res.json() : { enquiries: [] }))
      .then((data) => setEnquiries(data.enquiries ?? []))
      .finally(() => setLoadingEnquiries(false))
  }, [])

  if (loading || !user) return null

  const activeCount = enquiries.filter((e) => e.status === "open").length
  const totalQuotes = enquiries.reduce((sum, e) => sum + Number(e.quote_count || 0), 0)
  const totalBudget = enquiries.reduce((sum, e) => sum + Number(e.budget_max || e.budget_min || 0), 0)

  const stats = [
    { label: "Active Enquiries", value: String(activeCount), icon: TrendingUp },
    { label: "Total Enquiries", value: String(enquiries.length), icon: Clock },
    { label: "Quotes Received", value: String(totalQuotes), icon: BarChart3 },
    { label: "Total Budget Posted", value: totalBudget > 0 ? `₹${(totalBudget / 100000).toFixed(1)}L` : "-", icon: BarChart3 },
  ]

  return (
    <DashboardLayout userRole={user.role as "buyer" | "seller" | "admin"} userName={user.name} userEmail={user.email}>
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-[var(--isabella)] rounded-xl border border-border hover:border-primary/60 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
              </div>
              <stat.icon className="text-[var(--reseda-green)]" size={32} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-primary mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/buyer/create-enquiry" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Create Enquiry
          </Link>
          <Link href="/dashboard/buyer/enquiries" className="btn-outline">
            View All Enquiries
          </Link>
        </div>
      </div>

      {/* Recent Enquiries */}
      <div>
        <h2 className="text-lg font-semibold text-primary mb-4">Recent Enquiries</h2>
        {loadingEnquiries ? (
          <p className="text-sm text-foreground/60">Loading...</p>
        ) : enquiries.length === 0 ? (
          <p className="text-sm text-foreground/60">No enquiries yet. Create your first one to get started.</p>
        ) : (
          <div className="space-y-4">
            {enquiries.slice(0, 5).map((enquiry) => (
              <div
                key={enquiry.id}
                className="p-6 bg-[var(--surface-panel)] rounded-xl border border-border hover:border-primary/60 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-primary">{enquiry.title}</h3>
                    <p className="text-sm text-foreground/60">
                      {[enquiry.city, enquiry.state].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CLASS[enquiry.status]}`}>
                    {STATUS_LABEL[enquiry.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-6 text-sm">
                    <span className="text-foreground/60">{enquiry.quote_count} Quotes</span>
                  </div>
                  <Link href={`/dashboard/buyer/enquiry/${enquiry.id}`} className="btn-outline text-sm">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
