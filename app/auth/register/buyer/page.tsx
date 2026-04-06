"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function BuyerRegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    companyName: "",
    businessType: "",
    gstNumber: "",
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    agreeTerms: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
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
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary uppercase tracking-wider">
                Buyer Onboarding
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
                Create your <span className="text-primary">Buyer</span> workspace.
              </h1>
              <p className="text-primary-foreground/60 text-lg leading-relaxed max-w-md">
                Unlock direct threads, consolidated RFQs, and verified supplier access.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-widest text-primary-foreground/40 mb-1">Feature</p>
              <p className="font-semibold text-sm">Post RFQs</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-widest text-primary-foreground/40 mb-1">Feature</p>
              <p className="font-semibold text-sm">Compare Bids</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 sm:p-12 lg:p-16 bg-background overflow-y-auto max-h-[90vh] scrollbar-hide">
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-2">Company Information</h2>
            <p className="text-sm text-foreground/60">Tell us about your business to get started</p>
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
                  className="w-full px-5 py-3 border border-border rounded-xl bg-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                    className="w-full px-5 py-3 border border-border rounded-xl bg-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="contractor">Contractor</option>
                    <option value="consultant">Consultant</option>
                    <option value="industry">Industry</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80 ml-1">GST Number</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    placeholder="27ABCDE1234F1Z5"
                    className="w-full px-5 py-3 border border-border rounded-xl bg-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div className="grid gap-6">
              <h2 className="text-xl font-bold">Contact Details</h2>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80 ml-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full px-5 py-3 border border-border rounded-xl bg-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80 ml-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full px-5 py-3 border border-border rounded-xl bg-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80 ml-1">Mobile</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-5 py-3 border border-border rounded-xl bg-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80 ml-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full px-5 py-3 border border-border rounded-xl bg-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                required
              />
              <label htmlFor="terms" className="text-xs text-foreground/60 leading-normal cursor-pointer">
                I agree to the <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            <button type="submit" className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25">
              Create Account <ArrowRight size={18} className="rotate-[-45deg]" />
            </button>
          </form>
        </div>
      </div>
    </div>

  )
}
