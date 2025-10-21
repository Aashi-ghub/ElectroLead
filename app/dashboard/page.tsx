"use client"

import { Navigation } from "@/components/navigation"
import { DashboardStats } from "@/components/dashboard-stats"
import { EnquiryCard } from "@/components/enquiry-card"
import { FilterSearch } from "@/components/filter-search"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

const enquiries = [
  {
    id: "1",
    title: "Industrial LED Lighting Units",
    category: "Lighting",
    quantity: "1000 pieces",
    location: "New York, USA",
    deadline: "Dec 31, 2025",
    budget: "$8,000 - $10,000",
    responses: 12,
    status: "active" as const,
  },
  {
    id: "2",
    title: "High-Voltage Cables",
    category: "Cables & Wires",
    quantity: "500 meters",
    location: "Los Angeles, USA",
    deadline: "Jan 15, 2026",
    budget: "$5,000 - $7,000",
    responses: 8,
    status: "active" as const,
  },
  {
    id: "3",
    title: "Control Panel Systems",
    category: "Control Panels",
    quantity: "50 units",
    location: "Chicago, USA",
    deadline: "Dec 20, 2025",
    budget: "$15,000 - $20,000",
    responses: 5,
    status: "pending" as const,
  },
  {
    id: "4",
    title: "Power Transformers",
    category: "Transformers",
    quantity: "20 units",
    location: "Houston, USA",
    deadline: "Jan 10, 2026",
    budget: "$25,000 - $30,000",
    responses: 3,
    status: "pending" as const,
  },
]

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-foreground/60 mt-1">Welcome back! Here's your sourcing overview</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus size={18} />
            New Enquiry
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <FilterSearch />
        </div>

        {/* Enquiries Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Enquiries</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {enquiries.map((enquiry) => (
                <EnquiryCard key={enquiry.id} {...enquiry} />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "New response from ElectroSupply Co.", time: "2 hours ago" },
                  { action: 'Your enquiry "LED Lighting" reached 1000 views', time: "5 hours ago" },
                  { action: "Message from TechElectro Ltd", time: "1 day ago" },
                  { action: 'Enquiry "Control Panels" closed successfully', time: "2 days ago" },
                ].map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <span className="text-sm text-foreground/70">{activity.action}</span>
                    <span className="text-xs text-foreground/50">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
