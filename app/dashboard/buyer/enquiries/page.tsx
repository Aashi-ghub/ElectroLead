"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { useSession } from "@/hooks/use-session"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Search } from "lucide-react"

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

function formatBudget(min: string | null, max: string | null) {
  if (!min && !max) return "Not set"
  const fmt = (v: string) => `₹${(Number(v) / 100000).toFixed(1)}L`
  if (min && max) return `${fmt(min)} - ${fmt(max)}`
  return fmt(min || max || "0")
}

export default function EnquiriesPage() {
  const { user, loading } = useSession()
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loadingEnquiries, setLoadingEnquiries] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/enquiries/my-enquiries")
      .then((res) => (res.ok ? res.json() : { enquiries: [] }))
      .then((data) => setEnquiries(data.enquiries ?? []))
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
          <Link href="/dashboard/buyer">
            <button className="text-foreground/60 hover:text-foreground">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <h1 className="text-2xl font-bold">My Enquiries</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter */}
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
          <Link href="/dashboard/buyer/create-enquiry">
            <Button>Create New</Button>
          </Link>
        </div>

        {/* Enquiries List */}
        {loadingEnquiries ? (
          <p className="text-sm text-foreground/60">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-foreground/60">No enquiries yet. Create your first one to get started.</p>
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
                      Posted: {new Date(enquiry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_CLASS[enquiry.status]}`}
                  >
                    {STATUS_LABEL[enquiry.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-6 text-sm">
                    <span className="text-foreground/60">{enquiry.quote_count} Quotes</span>
                  </div>
                  <Link href={`/dashboard/buyer/enquiry/${enquiry.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
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
