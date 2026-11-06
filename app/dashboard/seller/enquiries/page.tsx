"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import CategoryImage from "@/components/category-image"
import { useSession } from "@/hooks/use-session"
import { Button } from "@/components/ui/button"
import { CATEGORIES, categoryLabel, formatBudgetRange } from "@/lib/categories"
import { ArrowRight, BadgeCheck, CheckCircle2, Clock, Globe2, MapPin, Search } from "lucide-react"

interface SellerEnquiry {
  id: string
  title: string
  description: string | null
  city: string
  state: string | null
  category: string | null
  budget_min: string | null
  budget_max: string | null
  quote_deadline: string | null
  created_at: string
  buyer_name: string
  buyer_company: string | null
  buyer_kyc_status: string | null
  quote_count: number
  my_quote_count: number
}

const PLAN_SCOPE: Record<string, string> = {
  local: "your city",
  state: "your whole state",
  national: "all of India",
}

function daysLeft(iso: string | null) {
  if (!iso) return null
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}

export default function SellerEnquiriesPage() {
  const { user, loading } = useSession()
  const [enquiries, setEnquiries] = useState<SellerEnquiry[]>([])
  const [subscription, setSubscription] = useState<{ plan_type: string; end_date: string } | null>(null)
  const [freeTier, setFreeTier] = useState<{ monthly_quotation_limit: number; remaining: number } | null>(null)
  const [loadingEnquiries, setLoadingEnquiries] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string | null>(null)

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

  // Only offer category filters that actually match something in this seller's
  // scope - empty filter chips make a short list feel broken.
  const presentCategories = useMemo(() => {
    const keys = new Set(enquiries.map((e) => e.category).filter(Boolean) as string[])
    return CATEGORIES.filter((c) => keys.has(c.key))
  }, [enquiries])

  if (loading || !user) return null

  const term = search.trim().toLowerCase()
  const filtered = enquiries.filter((e) => {
    const matchesTerm =
      !term ||
      e.title.toLowerCase().includes(term) ||
      e.city.toLowerCase().includes(term) ||
      (e.buyer_company ?? "").toLowerCase().includes(term)
    return matchesTerm && (!category || e.category === category)
  })

  const scope = subscription ? PLAN_SCOPE[subscription.plan_type] ?? "your region" : "your city"

  return (
    <DashboardLayout userRole={user.role as "buyer" | "seller" | "admin"} userName={user.name} userEmail={user.email}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Available Leads</h1>
        <p className="text-foreground/60 mt-1">
          Open enquiries you can quote on, covering {scope}.
        </p>
      </div>

      {/* Plan banner. For a free seller this is the upgrade pitch, so it states
          plainly what they are not seeing rather than only what they are. */}
      <div
        className={`mb-6 rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${
          subscription
            ? "bg-[var(--reseda-green)]/10 border-[var(--reseda-green)]/30"
            : "bg-primary/5 border-primary/25"
        }`}
      >
        <div className="flex-1 text-sm">
          {subscription ? (
            <>
              <p className="font-semibold flex items-center gap-2">
                <Globe2 size={16} className="text-[var(--reseda-green)]" />
                <span className="capitalize">{subscription.plan_type}</span> plan — covering {scope}
              </p>
              <p className="text-foreground/60 mt-1">
                Unlimited quotes, active until {new Date(subscription.end_date).toLocaleDateString("en-IN")}.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                Free tier — {user.city ?? "your city"} only
              </p>
              <p className="text-foreground/60 mt-1">
                {freeTier
                  ? `${freeTier.remaining} of ${freeTier.monthly_quotation_limit} quotes left this month. `
                  : ""}
                Upgrade to reach buyers across your state or all of India.
              </p>
            </>
          )}
        </div>
        {!subscription && (
          <Link href="/pricing">
            <Button size="sm" className="whitespace-nowrap">
              See plans
              <ArrowRight size={15} className="ml-1.5" />
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="mb-5 space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, city or buyer..."
            className="w-full pl-10 pr-4 h-11 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {presentCategories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                category === null
                  ? "bg-[var(--jet-black)] text-primary-foreground border-[var(--jet-black)]"
                  : "bg-card border-border hover:border-primary/60"
              }`}
            >
              All ({enquiries.length})
            </button>
            {presentCategories.map((c) => {
              const count = enquiries.filter((e) => e.category === c.key).length
              return (
                <button
                  key={c.key}
                  onClick={() => setCategory(category === c.key ? null : c.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    category === c.key
                      ? "bg-[var(--jet-black)] text-primary-foreground border-[var(--jet-black)]"
                      : "bg-card border-border hover:border-primary/60"
                  }`}
                >
                  {c.label} ({count})
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Leads */}
      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : loadingEnquiries ? (
        <p className="text-foreground/60">Loading leads...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <MapPin className="mx-auto mb-3 text-foreground/30" size={36} />
          <h2 className="font-semibold text-lg mb-1">
            {enquiries.length === 0 ? `No open leads in ${scope} yet` : "Nothing matches that filter"}
          </h2>
          <p className="text-sm text-foreground/60 max-w-md mx-auto">
            {enquiries.length === 0
              ? "New enquiries appear here the moment a buyer posts one in your coverage area."
              : "Try a different search term or category."}
          </p>
          {enquiries.length === 0 && !subscription && (
            <Link href="/pricing">
              <Button size="sm" className="mt-5">
                Widen your coverage
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((enquiry) => {
            const left = daysLeft(enquiry.quote_deadline)
            const quoted = Number(enquiry.my_quote_count) > 0
            return (
              <article
                key={enquiry.id}
                className="bg-card rounded-xl border border-border overflow-hidden flex flex-col sm:flex-row hover:border-primary/60 transition-colors"
              >
                <CategoryImage
                  categoryKey={enquiry.category}
                  className="w-full h-32 sm:w-36 sm:h-auto shrink-0"
                />

                <div className="flex-1 p-4 sm:p-5 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-[var(--reseda-green)] font-semibold mb-1">
                        {categoryLabel(enquiry.category)}
                      </p>
                      <h3 className="font-semibold text-lg leading-snug">{enquiry.title}</h3>
                      <p className="text-sm text-foreground/60 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} />
                          {[enquiry.city, enquiry.state].filter(Boolean).join(", ")}
                        </span>
                        <span className="text-foreground/30">·</span>
                        <span className="flex items-center gap-1">
                          {enquiry.buyer_company || enquiry.buyer_name}
                          {enquiry.buyer_kyc_status === "approved" && (
                            <BadgeCheck size={13} className="text-[var(--reseda-green)]" aria-label="KYC verified buyer" />
                          )}
                        </span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-primary leading-tight">
                        {formatBudgetRange(enquiry.budget_min, enquiry.budget_max)}
                      </p>
                      <p className="text-[11px] text-foreground/50">buyer's budget</p>
                    </div>
                  </div>

                  {enquiry.description && (
                    <p className="text-sm text-foreground/65 mt-3 line-clamp-2">{enquiry.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-3 border-t border-border text-xs text-foreground/60">
                    <span>
                      {enquiry.quote_count} quote{Number(enquiry.quote_count) === 1 ? "" : "s"} so far
                    </span>
                    {left !== null && (
                      <span
                        className={`flex items-center gap-1 ${
                          left <= 3 ? "text-destructive font-medium" : ""
                        }`}
                      >
                        <Clock size={12} />
                        {left > 0 ? `${left} day${left === 1 ? "" : "s"} left to quote` : "Deadline passed"}
                      </span>
                    )}

                    <div className="ml-auto">
                      {quoted ? (
                        <Link href={`/dashboard/seller/enquiry/${enquiry.id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <CheckCircle2 size={14} className="text-[var(--reseda-green)]" />
                            View your quote
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/dashboard/seller/enquiry/${enquiry.id}`}>
                          <Button size="sm">Submit quote</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
