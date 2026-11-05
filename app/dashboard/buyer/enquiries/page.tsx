"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import CategoryImage from "@/components/category-image"
import { useSession } from "@/hooks/use-session"
import { Button } from "@/components/ui/button"
import { categoryLabel, formatBudgetRange } from "@/lib/categories"
import { Clock, FileText, MapPin, Plus, Search } from "lucide-react"

interface Enquiry {
  id: string
  title: string
  city: string
  state: string | null
  category: string | null
  budget_min: string | null
  budget_max: string | null
  quote_deadline: string | null
  status: "open" | "closed" | "awarded"
  created_at: string
  quote_count: number
}

const STATUS_LABEL: Record<string, string> = { open: "Open", closed: "Closed", awarded: "Awarded" }
const STATUS_CLASS: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  awarded: "bg-[var(--reseda-green)]/15 text-[var(--reseda-green)]",
  closed: "bg-muted text-foreground/60",
}

const FILTERS = ["all", "open", "awarded", "closed"] as const

function daysLeft(iso: string | null) {
  if (!iso) return null
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}

export default function EnquiriesPage() {
  const { user, loading } = useSession()
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loadingEnquiries, setLoadingEnquiries] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<(typeof FILTERS)[number]>("all")

  useEffect(() => {
    fetch("/api/enquiries/my-enquiries")
      .then((res) => (res.ok ? res.json() : { enquiries: [] }))
      .then((data) => setEnquiries(data.enquiries ?? []))
      .finally(() => setLoadingEnquiries(false))
  }, [])

  if (loading || !user) return null

  const term = search.trim().toLowerCase()
  const filtered = enquiries.filter(
    (e) =>
      (!term || e.title.toLowerCase().includes(term) || e.city.toLowerCase().includes(term)) &&
      (status === "all" || e.status === status)
  )

  return (
    <DashboardLayout userRole={user.role as "buyer" | "seller" | "admin"} userName={user.name} userEmail={user.email}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Enquiries</h1>
          <p className="text-foreground/60 mt-1">Everything you have posted, and the quotes against it.</p>
        </div>
        <Link href="/dashboard/buyer/create-enquiry">
          <Button className="gap-1.5">
            <Plus size={16} />
            New enquiry
          </Button>
        </Link>
      </div>

      <div className="mb-5 space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or city..."
            className="w-full pl-10 pr-4 h-11 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count = f === "all" ? enquiries.length : enquiries.filter((e) => e.status === f).length
            return (
              <button
                key={f}
                onClick={() => setStatus(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-colors ${
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

      {loadingEnquiries ? (
        <p className="text-foreground/60">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <FileText className="mx-auto mb-3 text-foreground/30" size={36} />
          <h2 className="font-semibold text-lg mb-1">
            {enquiries.length === 0 ? "No enquiries yet" : "Nothing matches that filter"}
          </h2>
          <p className="text-sm text-foreground/60 max-w-md mx-auto mb-5">
            {enquiries.length === 0
              ? "Post what you need and verified suppliers near your site will quote on it."
              : "Try a different search term or status."}
          </p>
          {enquiries.length === 0 && (
            <Link href="/dashboard/buyer/create-enquiry">
              <Button size="sm" className="gap-1.5">
                <Plus size={15} />
                Post your first enquiry
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((enquiry) => {
            const left = enquiry.status === "open" ? daysLeft(enquiry.quote_deadline) : null
            return (
              <Link
                key={enquiry.id}
                href={`/dashboard/buyer/enquiry/${enquiry.id}`}
                className="block bg-card rounded-xl border border-border overflow-hidden hover:border-primary/60 transition-colors"
              >
                <article className="flex flex-col sm:flex-row">
                  <CategoryImage
                    categoryKey={enquiry.category}
                    className="w-full h-28 sm:w-32 sm:h-auto shrink-0"
                  />
                  <div className="flex-1 p-4 sm:p-5 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide text-[var(--reseda-green)] font-semibold mb-1">
                          {categoryLabel(enquiry.category)}
                        </p>
                        <h2 className="font-semibold text-lg leading-snug">{enquiry.title}</h2>
                        <p className="text-sm text-foreground/60 mt-1 flex items-center gap-1">
                          <MapPin size={13} />
                          {[enquiry.city, enquiry.state].filter(Boolean).join(", ")}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                            STATUS_CLASS[enquiry.status]
                          }`}
                        >
                          {STATUS_LABEL[enquiry.status]}
                        </span>
                        <p className="text-base font-bold text-primary mt-2">
                          {formatBudgetRange(enquiry.budget_min, enquiry.budget_max)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 pt-3 border-t border-border text-xs text-foreground/60">
                      <span className="font-medium text-foreground/80">
                        {enquiry.quote_count} quote{Number(enquiry.quote_count) === 1 ? "" : "s"} received
                      </span>
                      {left !== null && (
                        <span className={`flex items-center gap-1 ${left <= 3 ? "text-destructive font-medium" : ""}`}>
                          <Clock size={12} />
                          {left > 0 ? `${left} day${left === 1 ? "" : "s"} left` : "Deadline passed"}
                        </span>
                      )}
                      <span className="ml-auto text-primary font-medium">View quotes →</span>
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
