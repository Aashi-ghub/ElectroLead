"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import CategoryImage from "@/components/category-image"
import SaveContactButton from "@/components/save-contact-button"
import { useSession } from "@/hooks/use-session"
import { Button } from "@/components/ui/button"
import { categoryLabel, formatINR } from "@/lib/categories"
import { MapPin, MessageSquare, Search, Send } from "lucide-react"

interface MyQuotation {
  id: string
  total_price: string
  delivery_days: number | null
  warranty_period: string | null
  status: "submitted" | "viewed" | "accepted" | "rejected"
  created_at: string
  enquiry_id: string
  enquiry_title: string
  enquiry_status: string
  category: string | null
  city: string
  state: string | null
  buyer_id: string
  buyer_name: string
  buyer_company: string | null
  is_saved: boolean
}

const STATUS_LABEL: Record<string, string> = {
  submitted: "Awaiting decision",
  accepted: "Won",
  rejected: "Not selected",
}

const STATUS_CLASS: Record<string, string> = {
  accepted: "bg-[var(--reseda-green)]/15 text-[var(--reseda-green)]",
  rejected: "bg-muted text-foreground/55",
  submitted: "bg-primary/10 text-primary",
}

const FILTERS = ["all", "submitted", "accepted", "rejected"] as const

export default function SellerQuotesPage() {
  const { user, loading } = useSession()
  const [quotes, setQuotes] = useState<MyQuotation[]>([])
  const [loadingQuotes, setLoadingQuotes] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<(typeof FILTERS)[number]>("all")

  useEffect(() => {
    fetch("/api/my-quotations")
      .then((res) => (res.ok ? res.json() : { quotations: [] }))
      .then((data) => setQuotes(data.quotations ?? []))
      .finally(() => setLoadingQuotes(false))
  }, [])

  if (loading || !user) return null

  const term = search.trim().toLowerCase()
  const filtered = quotes.filter(
    (q) =>
      (!term ||
        q.enquiry_title.toLowerCase().includes(term) ||
        (q.buyer_company ?? "").toLowerCase().includes(term)) &&
      (status === "all" || q.status === status)
  )

  const won = quotes.filter((q) => q.status === "accepted").length
  const value = quotes
    .filter((q) => q.status === "accepted")
    .reduce((sum, q) => sum + Number(q.total_price), 0)

  return (
    <DashboardLayout userRole={user.role as "buyer" | "seller" | "admin"} userName={user.name} userEmail={user.email}>
      <div className="mb-5">
        <h1 className="text-2xl font-bold">My Quotes</h1>
        <p className="text-foreground/60 mt-1">
          {quotes.length} submitted · {won} won
          {won > 0 && <> · {formatINR(value)} in awarded work</>}
        </p>
      </div>

      <div className="mb-4 space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by enquiry or buyer..."
            className="w-full pl-10 pr-4 h-11 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count = f === "all" ? quotes.length : quotes.filter((q) => q.status === f).length
            return (
              <button
                key={f}
                onClick={() => setStatus(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  status === f
                    ? "bg-[var(--jet-black)] text-primary-foreground border-[var(--jet-black)]"
                    : "bg-card border-border hover:border-primary/60"
                }`}
              >
                {f === "all" ? "All" : STATUS_LABEL[f]} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {loadingQuotes ? (
        <p className="text-foreground/60">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <Send className="mx-auto mb-3 text-foreground/30" size={36} />
          <h2 className="font-semibold text-lg mb-1">
            {quotes.length === 0 ? "You haven't quoted yet" : "Nothing matches that filter"}
          </h2>
          <p className="text-sm text-foreground/60 max-w-md mx-auto mb-5">
            {quotes.length === 0
              ? "Open leads in your coverage area are waiting. Quoting is how buyers find you."
              : "Try a different search term or status."}
          </p>
          {quotes.length === 0 && (
            <Link href="/dashboard/seller/enquiries">
              <Button size="sm">Browse available leads</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((quote) => (
            <article
              key={quote.id}
              className="bg-card rounded-xl border border-border overflow-hidden flex flex-col sm:flex-row hover:border-primary/60 transition-colors"
            >
              <CategoryImage categoryKey={quote.category} className="w-full h-28 sm:w-32 sm:h-auto shrink-0" />

              <div className="flex-1 p-4 sm:p-5 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-[var(--reseda-green)] font-semibold mb-1">
                      {categoryLabel(quote.category)}
                    </p>
                    <h2 className="font-semibold text-lg leading-snug">{quote.enquiry_title}</h2>
                    <p className="text-sm text-foreground/60 mt-1 flex flex-wrap items-center gap-x-2">
                      <span>{quote.buyer_company || quote.buyer_name}</span>
                      <span className="text-foreground/30">·</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} />
                        {[quote.city, quote.state].filter(Boolean).join(", ")}
                      </span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-primary leading-tight">{formatINR(quote.total_price)}</p>
                    <span
                      className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mt-1.5 ${
                        STATUS_CLASS[quote.status]
                      }`}
                    >
                      {STATUS_LABEL[quote.status]}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 pt-3 border-t border-border text-xs text-foreground/60">
                  {quote.delivery_days && <span>{quote.delivery_days} day delivery</span>}
                  {quote.warranty_period && <span>{quote.warranty_period} warranty</span>}
                  <span>Quoted {new Date(quote.created_at).toLocaleDateString("en-IN")}</span>

                  <div className="ml-auto flex flex-wrap items-start gap-2">
                    <Link href={`/dashboard/seller/enquiry/${quote.enquiry_id}`}>
                      <Button variant="outline" size="sm">
                        View enquiry
                      </Button>
                    </Link>
                    <Link
                      href={`/dashboard/seller/messages?enquiry_id=${quote.enquiry_id}&contact_id=${quote.buyer_id}`}
                    >
                      <Button variant="outline" size="sm">
                        <MessageSquare size={14} className="mr-1.5" />
                        Message
                      </Button>
                    </Link>
                    <SaveContactButton
                      contactId={quote.buyer_id}
                      initialSaved={Boolean(quote.is_saved)}
                      label="buyer"
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
