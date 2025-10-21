"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function SellerRegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    companyName: "",
    businessType: "",
    yearEstablished: "",
    gstNumber: "",
    categories: [] as string[],
  })

  const categories = [
    "Cables & Wires",
    "Switchgear",
    "Transformers",
    "Lighting",
    "Motors",
    "Solar Products",
    "Wiring Devices",
    "Conduits",
    "Circuit Protection",
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/auth/kyc")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 sm:p-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-foreground/60 hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Seller Account</h1>
          <p className="text-foreground/60">Set up your business profile to start receiving leads</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Business Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Business Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Business Type</label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="manufacturer">Manufacturer</option>
                    <option value="distributor">Distributor</option>
                    <option value="retailer">Retailer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Year Established</label>
                  <input
                    type="number"
                    name="yearEstablished"
                    value={formData.yearEstablished}
                    onChange={handleChange}
                    placeholder="2020"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="27ABCDE1234F1Z5"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Product Categories */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Product Categories</h2>
            <p className="text-sm text-foreground/60">Select all that apply</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-primary/5 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.back()} className="flex-1">
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Continue to KYC
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
