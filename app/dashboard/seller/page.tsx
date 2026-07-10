"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { useSession } from "@/hooks/use-session"
import { BarChart3, TrendingUp, Award } from "lucide-react"

interface SellerEnquiry {
  id: string
  title: string
  city: string
  state: string | null
  budget_min: string | null
  budget_max: string | null
  buyer_name: string
  buyer_company: string | null
  quote_count: number
}

interface MyQuotation {
  status: string
  total_price: string
}

function formatBudget(min: string | null, max: string | null) {
  if (!min && !max) return "Not set"
  const fmt = (v: string) => `₹${(Number(v) / 100000).toFixed(1)}L`
  if (min && max) return `${fmt(min)} - ${fmt(max)}`
  return fmt(min || max || "0")
}

export default function SellerDashboard() {
  const { user, loading } = useSession()
  const [leads, setLeads] = useState<SellerEnquiry[]>([])
  const [quotes, setQuotes] = useState<MyQuotation[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/enquiries/list").then((res) => (res.ok ? res.json() : { enquiries: [] })),
      fetch("/api/my-quotations").then((res) => (res.ok ? res.json() : { quotations: [] })),
    ])
      .then(([enquiryData, quoteData]) => {
        setLeads(enquiryData.enquiries ?? [])
        setQuotes(quoteData.quotations ?? [])
      })
      .finally(() => setLoadingData(false))
  }, [])

  if (loading || !user) return null

  const accepted = quotes.filter((q) => q.status === "accepted")
  const acceptanceRate = quotes.length > 0 ? Math.round((accepted.length / quotes.length) * 100) : 0
  const valueWon = accepted.reduce((sum, q) => sum + Number(q.total_price), 0)

  const stats = [
    { label: "Available Leads", value: String(leads.length), icon: TrendingUp },
    { label: "Quotes Submitted", value: String(quotes.length), icon: BarChart3 },
    { label: "Acceptance Rate", value: `${acceptanceRate}%`, icon: Award },
    { label: "Value Won", value: valueWon > 0 ? `₹${(valueWon / 100000).toFixed(1)}L` : "-", icon: TrendingUp },
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
        <h2 className="text-lg font-semibold text-primary mb-4">Quick Access</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/seller/enquiries" className="btn-primary">
            View New Leads
          </Link>
          <Link href="/dashboard/seller/quotes" className="btn-outline">
            My Quotes
          </Link>
        </div>
      </div>

      {/* Matching Enquiries */}
      <div>
        <h2 className="text-lg font-semibold text-primary mb-4">Matching Enquiries</h2>
        {loadingData ? (
          <p className="text-sm text-foreground/60">Loading...</p>
        ) : leads.length === 0 ? (
          <p className="text-sm text-foreground/60">No enquiries available in your region right now.</p>
        ) : (
          <div className="space-y-4">
            {leads.slice(0, 5).map((lead) => (
              <div
                key={lead.id}
                className="p-6 bg-[var(--surface-panel)] rounded-xl border border-border hover:border-primary/60 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-primary">{lead.title}</h3>
                    <p className="text-sm text-foreground/60">
                      {[lead.city, lead.state].filter(Boolean).join(", ")} • {formatBudget(lead.budget_min, lead.budget_max)}
                    </p>
                    <p className="text-xs text-foreground/50 mt-1">By: {lead.buyer_company || lead.buyer_name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-6 text-sm">
                    <span className="text-foreground/60">{lead.quote_count} quotes so far</span>
                  </div>
                  <Link href={`/dashboard/seller/enquiry/${lead.id}`} className="btn-primary text-sm">
                    Submit Quote
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
