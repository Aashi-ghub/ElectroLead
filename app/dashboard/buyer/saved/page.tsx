"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Search, Star, MapPin, Phone, Mail, Trash2 } from "lucide-react"

export default function SavedSuppliersPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null)
  const [savedSuppliers] = useState([
    {
      id: 1,
      name: "Elektra Components",
      category: "Cables & Wires",
      location: "Mumbai, Maharashtra",
      rating: 4.8,
      reviews: 156,
      phone: "+91 98765 43210",
      email: "contact@elektra.com",
      lastContact: "2 days ago",
      products: ["PVC Cables", "XLPE Cables", "Control Cables"],
      savedDate: "2024-01-15"
    },
    {
      id: 2,
      name: "Power Distributors",
      category: "Switchgear",
      location: "Chennai, Tamil Nadu", 
      rating: 4.6,
      reviews: 89,
      phone: "+91 87654 32109",
      email: "sales@powerdist.com",
      lastContact: "1 week ago",
      products: ["MCBs", "MCCBs", "Distribution Boards"],
      savedDate: "2024-01-10"
    },
    {
      id: 3,
      name: "Local Electro Mart",
      category: "Lighting",
      location: "Lucknow, Uttar Pradesh",
      rating: 4.4,
      reviews: 67,
      phone: "+91 76543 21098",
      email: "info@localelectro.com",
      lastContact: "3 days ago",
      products: ["LED Lights", "Street Lights", "Industrial Lights"],
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

  const handleRemoveSupplier = (supplierId: number) => {
    // In a real app, this would remove from saved list
    console.log("Removing supplier:", supplierId)
  }

  const handleContactSupplier = (supplier: any) => {
    // In a real app, this would open messaging
    console.log("Contacting supplier:", supplier.name)
  }

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
            <div>
              <h1 className="text-2xl font-bold">Saved Suppliers</h1>
              <p className="text-foreground/60">Manage your favorite suppliers</p>
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
                  placeholder="Search saved suppliers..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button variant="outline" className="px-4">
                Filter by Category
              </Button>
            </div>
          </div>

          {/* Suppliers List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedSuppliers.map((supplier) => (
              <Card key={supplier.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{supplier.name}</h3>
                      <p className="text-sm text-foreground/60">{supplier.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-500" size={16} />
                          <span className="text-sm font-medium">{supplier.rating}</span>
                          <span className="text-xs text-foreground/60">({supplier.reviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSupplier(supplier.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-foreground/60">
                    <MapPin size={16} />
                    <span>{supplier.location}</span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-foreground/60" />
                      <span>{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-foreground/60" />
                      <span>{supplier.email}</span>
                    </div>
                  </div>

                  {/* Products */}
                  <div>
                    <p className="text-sm font-medium mb-2">Products:</p>
                    <div className="flex flex-wrap gap-1">
                      {supplier.products.map((product, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-muted text-xs rounded-md"
                        >
                          {product}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Last Contact */}
                  <div className="text-xs text-foreground/60">
                    Last contact: {supplier.lastContact}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleContactSupplier(supplier)}
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
          {savedSuppliers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-foreground/40" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Saved Suppliers</h3>
              <p className="text-foreground/60 mb-4">
                Start exploring suppliers and save your favorites for easy access.
              </p>
              <Button onClick={() => router.push("/dashboard/seller/enquiries")}>
                Browse Suppliers
              </Button>
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  )
}
