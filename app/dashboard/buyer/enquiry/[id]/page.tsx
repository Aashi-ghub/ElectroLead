"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Download, MessageSquare } from "lucide-react"

export default function EnquiryDetailPage({ params }: { params: { id: string } }) {
  const [quotes] = useState([
    {
      id: 1,
      supplier: "Electra Power Solutions",
      rating: 4.7,
      price: "₹42,50,000",
      delivery: "30 days",
      warranty: "2 years",
      status: "pending",
    },
    {
      id: 2,
      supplier: "Power Tech Industries",
      rating: 4.5,
      price: "₹40,00,000",
      delivery: "35 days",
      warranty: "18 months",
      status: "pending",
    },
  ])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/dashboard/buyer/enquiries">
            <button className="text-foreground/60 hover:text-foreground">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <h1 className="text-2xl font-bold">Industrial Cables</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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
                <div className="flex justify-between">
                  <span className="text-foreground/60">Priority</span>
                  <span className="font-medium">High</span>
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

            {/* Quotes Received */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Quotes Received ({quotes.length})</h2>
              <div className="space-y-4">
                {quotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{quote.supplier}</h3>
                        <p className="text-sm text-foreground/60">⭐ {quote.rating}</p>
                      </div>
                      <span className="text-lg font-bold text-primary">{quote.price}</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-foreground/60">Delivery: </span>
                        <span className="font-medium">{quote.delivery}</span>
                      </div>
                      <div>
                        <span className="text-foreground/60">Warranty: </span>
                        <span className="font-medium">{quote.warranty}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <MessageSquare size={16} /> Message
                      </Button>
                      <Button size="sm" className="flex-1">
                        Accept Quote
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
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
                <Button variant="outline" className="w-full bg-transparent">
                  <Download size={16} /> Download Specs
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Extend Deadline
                </Button>
                <Button variant="outline" className="w-full text-destructive bg-transparent">
                  Close Enquiry
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
