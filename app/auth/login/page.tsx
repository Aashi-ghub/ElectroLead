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

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary uppercase tracking-wider">
                Industrial Control Room
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
                Sign in to your <span className="text-primary">control room.</span>
              </h1>
              <p className="text-primary-foreground/60 text-lg max-w-md leading-relaxed">
                The centralized hub for industrial procurement and verified supply chain operations.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-widest text-primary-foreground/40 mb-1">Standard</p>
              <p className="font-semibold text-sm">99.9% Uptime</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-widest text-primary-foreground/40 mb-1">Support</p>
              <p className="font-semibold text-sm">24/7 Priority</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-background">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold mb-3">Welcome Back</h2>
            <p className="text-foreground/60">Enter your credentials to access your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80 ml-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="w-full px-5 py-3.5 border border-border rounded-xl bg-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-foreground/80">Password</label>
                <Link href="#" className="text-xs font-semibold text-primary hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 border border-border rounded-xl bg-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 px-1">
              <input
                type="checkbox"
                id="remember"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-foreground/60 cursor-pointer select-none">
                Keep me signed in for 30 days
              </label>
            </div>

            <button type="submit" className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25">
              Access Control Room <ArrowRight size={18} />
            </button>
          </form>

          <p className="text-center mt-10 text-foreground/60">
            New to VoltSupply? {" "}
            <Link href="/auth/register" className="text-primary font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>

  )
}
