"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Search } from "lucide-react"

export default function SellerEnquiriesPage() {
  const [enquiries] = useState([
    {
      id: 1,
      title: "Industrial Plant Setup",
      location: "Mumbai",
      budget: "₹15-20L",
      views: 24,
      quotes: 12,
      buyer: "Raj Electronics",
      rating: 4.8,
      daysLeft: 2,
    },
    {
      id: 2,
      title: "Commercial Complex",
      location: "Pune",
      budget: "₹8-12L",
      views: 18,
      quotes: 8,
      buyer: "New buyer",
      rating: 0,
      daysLeft: 5,
    },
    {
      id: 3,
      title: "Maintenance Contract",
      location: "Thane",
      budget: "₹3-5L",
      views: 12,
      quotes: 6,
      buyer: "Repeat customer",
      rating: 4.5,
      daysLeft: 7,
    },
  ])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/dashboard/seller">
            <button className="text-foreground/60 hover:text-foreground">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <h1 className="text-2xl font-bold">Available Enquiries</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60" size={20} />
            <input
              type="text"
              placeholder="Search enquiries..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Enquiries List */}
        <div className="space-y-4">
          {enquiries.map((enquiry) => (
            <Card key={enquiry.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{enquiry.title}</h3>
                  <p className="text-sm text-foreground/60">
                    {enquiry.location} • {enquiry.budget}
                  </p>
                  <p className="text-xs text-foreground/50 mt-1">
                    By: {enquiry.buyer} {enquiry.rating > 0 && `• ⭐ ${enquiry.rating}`}
                  </p>
                </div>
                <span className="text-xs font-medium text-accent">{enquiry.daysLeft}d left</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-6 text-sm">
                  <span className="text-foreground/60">{enquiry.views} views</span>
                  <span className="text-foreground/60">{enquiry.quotes} quotes</span>
                </div>
                <Link href={`/dashboard/seller/enquiry/${enquiry.id}`}>
                  <Button size="sm">Submit Quote</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
