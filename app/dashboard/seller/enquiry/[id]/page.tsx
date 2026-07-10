"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { useSession } from "@/hooks/use-session"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

interface SellerEnquiry {
  id: string
  title: string
  description: string | null
  city: string
  state: string | null
  budget_min: string | null
  budget_max: string | null
  quote_deadline: string | null
  buyer_name: string
  buyer_company: string | null
  quote_count: number
  my_quote_count: number
}

export default function SellerEnquiryDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user, loading } = useSession()
  const [enquiry, setEnquiry] = useState<SellerEnquiry | null>(null)
  const [freeTier, setFreeTier] = useState<{ remaining: number } | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quoteData, setQuoteData] = useState({
    totalPrice: "",
    deliveryDays: "",
    warranty: "",
    paymentTerms: "",
    notes: "",
  })

  useEffect(() => {
    fetch(`/api/enquiries/list?id=${params.id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        // Postgres COUNT(*) comes back as a string over JSON - normalize so
        // strict equality checks below (=== 0) work correctly.
        const raw = data.enquiries?.[0]
        setEnquiry(raw ? { ...raw, my_quote_count: Number(raw.my_quote_count) } : null)
        setFreeTier(data.free_tier ?? null)
      })
      .catch(async (res) => {
        const data = await res.json?.().catch(() => null)
        setLoadError(data?.error || "Enquiry not found or not in your region.")
      })
      .finally(() => setLoadingData(false))
  }, [params.id])

  const handleQuoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setQuoteData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitQuote = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch(`/api/enquiries/${params.id}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_price: Number(quoteData.totalPrice),
          delivery_days: quoteData.deliveryDays ? Number(quoteData.deliveryDays) : undefined,
          warranty_period: quoteData.warranty || undefined,
          payment_terms: quoteData.paymentTerms || undefined,
          notes: quoteData.notes || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || data.errors?.[0]?.message || "Failed to submit quotation")
        return
      }
      router.push("/dashboard/seller/quotes")
    } catch {
      setError("Could not reach the server. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !user) return null

  return (
    <DashboardLayout userRole={user.role as "buyer" | "seller" | "admin"} userName={user.name} userEmail={user.email}>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
            <Link href="/dashboard/seller/enquiries">
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
          ) : loadError || !enquiry ? (
            <p className="text-sm text-destructive">{loadError ?? "Enquiry not found."}</p>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Buyer Info */}
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Buyer Information</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-foreground/60">Company</p>
                      <p className="font-medium">{enquiry.buyer_company || enquiry.buyer_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60">Contact</p>
                      <p className="font-medium">{enquiry.buyer_name}</p>
                    </div>
                  </div>
                </Card>

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
                    {enquiry.description && (
                      <div>
                        <span className="text-foreground/60 block mb-1">Description</span>
                        <p className="font-medium whitespace-pre-wrap">{enquiry.description}</p>
                      </div>
                    )}
                  </div>
                </Card>

                {enquiry.my_quote_count > 0 && (
                  <div className="px-4 py-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                    You've already submitted a quote for this enquiry — one quote per seller per enquiry.
                    <Link href="/dashboard/seller/quotes" className="text-primary underline ml-1">
                      View your quotes
                    </Link>
                  </div>
                )}

                {/* Quote Form */}
                {showQuoteForm && enquiry.my_quote_count === 0 && (
                  <Card className="p-6 border-primary/50 bg-primary/5">
                    <h2 className="text-lg font-semibold mb-4">Submit Your Quote</h2>
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Total Price (₹)</label>
                          <input
                            type="number"
                            name="totalPrice"
                            value={quoteData.totalPrice}
                            onChange={handleQuoteChange}
                            placeholder="1750000"
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Delivery Days</label>
                          <input
                            type="number"
                            name="deliveryDays"
                            value={quoteData.deliveryDays}
                            onChange={handleQuoteChange}
                            placeholder="30"
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Warranty</label>
                        <input
                          type="text"
                          name="warranty"
                          value={quoteData.warranty}
                          onChange={handleQuoteChange}
                          placeholder="2 years"
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Payment Terms</label>
                        <input
                          type="text"
                          name="paymentTerms"
                          value={quoteData.paymentTerms}
                          onChange={handleQuoteChange}
                          placeholder="30% advance, 70% on delivery"
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Additional Notes</label>
                        <textarea
                          name="notes"
                          value={quoteData.notes}
                          onChange={handleQuoteChange}
                          placeholder="Any special terms or conditions..."
                          rows={3}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {error && (
                        <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                          {error}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowQuoteForm(false)} className="px-6" disabled={submitting}>
                          Cancel
                        </Button>
                        <Button onClick={handleSubmitQuote} className="px-6" disabled={submitting}>
                          {submitting ? "Submitting..." : "Submit Quote"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
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
                  </div>
                </Card>

                {enquiry.my_quote_count === 0 && (
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Actions</h2>
                    {freeTier && freeTier.remaining <= 0 ? (
                      <p className="text-sm text-foreground/60">
                        You've used your free quotes for this month.{" "}
                        <Link href="/pricing" className="text-primary underline">
                          Subscribe
                        </Link>{" "}
                        for unlimited quotes.
                      </p>
                    ) : (
                      <Button onClick={() => setShowQuoteForm(!showQuoteForm)} className="px-6">
                        {showQuoteForm ? "Hide Quote Form" : "Submit Quote"}
                      </Button>
                    )}
                  </Card>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  )
}
