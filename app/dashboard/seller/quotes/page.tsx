"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Search } from "lucide-react"

export default function SellerQuotesPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null)
  const [quotes] = useState([
    {
      id: 1,
      enquiry: "Industrial Plant Setup",
      buyer: "Raj Electronics",
      amount: "₹42,50,000",
      status: "pending",
      submitted: "Today 14:30",
    },
    {
      id: 2,
      enquiry: "Commercial Complex",
      buyer: "New Buyer",
      amount: "₹38,00,000",
      status: "accepted",
      submitted: "2 days ago",
    },
    {
      id: 3,
      enquiry: "Maintenance Contract",
      buyer: "Repeat Customer",
      amount: "₹4,50,000",
      status: "pending",
      submitted: "1 week ago",
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
          <Link href="/dashboard/seller">
            <button className="text-foreground/60 hover:text-foreground">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <h1 className="text-2xl font-bold">My Quotes</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60" size={20} />
            <input
              type="text"
              placeholder="Search quotes..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Quotes List */}
        <div className="space-y-4">
          {quotes.map((quote) => (
            <Card key={quote.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{quote.enquiry}</h3>
                  <p className="text-sm text-foreground/60">{quote.buyer}</p>
                  <p className="text-xs text-foreground/50 mt-1">Submitted: {quote.submitted}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{quote.amount}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                      quote.status === "accepted" ? "bg-green-500/10 text-green-600" : "bg-accent/10 text-accent"
                    }`}
                  >
                    {quote.status === "accepted" ? "Accepted" : "Pending"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  View Details
                </Button>
                {quote.status === "pending" && (
                  <Button size="sm" className="flex-1">
                    Edit Quote
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
    </DashboardLayout>
  )
}
