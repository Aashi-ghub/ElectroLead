"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import CategoryImage from "@/components/category-image"
import SaveContactButton from "@/components/save-contact-button"
import { useSession } from "@/hooks/use-session"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { categoryLabel, formatBudgetRange, formatINR } from "@/lib/categories"
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  MapPin,
  MessageSquare,
  Star,
  TrendingUp,
  Trophy,
} from "lucide-react"

interface EnquiryDetail {
  id: string
  title: string
  description: string | null
  city: string
  state: string | null
  category: string | null
  budget_min: string | null
  budget_max: string | null
  quote_deadline: string | null
  project_start_date: string | null
  delivery_date: string | null
  status: string
  quote_count: number
}

interface Quotation {
  id: string
  seller_id: string
  is_saved: boolean
  total_price: string
  delivery_days: number | null
  warranty_period: string | null
  payment_terms: string | null
  notes: string | null
  status: string
  created_at: string
  seller_name: string
  seller_company: string | null
  seller_city: string | null
  seller_state: string | null
  seller_rating: string | null
  seller_review_count: number
  seller_years: number | null
  seller_response_hours: number | null
  seller_kyc_status: string | null
  seller_category: string | null
}

const STATUS_STYLE: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  awarded: "bg-[var(--reseda-green)]/15 text-[var(--reseda-green)]",
  closed: "bg-muted text-foreground/60",
}

