"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const role = formData.email.includes("buyer") ? "buyer" : "seller"
    localStorage.setItem("user", JSON.stringify({ name: "User", role }))
    router.push(role === "buyer" ? "/dashboard/buyer" : "/dashboard/seller")
  }

  return (
    <div className="min-h-screen bg-[var(--isabella)]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-[1.1fr,1fr] min-h-screen items-center px-4 sm:px-8 py-12 gap-6">
        <div className="bg-[var(--jet-black)] text-primary-foreground rounded-[12px] md:rounded-[16px] p-8 sm:p-12 flex flex-col gap-12 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-[8px] border border-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm tracking-tight">EL</span>
            </div>
            <p className="text-sm uppercase tracking-[0.12em] text-primary-foreground/70">Access Control</p>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight">Sign in to your control room.</h1>
            <p className="text-primary-foreground/70 text-base max-w-xl">
              Built for industrial buyers and suppliers. Direct threads, quote trails, and compliance-ready records in
              one place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-primary-foreground/80">
            <div className="border border-white/10 rounded-[10px] p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-primary-foreground/50 mb-1">Availability</p>
              <p className="font-medium">99.9% uptime</p>
            </div>
            <div className="border border-white/10 rounded-[10px] p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-primary-foreground/50 mb-1">Response speed</p>
              <p className="font-medium">≈2h supplier avg</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface-panel)] border border-border rounded-[12px] md:rounded-[16px] p-6 sm:p-8 shadow-none">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.08em] text-foreground/60">Welcome back</p>
            <h2 className="text-3xl font-semibold mt-2">Sign in</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-border rounded-[8px] bg-input focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-border rounded-[8px] bg-input focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-border cursor-pointer"
                />
                <span className="text-sm text-foreground/70">Remember me</span>
              </label>
              <Link href="#" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              Sign In <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-center text-foreground/60 mt-6">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Join Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
