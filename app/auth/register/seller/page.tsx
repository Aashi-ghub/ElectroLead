"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ArrowRight } from "lucide-react"

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
    <div className="min-h-screen bg-[var(--isabella)] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 rounded-[24px] overflow-hidden bg-[var(--surface-panel)] border border-border shadow-2xl">
        {/* Left Side: Brand/Info */}
        <div className="bg-[var(--jet-black)] text-primary-foreground p-8 sm:p-12 flex flex-col justify-between gap-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 mb-16">
              <div className="w-10 h-10 bg-primary rounded-[10px] flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">VoltSupply</span>
            </Link>

            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-primary-foreground/60 hover:text-primary-foreground mb-10 transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to roles
            </button>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-xs font-medium text-secondary uppercase tracking-wider">
                Seller Onboarding
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
                Create your <span className="text-secondary">Seller</span> workspace.
              </h1>
              <p className="text-primary-foreground/60 text-lg leading-relaxed max-w-md">
                Connect with industrial buyers, manage bids, and grow your digital reputation.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-widest text-primary-foreground/40 mb-1">Feature</p>
              <p className="font-semibold text-sm">Qualified Leads</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-widest text-primary-foreground/40 mb-1">Feature</p>
              <p className="font-semibold text-sm">Build Reputation</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 sm:p-12 lg:p-16 bg-background overflow-y-auto max-h-[90vh] scrollbar-hide">
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-2">Business Details</h2>
            <p className="text-sm text-foreground/60">Tell us about your company to start receiving leads</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80 ml-1">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter legal entity name"
                  className="w-full px-5 py-3 border border-border rounded-xl bg-input focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80 ml-1">Business Type</label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full px-5 py-3 border border-border rounded-xl bg-input focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all appearance-none"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="manufacturer">Manufacturer</option>
                    <option value="distributor">Distributor</option>
                    <option value="retailer">Retailer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80 ml-1">Year Established</label>
                  <input
                    type="number"
                    name="yearEstablished"
                    value={formData.yearEstablished}
                    onChange={handleChange}
                    placeholder="2020"
                    className="w-full px-5 py-3 border border-border rounded-xl bg-input focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80 ml-1">GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="27ABCDE1234F1Z5"
                  className="w-full px-5 py-3 border border-border rounded-xl bg-input focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
              </div>
            </div>

            <hr className="border-border" />

            <div className="space-y-4">
              <h2 className="text-xl font-bold">Product Categories</h2>
              <p className="text-sm text-foreground/60">Select the categories you supply</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <label
                    key={category}
                    className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
                      formData.categories.includes(category)
                        ? "border-secondary bg-secondary/5 ring-1 ring-secondary"
                        : "border-border hover:border-secondary/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="w-4 h-4 rounded border-border text-secondary focus:ring-secondary"
                    />
                    <span className="text-xs font-medium">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-secondary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-secondary/25">
              Continue to KYC <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>

  )
}
