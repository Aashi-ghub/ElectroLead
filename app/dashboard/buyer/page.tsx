"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import CategoryImage from "@/components/category-image"
import { useSession } from "@/hooks/use-session"
import { Button } from "@/components/ui/button"
import { categoryLabel, formatBudgetRange, formatINR } from "@/lib/categories"
import { ArrowRight, BarChart3, Clock, FileText, MapPin, Plus, TrendingUp } from "lucide-react"

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

const STATUS_CLASS: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  awarded: "bg-[var(--reseda-green)]/15 text-[var(--reseda-green)]",
  closed: "bg-muted text-foreground/60",
}

function daysLeft(iso: string | null) {
  if (!iso) return null
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
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

  const open = enquiries.filter((e) => e.status === "open")
  const awarded = enquiries.filter((e) => e.status === "awarded")
  const totalQuotes = enquiries.reduce((sum, e) => sum + Number(e.quote_count || 0), 0)
  const openValue = open.reduce((sum, e) => sum + Number(e.budget_max || e.budget_min || 0), 0)

  // The enquiries worth attention first: open, most quotes waiting on a decision.
  const needsAttention = [...open].sort((a, b) => Number(b.quote_count) - Number(a.quote_count))

  const stats = [
    { label: "Open enquiries", value: String(open.length), icon: TrendingUp },
    { label: "Quotes received", value: String(totalQuotes), icon: BarChart3 },
    { label: "Awarded", value: String(awarded.length), icon: FileText },
    { label: "Value out for quote", value: openValue > 0 ? formatINR(openValue) : "—", icon: BarChart3 },
  ]

  return (
    <DashboardLayout userRole={user.role as "buyer" | "seller" | "admin"} userName={user.name} userEmail={user.email}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{user.company_name || user.name}</h1>
          <p className="text-foreground/60 mt-1">
            {open.length > 0
              ? `${open.length} ${open.length === 1 ? "enquiry" : "enquiries"} out for quote`
              : "Nothing out for quote right now"}
          </p>
        </div>
        <Link href="/dashboard/buyer/create-enquiry">
          <Button className="gap-1.5">
            <Plus size={16} />
            Post an enquiry
          </Button>
        </Link>
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

      <section>
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold">Waiting on your decision</h2>
            <p className="text-sm text-foreground/60 mt-0.5">Open enquiries, most-quoted first.</p>
          </div>
          <Link
            href="/dashboard/buyer/enquiries"
            className="text-sm font-medium text-primary hover:underline whitespace-nowrap flex items-center gap-1"
          >
            See all
            <ArrowRight size={14} />
          </Link>
        </div>

        {loadingEnquiries ? (
          <p className="text-foreground/60">Loading...</p>
        ) : needsAttention.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <FileText className="mx-auto mb-3 text-foreground/30" size={36} />
            <h3 className="font-semibold text-lg mb-1">
              {enquiries.length === 0 ? "No enquiries yet" : "Nothing open right now"}
            </h3>
            <p className="text-sm text-foreground/60 max-w-md mx-auto mb-5">
              Post what you need and verified suppliers near your site will quote on it.
            </p>
            <Link href="/dashboard/buyer/create-enquiry">
              <Button size="sm" className="gap-1.5">
                <Plus size={15} />
                Post an enquiry
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {needsAttention.slice(0, 4).map((enquiry) => {
              const left = daysLeft(enquiry.quote_deadline)
              return (
                <Link
                  key={enquiry.id}
                  href={`/dashboard/buyer/enquiry/${enquiry.id}`}
                  className="bg-card rounded-xl border border-border overflow-hidden flex hover:border-primary/60 transition-colors"
                >
                  <CategoryImage categoryKey={enquiry.category} className="w-24 shrink-0" />
                  <div className="p-4 min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] uppercase tracking-wide text-[var(--reseda-green)] font-semibold">
                        {categoryLabel(enquiry.category)}
                      </p>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize shrink-0 ${
                          STATUS_CLASS[enquiry.status]
                        }`}
                      >
                        {enquiry.status}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm leading-snug line-clamp-2 mt-1">{enquiry.title}</h3>
                    <p className="text-xs text-foreground/60 mt-1.5 flex items-center gap-1">
                      <MapPin size={11} />
                      {[enquiry.city, enquiry.state].filter(Boolean).join(", ")}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-primary">
                        {formatBudgetRange(enquiry.budget_min, enquiry.budget_max)}
                      </span>
                      <span className="text-[11px] text-foreground/60 flex items-center gap-2">
                        <span className={Number(enquiry.quote_count) > 0 ? "font-semibold text-foreground/80" : ""}>
                          {enquiry.quote_count} quote{Number(enquiry.quote_count) === 1 ? "" : "s"}
                        </span>
                        {left !== null && left > 0 && (
                          <span className={`flex items-center gap-0.5 ${left <= 3 ? "text-destructive" : ""}`}>
                            <Clock size={10} />
                            {left}d
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </DashboardLayout>
  )
}
