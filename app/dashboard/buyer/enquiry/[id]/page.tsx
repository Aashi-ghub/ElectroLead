"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { useSession } from "@/hooks/use-session"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

interface EnquiryDetail {
  id: string
  title: string
  description: string | null
  city: string
  state: string | null
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

  return (
    <DashboardLayout userRole={user.role as "buyer" | "seller" | "admin"} userName={user.name} userEmail={user.email}>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
            <Link href="/dashboard/buyer/enquiries">
              <button className="text-foreground/60 hover:text-foreground">
                <ArrowLeft size={24} />
              </button>
            </Link>
            <h1 className="text-2xl font-bold">{enquiry?.title ?? "Enquiry"}</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loadingData ? (
            <p className="text-sm text-foreground/60">Loading...</p>
          ) : error || !enquiry ? (
            <p className="text-sm text-destructive">{error ?? "Enquiry not found."}</p>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {error && (
                  <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                    {error}
                  </div>
                )}
                {/* Project Overview */}
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Project Overview</h2>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Location</span>
                      <span className="font-medium">{[enquiry.city, enquiry.state].filter(Boolean).join(", ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Budget</span>
                      <span className="font-medium">
                        {enquiry.budget_min || enquiry.budget_max
                          ? `₹${enquiry.budget_min ?? "?"} - ₹${enquiry.budget_max ?? "?"}`
                          : "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Status</span>
                      <span className="font-medium capitalize">{enquiry.status}</span>
                    </div>
                    {enquiry.description && (
                      <div>
                        <span className="text-foreground/60 block mb-1">Description</span>
                        <p className="font-medium whitespace-pre-wrap">{enquiry.description}</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Quotes Received - confidential comparison: buyer sees every seller's
                    price and identity here, but each seller only ever sees their own
                    quote (enforced server-side, not just hidden in this UI). */}
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Quotes Received ({quotes.length})</h2>
                  {quotes.length === 0 ? (
                    <p className="text-sm text-foreground/60">No quotes yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {quotes.map((quote) => (
                        <div
                          key={quote.id}
                          className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-medium">{quote.seller_company || quote.seller_name}</h3>
                              <p className="text-sm text-foreground/60">
                                {quote.seller_name} • {quote.seller_city ?? "-"}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-primary block">
                                ₹{Number(quote.total_price).toLocaleString("en-IN")}
                              </span>
                              {quote.status !== "submitted" && (
                                <span
                                  className={`text-xs font-medium capitalize ${
                                    quote.status === "accepted" ? "text-green-600" : "text-foreground/50"
                                  }`}
                                >
                                  {quote.status}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4 text-sm mb-2">
                            <div>
                              <span className="text-foreground/60">Delivery: </span>
                              <span className="font-medium">{quote.delivery_days ? `${quote.delivery_days} days` : "-"}</span>
                            </div>
                            <div>
                              <span className="text-foreground/60">Warranty: </span>
                              <span className="font-medium">{quote.warranty_period ?? "-"}</span>
                            </div>
                          </div>
                          {quote.payment_terms && (
                            <p className="text-sm text-foreground/60">
                              <span className="text-foreground/60">Payment terms: </span>
                              {quote.payment_terms}
                            </p>
                          )}
                          {quote.notes && <p className="text-sm text-foreground/60 mt-1">{quote.notes}</p>}
                          {enquiry.status === "open" && quote.status === "submitted" && (
                            <Button
                              size="sm"
                              className="mt-3"
                              disabled={acceptingId === quote.id}
                              onClick={() => handleAccept(quote.id)}
                            >
                              {acceptingId === quote.id ? "Accepting..." : "Accept Quote"}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Timeline</h2>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-foreground/60 mb-1">Quote Deadline</p>
                      <p className="font-medium">
                        {enquiry.quote_deadline ? new Date(enquiry.quote_deadline).toLocaleDateString() : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground/60 mb-1">Project Start</p>
                      <p className="font-medium">
                        {enquiry.project_start_date ? new Date(enquiry.project_start_date).toLocaleDateString() : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground/60 mb-1">Delivery By</p>
                      <p className="font-medium">
                        {enquiry.delivery_date ? new Date(enquiry.delivery_date).toLocaleDateString() : "-"}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  )
}
