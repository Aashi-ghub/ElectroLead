"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { BarChart3, MessageSquare, TrendingUp, Clock, Plus } from "lucide-react"

export default function BuyerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null)
  const [enquiries] = useState([
    {
      id: 1,
      title: "Industrial Cables",
      location: "Mumbai",
      budget: "₹15-20L",
      quotes: 12,
      messages: 8,
      status: "active",
      daysLeft: 2,
    },
    {
      id: 2,
      title: "Transformer Supply",
      location: "Pan India",
      budget: "₹8-12L",
      quotes: 8,
      messages: 12,
      status: "awarded",
      daysLeft: 0,
    },
    {
      id: 3,
      title: "Switchgear Panel",
      location: "Gujarat",
      budget: "Not set",
      quotes: 0,
      messages: 0,
      status: "draft",
      daysLeft: 0,
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
          { label: "Active Enquiries", value: "12", icon: TrendingUp, color: "primary" },
          { label: "Responses Pending", value: "8", icon: Clock, color: "accent" },
          { label: "Total Value", value: "₹45L", icon: BarChart3, color: "primary" },
          { label: "Avg Response", value: "24h", icon: Clock, color: "accent" },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white rounded-lg border border-border hover:border-accent transition-colors">
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
        <h2 className="text-lg font-semibold text-primary mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/buyer/create-enquiry" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Create Enquiry
          </Link>
          <Link href="/dashboard/buyer/enquiries" className="btn-outline">
            View All Enquiries
          </Link>
          <Link href="/messages" className="btn-outline flex items-center gap-2">
            <MessageSquare size={16} /> Messages
          </Link>
        </div>
      </div>

      {/* Recent Enquiries */}
      <div>
        <h2 className="text-lg font-semibold text-primary mb-4">Recent Enquiries</h2>
        <div className="space-y-4">
          {enquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              className="p-6 bg-white rounded-lg border border-border hover:border-accent hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-primary">{enquiry.title}</h3>
                  <p className="text-sm text-foreground/60">
                    {enquiry.location} • {enquiry.budget}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    enquiry.status === "active"
                      ? "bg-primary/10 text-primary"
                      : enquiry.status === "awarded"
                        ? "bg-green-500/10 text-green-600"
                        : "bg-muted text-foreground/60"
                  }`}
                >
                  {enquiry.status === "active" ? "Active" : enquiry.status === "awarded" ? "Awarded" : "Draft"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-6 text-sm">
                  <span className="text-foreground/60">{enquiry.quotes} Quotes</span>
                  <span className="text-foreground/60">{enquiry.messages} Messages</span>
                  {enquiry.daysLeft > 0 && <span className="text-accent">{enquiry.daysLeft} days left</span>}
                </div>
                <Link href={`/dashboard/buyer/enquiry/${enquiry.id}`} className="btn-outline text-sm">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
