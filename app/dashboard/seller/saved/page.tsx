"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Search, Star, MapPin, Phone, Mail, Trash2, Building2 } from "lucide-react"

export default function SavedBuyersPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null)
  const [savedBuyers] = useState([
    {
      id: 1,
      name: "Raj Contractors",
      company: "Raj Construction Ltd",
      type: "Electrical Contractor",
      location: "Pune, Maharashtra",
      rating: 4.7,
      reviews: 23,
      phone: "+91 98765 43210",
      email: "raj@contractors.com",
      lastEnquiry: "3 days ago",
      totalEnquiries: 8,
      avgBudget: "₹5-10L",
      savedDate: "2024-01-15"
    },
    {
      id: 2,
      name: "Metro Projects",
      company: "Metro Infrastructure Ltd",
      type: "Infrastructure Project",
      location: "Hyderabad, Telangana",
      rating: 4.9,
      reviews: 45,
      phone: "+91 87654 32109",
      email: "projects@metro.com",
      lastEnquiry: "1 week ago",
      totalEnquiries: 15,
      avgBudget: "₹20-50L",
      savedDate: "2024-01-10"
    },
    {
      id: 3,
      name: "ABC Industries",
      company: "ABC Manufacturing",
      type: "Industrial Plant",
      location: "Faridabad, Haryana",
      rating: 4.5,
      reviews: 12,
      phone: "+91 76543 21098",
      email: "procurement@abc.com",
      lastEnquiry: "2 days ago",
      totalEnquiries: 5,
      avgBudget: "₹10-25L",
      savedDate: "2024-01-08"
    }
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

  const handleRemoveBuyer = (buyerId: number) => {
    // In a real app, this would remove from saved list
    console.log("Removing buyer:", buyerId)
  }

  const handleContactBuyer = (buyer: any) => {
    // In a real app, this would open messaging
    console.log("Contacting buyer:", buyer.name)
  }

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
            <div>
              <h1 className="text-2xl font-bold">Saved Buyers</h1>
              <p className="text-foreground/60">Manage your favorite buyers</p>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
                <input
                  type="text"
                  placeholder="Search saved buyers..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button variant="outline" className="px-4">
                Filter by Type
              </Button>
            </div>
          </div>

          {/* Buyers List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedBuyers.map((buyer) => (
              <Card key={buyer.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{buyer.name}</h3>
                      <p className="text-sm text-foreground/60">{buyer.company}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 size={16} className="text-foreground/60" />
                        <span className="text-sm text-foreground/60">{buyer.type}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-500" size={16} />
                          <span className="text-sm font-medium">{buyer.rating}</span>
                          <span className="text-xs text-foreground/60">({buyer.reviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBuyer(buyer.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-foreground/60">
                    <MapPin size={16} />
                    <span>{buyer.location}</span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-foreground/60" />
                      <span>{buyer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-foreground/60" />
                      <span>{buyer.email}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 py-3 bg-muted/30 rounded-lg px-3">
                    <div>
                      <p className="text-xs text-foreground/60">Total Enquiries</p>
                      <p className="font-semibold">{buyer.totalEnquiries}</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60">Avg Budget</p>
                      <p className="font-semibold">{buyer.avgBudget}</p>
                    </div>
                  </div>

                  {/* Last Enquiry */}
                  <div className="text-xs text-foreground/60">
                    Last enquiry: {buyer.lastEnquiry}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleContactBuyer(buyer)}
                      className="flex-1"
                      size="sm"
                    >
                      Contact
                    </Button>
                    <Button variant="outline" size="sm" className="px-4">
                      View Profile
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {savedBuyers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="text-foreground/40" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Saved Buyers</h3>
              <p className="text-foreground/60 mb-4">
                Start exploring buyers and save your favorites for easy access.
              </p>
              <Button onClick={() => router.push("/dashboard/seller/enquiries")}>
                Browse Buyers
              </Button>
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  )
}
