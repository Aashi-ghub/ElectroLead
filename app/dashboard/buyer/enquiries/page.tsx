"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Search } from "lucide-react"

export default function EnquiriesPage() {
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
      posted: "Today 09:30",
    },
    {
      id: 2,
      title: "Transformer Supply",
      location: "Pan India",
      budget: "₹8-12L",
      quotes: 8,
      messages: 12,
      status: "awarded",
      posted: "2 days ago",
    },
    {
      id: 3,
      title: "Switchgear Panel",
      location: "Gujarat",
      budget: "Not set",
      quotes: 0,
      messages: 0,
      status: "draft",
      posted: "1 week ago",
    },
  ])

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
    } else {
      router.push("/auth/login")
    }
  }, [router])

  if (!user) return null

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
              placeholder="Search enquiries..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Link href="/dashboard/buyer/create-enquiry">
            <Button>Create New</Button>
          </Link>
        </div>

        {/* Enquiries List */}
        <div className="space-y-4">
          {enquiries.map((enquiry) => (
            <Card key={enquiry.id} className="p-6 border border-border bg-card hover:border-primary/60 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{enquiry.title}</h3>
                  <p className="text-sm text-foreground/60">
                    {enquiry.location} • {enquiry.budget}
                  </p>
                  <p className="text-xs text-foreground/50 mt-1">Posted: {enquiry.posted}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
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
      </main>
    </div>
    </DashboardLayout>
  )
}
