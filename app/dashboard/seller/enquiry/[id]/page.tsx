"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Download, MessageSquare } from "lucide-react"

export default function SellerEnquiryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [quoteData, setQuoteData] = useState({
    unitPrice1: "",
    unitPrice2: "",
    unitPrice3: "",
    deliveryDays: "",
    warranty: "",
    paymentTerms: "",
    notes: "",
  })

  const handleQuoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setQuoteData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmitQuote = () => {
    router.push("/dashboard/seller/quotes")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/dashboard/seller/enquiries">
            <button className="text-foreground/60 hover:text-foreground">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <h1 className="text-2xl font-bold">Industrial Plant Setup</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Buyer Info */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Buyer Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-foreground/60">Company</p>
                  <p className="font-medium">Raj Electronics</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">Rating</p>
                  <p className="font-medium">⭐ 4.8 (47 reviews)</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">Verification</p>
                  <p className="font-medium text-primary">✓ Verified Buyer</p>
                </div>
              </div>
            </Card>

            {/* Project Overview */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Project Overview</h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Location</span>
                  <span className="font-medium">Mumbai, Maharashtra</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Budget</span>
                  <span className="font-medium">₹15-20L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Project Type</span>
                  <span className="font-medium">New Installation</span>
                </div>
              </div>
            </Card>

            {/* Products */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Required Products</h2>
              <div className="space-y-4">
                {[
                  { name: "33kV XLPE Power Cable", specs: "5000m", qty: "5000", unit: "Meter" },
                  { name: "MCB 63A 3-Pole", specs: "Siemens/L&T", qty: "200", unit: "Units" },
                  { name: "Cable Trays 300mm", specs: "Galvanized steel", qty: "50", unit: "Sets" },
                ].map((product, idx) => (
                  <div key={idx} className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">{product.name}</h3>
                      <span className="text-sm text-foreground/60">
                        {product.qty} {product.unit}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/60">{product.specs}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quote Form */}
            {showQuoteForm && (
              <Card className="p-6 border-primary/50 bg-primary/5">
                <h2 className="text-lg font-semibold mb-4">Submit Your Quote</h2>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Cable Price (per meter)</label>
                      <input
                        type="text"
                        name="unitPrice1"
                        value={quoteData.unitPrice1}
                        onChange={handleQuoteChange}
                        placeholder="₹850"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">MCB Price (per unit)</label>
                      <input
                        type="text"
                        name="unitPrice2"
                        value={quoteData.unitPrice2}
                        onChange={handleQuoteChange}
                        placeholder="₹1,200"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Tray Price (per set)</label>
                      <input
                        type="text"
                        name="unitPrice3"
                        value={quoteData.unitPrice3}
                        onChange={handleQuoteChange}
                        placeholder="₹8,500"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Delivery Days</label>
                      <input
                        type="text"
                        name="deliveryDays"
                        value={quoteData.deliveryDays}
                        onChange={handleQuoteChange}
                        placeholder="30"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
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

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowQuoteForm(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitQuote} className="flex-1">
                      Submit Quote
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Timeline</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-foreground/60 mb-1">Quote Deadline</p>
                  <p className="font-medium">Dec 15, 2024</p>
                </div>
                <div>
                  <p className="text-foreground/60 mb-1">Project Start</p>
                  <p className="font-medium">Jan 10, 2025</p>
                </div>
                <div>
                  <p className="text-foreground/60 mb-1">Delivery By</p>
                  <p className="font-medium">Feb 28, 2025</p>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="space-y-2">
                <Button onClick={() => setShowQuoteForm(!showQuoteForm)} className="w-full">
                  {showQuoteForm ? "Hide Quote Form" : "Submit Quote"}
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <MessageSquare size={16} /> Contact Buyer
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Download size={16} /> Download Specs
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
