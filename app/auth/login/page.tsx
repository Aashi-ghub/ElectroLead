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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-semibold mb-4">
            Welcome Back
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">Sign In</h1>
          <p className="text-foreground/60">Access your ElectroLead account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 rounded-lg border border-border">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all bg-input"
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
                className="w-full px-4 py-2.5 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all bg-input"
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
              Forgot Password?
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
  )
}
