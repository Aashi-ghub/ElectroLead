"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { useSession } from "@/hooks/use-session"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Search } from "lucide-react"

interface MyQuotation {
  id: string
  total_price: string
  delivery_days: number | null
  warranty_period: string | null
  status: "submitted" | "viewed" | "accepted" | "rejected"
  created_at: string
  enquiry_id: string
  enquiry_title: string
  buyer_name: string
  buyer_company: string | null
}

const STATUS_CLASS: Record<string, string> = {
  accepted: "bg-green-500/10 text-green-600",
  rejected: "bg-destructive/10 text-destructive",
  submitted: "bg-accent/10 text-accent",
  viewed: "bg-accent/10 text-accent",
}

export default function SellerQuotesPage() {
  const { user, loading } = useSession()
  const [quotes, setQuotes] = useState<MyQuotation[]>([])
  const [loadingQuotes, setLoadingQuotes] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/my-quotations")
      .then((res) => (res.ok ? res.json() : { quotations: [] }))
      .then((data) => setQuotes(data.quotations ?? []))
      .finally(() => setLoadingQuotes(false))
  }, [])

  if (loading || !user) return null

  const filtered = quotes.filter((q) => q.enquiry_title.toLowerCase().includes(search.toLowerCase()))

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
          <h1 className="text-2xl font-bold">My Quotes</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quotes..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Quotes List */}
        {loadingQuotes ? (
          <p className="text-sm text-foreground/60">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-foreground/60">You haven't submitted any quotes yet.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((quote) => (
              <Card key={quote.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{quote.enquiry_title}</h3>
                    <p className="text-sm text-foreground/60">{quote.buyer_company || quote.buyer_name}</p>
                    <p className="text-xs text-foreground/50 mt-1">
                      Submitted: {new Date(quote.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      ₹{Number(quote.total_price).toLocaleString("en-IN")}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 capitalize ${STATUS_CLASS[quote.status]}`}
                    >
                      {quote.status}
                    </span>
                  </div>
                </div>
                <Link href={`/dashboard/seller/enquiry/${quote.enquiry_id}`}>
                  <Button variant="outline" size="sm" className="px-4 bg-transparent">
                    View Enquiry
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
    </DashboardLayout>
  )
}
