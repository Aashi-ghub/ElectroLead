"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import CategoryImage from "@/components/category-image"
import { useSession } from "@/hooks/use-session"
import { Button } from "@/components/ui/button"
import { categoryLabel, formatBudgetRange, formatINR } from "@/lib/categories"
import { ArrowRight, Award, BarChart3, Globe2, MapPin, Send, TrendingUp } from "lucide-react"

interface SellerEnquiry {
  id: string
  title: string
  city: string
  state: string | null
  category: string | null
  budget_min: string | null
  budget_max: string | null
  buyer_name: string
  buyer_company: string | null
  quote_count: number
  my_quote_count: number
}

interface MyQuotation {
  status: string
  total_price: string
}

const PLAN_SCOPE: Record<string, string> = {
  local: "your city",
  state: "your whole state",
  national: "all of India",
}

export default function SellerDashboard() {
  const { user, loading } = useSession()
  const [leads, setLeads] = useState<SellerEnquiry[]>([])
  const [quotes, setQuotes] = useState<MyQuotation[]>([])
  const [subscription, setSubscription] = useState<{ plan_type: string } | null>(null)
  const [freeTier, setFreeTier] = useState<{ monthly_quotation_limit: number; remaining: number } | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/enquiries/list").then((res) => (res.ok ? res.json() : { enquiries: [] })),
      fetch("/api/my-quotations").then((res) => (res.ok ? res.json() : { quotations: [] })),
    ])
      .then(([enquiryData, quoteData]) => {
        setLeads(enquiryData.enquiries ?? [])
        setSubscription(enquiryData.subscription ?? null)
        setFreeTier(enquiryData.free_tier ?? null)
        setQuotes(quoteData.quotations ?? [])
      })
      .finally(() => setLoadingData(false))
  }, [])

  if (loading || !user) return null

  const accepted = quotes.filter((q) => q.status === "accepted")
  // Win rate is only meaningful once a buyer has actually decided something.
  // Dividing by every submitted quote showed "0%" to a seller whose only
  // quote was still awaiting a decision, which reads as failure, not pending.
  const decided = quotes.filter((q) => q.status === "accepted" || q.status === "rejected")
  const acceptanceRate = decided.length > 0 ? Math.round((accepted.length / decided.length) * 100) : null
  const valueWon = accepted.reduce((sum, q) => sum + Number(q.total_price), 0)
  const unquoted = leads.filter((l) => Number(l.my_quote_count) === 0)
  const scope = subscription ? PLAN_SCOPE[subscription.plan_type] ?? "your region" : "your city"

  const stats = [
    { label: "Leads you can quote", value: String(unquoted.length), icon: TrendingUp },
    { label: "Quotes submitted", value: String(quotes.length), icon: Send },
    { label: "Win rate", value: acceptanceRate === null ? "—" : `${acceptanceRate}%`, icon: Award },
    { label: "Value won", value: valueWon > 0 ? formatINR(valueWon) : "—", icon: BarChart3 },
  ]

  return (
    <DashboardLayout userRole={user.role as "buyer" | "seller" | "admin"} userName={user.name} userEmail={user.email}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{user.company_name || user.name}</h1>
          <p className="text-foreground/60 mt-1 flex items-center gap-1.5">
            {subscription ? <Globe2 size={15} /> : <MapPin size={15} />}
            {subscription ? (
              <>
                <span className="capitalize font-medium text-foreground/80">{subscription.plan_type}</span> plan —
                covering {scope}
              </>
            ) : (
              <>
                Free tier — {user.city ?? "your city"} only
                {freeTier && <> · {freeTier.remaining} quotes left this month</>}
              </>
            )}
          </p>
        </div>
        {!subscription && (
          <Link href="/pricing">
            <Button className="gap-1.5">
              Widen your coverage
              <ArrowRight size={15} />
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-5 bg-card rounded-xl border border-border hover:border-primary/60 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-foreground/60 mb-1.5 leading-snug">{stat.label}</p>
                <p className="text-2xl lg:text-3xl font-bold text-primary">{stat.value}</p>
              </div>
              <stat.icon className="text-[var(--reseda-green)] shrink-0" size={26} />
            </div>
          </div>
        ))}
      </div>

      {/* Leads not yet quoted on: the one thing a supplier should act on today. */}
      <section>
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold">Leads waiting on your quote</h2>
            <p className="text-sm text-foreground/60 mt-0.5">Open requirements in {scope} you have not quoted on.</p>
          </div>
          <Link
            href="/dashboard/seller/enquiries"
            className="text-sm font-medium text-primary hover:underline whitespace-nowrap flex items-center gap-1"
          >
            See all
            <ArrowRight size={14} />
          </Link>
        </div>

        {loadingData ? (
          <p className="text-foreground/60">Loading...</p>
        ) : unquoted.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="font-medium mb-1">
              {leads.length === 0 ? `No open leads in ${scope} yet` : "You have quoted on everything available"}
            </p>
            <p className="text-sm text-foreground/60">
              {leads.length === 0
                ? "New requirements appear the moment a buyer posts one in your coverage area."
                : "Nice work. New leads will show up here as buyers post them."}
            </p>
            {!subscription && (
              <Link href="/pricing">
                <Button size="sm" className="mt-4">
                  Reach more buyers
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {unquoted.slice(0, 4).map((lead) => (
              <Link
                key={lead.id}
                href={`/dashboard/seller/enquiry/${lead.id}`}
                className="bg-card rounded-xl border border-border overflow-hidden flex hover:border-primary/60 transition-colors"
              >
                <CategoryImage categoryKey={lead.category} className="w-24 shrink-0" />
                <div className="p-4 min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wide text-[var(--reseda-green)] font-semibold mb-1">
                    {categoryLabel(lead.category)}
                  </p>
                  <h3 className="font-medium text-sm leading-snug line-clamp-2">{lead.title}</h3>
                  <p className="text-xs text-foreground/60 mt-1.5 flex items-center gap-1">
                    <MapPin size={11} />
                    {[lead.city, lead.state].filter(Boolean).join(", ")}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold text-primary">
                      {formatBudgetRange(lead.budget_min, lead.budget_max)}
                    </span>
                    <span className="text-[11px] text-foreground/50">
                      {lead.quote_count} quote{Number(lead.quote_count) === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  )
}
