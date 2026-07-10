"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { useSession } from "@/hooks/use-session"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Search } from "lucide-react"

interface SellerEnquiry {
  id: string
  title: string
  description: string | null
  city: string
  state: string | null
  budget_min: string | null
  budget_max: string | null
  quote_deadline: string | null
  created_at: string
  buyer_name: string
  buyer_company: string | null
  quote_count: number
  my_quote_count: number
}

function formatBudget(min: string | null, max: string | null) {
  if (!min && !max) return "Not set"
  const fmt = (v: string) => `₹${(Number(v) / 100000).toFixed(1)}L`
  if (min && max) return `${fmt(min)} - ${fmt(max)}`
  return fmt(min || max || "0")
}

export default function SellerEnquiriesPage() {
  const { user, loading } = useSession()
  const [enquiries, setEnquiries] = useState<SellerEnquiry[]>([])
  const [subscription, setSubscription] = useState<{ plan_type: string; end_date: string } | null>(null)
  const [freeTier, setFreeTier] = useState<{ monthly_quotation_limit: number; remaining: number } | null>(null)
  const [loadingEnquiries, setLoadingEnquiries] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/enquiries/list")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        setEnquiries(data.enquiries ?? [])
        setSubscription(data.subscription ?? null)
        setFreeTier(data.free_tier ?? null)
      })
      .catch(async (res) => {
        const data = await res.json?.().catch(() => null)
        setError(data?.error || "Failed to load enquiries")
      })
      .finally(() => setLoadingEnquiries(false))
  }, [])

  if (loading || !user) return null

  const filtered = enquiries.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <DashboardLayout userRole={user.role as "buyer" | "seller" | "admin"} userName={user.name} userEmail={user.email}>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/dashboard/seller">
            <button className="text-foreground/60 hover:text-foreground">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <h1 className="text-2xl font-bold">Available Enquiries</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan / free-tier banner */}
        <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm">
          {subscription ? (
            <span>
              <strong className="capitalize">{subscription.plan_type}</strong> plan active until{" "}
              {new Date(subscription.end_date).toLocaleDateString()}. Unlimited quotes.
            </span>
          ) : (
            <span>
              Free tier — showing enquiries in your city only.{" "}
              {freeTier && (
                <strong>
                  {freeTier.remaining} of {freeTier.monthly_quotation_limit} quotes left this month.
                </strong>
              )}{" "}
              <Link href="/pricing" className="text-primary underline">
                Upgrade for state/national access.
              </Link>
            </span>
          )}
        </div>

        {/* Search */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search enquiries..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Enquiries List */}
        {loadingEnquiries ? (
          <p className="text-sm text-foreground/60">Loading...</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-foreground/60">No enquiries available in your region right now.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((enquiry) => (
              <Card key={enquiry.id} className="p-6 border border-border bg-card hover:border-primary/60 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{enquiry.title}</h3>
                    <p className="text-sm text-foreground/60">
                      {[enquiry.city, enquiry.state].filter(Boolean).join(", ")} • {formatBudget(enquiry.budget_min, enquiry.budget_max)}
                    </p>
                    <p className="text-xs text-foreground/50 mt-1">
                      By: {enquiry.buyer_company || enquiry.buyer_name}
                    </p>
                  </div>
                  {enquiry.quote_deadline && (
                    <span className="text-xs font-medium text-accent whitespace-nowrap">
                      Due {new Date(enquiry.quote_deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-6 text-sm">
                    <span className="text-foreground/60">{enquiry.quote_count} quotes so far</span>
                  </div>
                  <Link href={`/dashboard/seller/enquiry/${enquiry.id}`}>
                    <Button size="sm">{enquiry.my_quote_count > 0 ? "View Your Quote" : "Submit Quote"}</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
    </DashboardLayout>
  )
}
