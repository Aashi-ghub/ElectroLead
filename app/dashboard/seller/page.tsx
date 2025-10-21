"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { BarChart3, MessageSquare, TrendingUp, Star } from "lucide-react"

export default function SellerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null)
  const [leads] = useState([
    {
      id: 1,
      title: "Industrial Plant Setup",
      location: "Mumbai",
      budget: "₹15-20L",
      views: 24,
      quotes: 12,
      buyer: "Raj Electronics",
      rating: 4.8,
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
    },
  ])

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/auth/login")
    } else {
      setUser(JSON.parse(storedUser))
    }
  }, [router])

  if (!user) return null

  return (
    <DashboardLayout userRole={user.role as "buyer" | "seller" | "admin"} userName={user.name} userEmail={user.email}>
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Leads", value: "24", icon: TrendingUp, color: "primary" },
          { label: "Quote Acceptance", value: "45%", icon: BarChart3, color: "accent" },
          { label: "Total Value", value: "₹2.8Cr", icon: TrendingUp, color: "primary" },
          { label: "Rating", value: "4.7", icon: Star, color: "accent" },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white rounded-2xl border border-border hover:border-accent transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
              </div>
              <stat.icon className="text-accent" size={32} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-primary mb-4">Quick Access</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/seller/enquiries" className="btn-primary">
            View New Leads
          </Link>
          <Link href="/dashboard/seller/quotes" className="btn-outline">
            My Quotes
          </Link>
          <Link href="/messages" className="btn-outline flex items-center gap-2">
            <MessageSquare size={16} /> Messages
          </Link>
        </div>
      </div>

      {/* Matching Enquiries */}
      <div>
        <h2 className="text-lg font-semibold text-primary mb-4">Matching Enquiries</h2>
        <div className="space-y-4">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="p-6 bg-white rounded-2xl border border-border hover:border-accent hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-primary">{lead.title}</h3>
                  <p className="text-sm text-foreground/60">
                    {lead.location} • {lead.budget}
                  </p>
                  <p className="text-xs text-foreground/50 mt-1">
                    By: {lead.buyer} {lead.rating > 0 && `• ⭐ ${lead.rating}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-6 text-sm">
                  <span className="text-foreground/60">{lead.views} views</span>
                  <span className="text-foreground/60">{lead.quotes} quotes</span>
                </div>
                <Link href={`/dashboard/seller/enquiry/${lead.id}`} className="btn-primary text-sm">
                  Submit Quote
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