export default function EnquiryDetailPage() {
  const params = useParams<{ id: string }>()
  const { user, loading } = useSession()
  const [enquiry, setEnquiry] = useState<EnquiryDetail | null>(null)
  const [quotes, setQuotes] = useState<Quotation[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  const handleAccept = async (quoteId: string) => {
    setAcceptingId(quoteId)
    try {
      const res = await fetch(`/api/quotations/${quoteId}/accept`, { method: "POST" })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Failed to accept quotation")
      }
      setQuotes((prev) => prev.map((q) => ({ ...q, status: q.id === quoteId ? "accepted" : "rejected" })))
      setEnquiry((prev) => (prev ? { ...prev, status: "awarded" } : prev))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept quotation")
    } finally {
      setAcceptingId(null)
    }
  }

  useEffect(() => {
    Promise.all([
      fetch(`/api/enquiries/${params.id}`).then((res) => (res.ok ? res.json() : Promise.reject(res))),
      fetch(`/api/enquiries/${params.id}/quotations`).then((res) => (res.ok ? res.json() : Promise.reject(res))),
    ])
      .then(([enquiryData, quotesData]) => {
        setEnquiry(enquiryData.enquiry)
        setQuotes(quotesData.quotations ?? [])
      })
      .catch(() => setError("Could not load this enquiry."))
      .finally(() => setLoadingData(false))
  }, [params.id])

  if (loading || !user) return null

  // Lowest price gets a marker. On a comparison screen the buyer is going to
  // work it out anyway; surfacing it saves them doing arithmetic across cards.
  const lowest = quotes.length
    ? quotes.reduce((min, q) => (Number(q.total_price) < Number(min.total_price) ? q : min))
    : null

  return (
    <DashboardLayout userRole={user.role as "buyer" | "seller" | "admin"} userName={user.name} userEmail={user.email}>
      <div className="flex items-start gap-3 mb-6">
        <Link href="/dashboard/buyer/enquiries" className="mt-1.5 text-foreground/50 hover:text-foreground">
          <ArrowLeft size={22} />
        </Link>
        <div className="min-w-0">
          {enquiry?.category && (
            <p className="text-[11px] uppercase tracking-wide text-[var(--reseda-green)] font-semibold mb-1">
              {categoryLabel(enquiry.category)}
            </p>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{enquiry?.title ?? "Enquiry"}</h1>
        </div>
      </div>

      {loadingData ? (
        <p className="text-foreground/60">Loading...</p>
      ) : !enquiry ? (
        <p className="text-destructive">{error ?? "Enquiry not found."}</p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Overview */}
            <Card className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <CategoryImage categoryKey={enquiry.category} className="w-full h-32 sm:w-40 sm:h-auto shrink-0" />
                <div className="p-5 flex-1">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="text-lg font-semibold">Requirement</h2>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                        STATUS_STYLE[enquiry.status] ?? "bg-muted"
                      }`}
                    >
                      {enquiry.status}
                    </span>
                  </div>
                  <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-foreground/55 text-xs mb-0.5">Delivery location</dt>
                      <dd className="font-medium flex items-center gap-1.5">
                        <MapPin size={14} className="text-foreground/40" />
                        {[enquiry.city, enquiry.state].filter(Boolean).join(", ")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-foreground/55 text-xs mb-0.5">Budget</dt>
                      <dd className="font-medium text-primary">
                        {formatBudgetRange(enquiry.budget_min, enquiry.budget_max)}
                      </dd>
                    </div>
                  </dl>
                  {enquiry.description && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-foreground/75 whitespace-pre-wrap leading-relaxed">
                        {enquiry.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Quotes — the buyer sees every supplier's price and identity here;
                each seller only ever sees their own quote, enforced server-side. */}
            <Card className="p-5">
              <h2 className="text-lg font-semibold mb-1">Quotes received ({quotes.length})</h2>
              <p className="text-sm text-foreground/55 mb-5">
                Only you can see these. Suppliers never see each other's pricing.
              </p>

              {quotes.length === 0 ? (
                <p className="text-sm text-foreground/60 py-6 text-center">
                  No quotes yet. Suppliers in {enquiry.city} are notified when a requirement opens.
                </p>
              ) : (
                <div className="space-y-4">
                  {quotes.map((quote) => {
                    const isLowest = lowest?.id === quote.id && quotes.length > 1
                    const accepted = quote.status === "accepted"
                    return (
                      <div
                        key={quote.id}
                        className={`p-4 rounded-xl border transition-colors ${
                          accepted
                            ? "border-[var(--reseda-green)]/50 bg-[var(--reseda-green)]/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold flex items-center gap-1.5 flex-wrap">
                              {quote.seller_company || quote.seller_name}
                              {quote.seller_kyc_status === "approved" && (
                                <span
                                  title="KYC verified supplier"
                                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--reseda-green)] bg-[var(--reseda-green)]/10 px-1.5 py-0.5 rounded-full"
                                >
                                  <BadgeCheck size={11} />
                                  Verified
                                </span>
                              )}
                            </h3>
                            <p className="text-xs text-foreground/55 mt-0.5">
                              {quote.seller_name}
                              {quote.seller_city ? ` · ${quote.seller_city}` : ""}
                            </p>

                            {/* Reputation: a price means little without it. */}
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-foreground/65">
                              {quote.seller_rating && (
                                <span className="flex items-center gap-1">
                                  <Star size={12} className="text-primary fill-primary" />
                                  <span className="font-semibold">{Number(quote.seller_rating).toFixed(1)}</span>
                                  <span className="text-foreground/45">({quote.seller_review_count})</span>
                                </span>
                              )}
                              {quote.seller_years && (
                                <span className="flex items-center gap-1">
                                  <TrendingUp size={12} className="text-foreground/40" />
                                  {quote.seller_years} yrs
                                </span>
                              )}
                              {quote.seller_response_hours && (
                                <span className="flex items-center gap-1">
                                  <Clock size={12} className="text-foreground/40" />
                                  replies ~{quote.seller_response_hours}h
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-xl font-bold text-primary leading-tight">
                              {formatINR(quote.total_price)}
                            </p>
                            <p className="text-[11px] text-foreground/45">
                              ₹{Number(quote.total_price).toLocaleString("en-IN")}
                            </p>
                            {isLowest && !accepted && (
                              <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-[var(--reseda-green)]">
                                <Trophy size={11} />
                                Lowest quote
                              </span>
                            )}
                            {accepted && (
                              <span className="block mt-1 text-xs font-semibold text-[var(--reseda-green)]">
                                Accepted
                              </span>
                            )}
                            {quote.status === "rejected" && (
                              <span className="block mt-1 text-xs text-foreground/45">Not selected</span>
                            )}
                          </div>
                        </div>

                        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm py-3 border-y border-border">
                          <div>
                            <dt className="text-foreground/55 text-xs">Delivery</dt>
                            <dd className="font-medium">
                              {quote.delivery_days ? `${quote.delivery_days} days` : "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-foreground/55 text-xs">Warranty</dt>
                            <dd className="font-medium">{quote.warranty_period ?? "—"}</dd>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <dt className="text-foreground/55 text-xs">Payment terms</dt>
                            <dd className="font-medium text-[13px]">{quote.payment_terms ?? "—"}</dd>
                          </div>
                        </dl>

                        {quote.notes && (
                          <p className="text-sm text-foreground/65 mt-3 leading-relaxed">{quote.notes}</p>
                        )}

                        <div className="flex flex-wrap items-start gap-2 mt-4">
                          {enquiry.status === "open" && quote.status === "submitted" && (
                            <Button
                              size="sm"
                              disabled={acceptingId === quote.id}
                              onClick={() => handleAccept(quote.id)}
                            >
                              {acceptingId === quote.id ? "Accepting..." : "Accept quote"}
                            </Button>
                          )}
                          <Link
                            href={`/dashboard/buyer/messages?enquiry_id=${enquiry.id}&contact_id=${quote.seller_id}`}
                          >
                            <Button size="sm" variant="outline">
                              <MessageSquare size={14} className="mr-1.5" />
                              Message
                            </Button>
                          </Link>
                          <SaveContactButton
                            contactId={quote.seller_id}
                            initialSaved={Boolean(quote.is_saved)}
                            label="supplier"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Timeline */}
          <aside className="space-y-4">
            <Card className="p-5">
              <h2 className="font-semibold mb-4">Timeline</h2>
              <dl className="space-y-4 text-sm">
                {[
                  { label: "Quote deadline", value: enquiry.quote_deadline },
                  { label: "Project start", value: enquiry.project_start_date },
                  { label: "Delivery by", value: enquiry.delivery_date },
                ].map((row) => (
                  <div key={row.label}>
                    <dt className="text-foreground/55 text-xs mb-0.5">{row.label}</dt>
                    <dd className="font-medium">
                      {row.value ? new Date(row.value).toLocaleDateString("en-IN") : "Not set"}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>

            {quotes.length > 1 && (
              <Card className="p-5">
                <h2 className="font-semibold mb-3">At a glance</h2>
                <dl className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-foreground/60">Quotes</dt>
                    <dd className="font-semibold">{quotes.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-foreground/60">Lowest</dt>
                    <dd className="font-semibold text-primary">
                      {formatINR(Math.min(...quotes.map((q) => Number(q.total_price))))}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-foreground/60">Highest</dt>
                    <dd className="font-semibold">
                      {formatINR(Math.max(...quotes.map((q) => Number(q.total_price))))}
                    </dd>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <dt className="text-foreground/60">Spread</dt>
                    <dd className="font-semibold">
                      {formatINR(
                        Math.max(...quotes.map((q) => Number(q.total_price))) -
                          Math.min(...quotes.map((q) => Number(q.total_price)))
                      )}
                    </dd>
                  </div>
                </dl>
              </Card>
            )}
          </aside>
        </div>
      )}
    </DashboardLayout>
  )
}
