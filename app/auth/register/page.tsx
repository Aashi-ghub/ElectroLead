"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<"buyer" | "seller" | null>(null)

  const handleSelect = (type: "buyer" | "seller") => {
    setUserType(type)
    router.push(`/auth/register/${type}`)
  }

  return (
    <div className="min-h-screen bg-[var(--isabella)] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 rounded-[24px] overflow-hidden bg-[var(--surface-panel)] border border-border shadow-2xl min-h-[700px]">
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
                Join the Network
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
                Choose your <span className="text-primary">workspace.</span>
              </h1>
              <p className="text-primary-foreground/60 text-lg max-w-md leading-relaxed">
                Connect with verified industrial partners. Direct communication, transparency, and efficiency.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 text-sm text-primary-foreground/70">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px]">✓</div>
              Verified industrial ecosystem
            </div>
            <div className="flex items-center gap-3 text-sm text-primary-foreground/70">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px]">✓</div>
              Compliance-ready audit trails
            </div>
          </div>
        </div>

        {/* Right Side: Form/Selection */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-background">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.08em] text-foreground/60 mb-2">Getting Started</p>
            <h2 className="text-3xl font-bold">Pick your role</h2>
          </div>

          <div className="grid gap-4">
            <button
              onClick={() => handleSelect("buyer")}
              className="group text-left p-6 rounded-2xl border border-border hover:border-primary hover:bg-primary/5 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⚡</div>
                <div className="px-2 py-1 bg-muted rounded-md text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">Buyer</div>
              </div>
              <h3 className="text-xl font-bold mb-1">Procurement Workspace</h3>
              <p className="text-sm text-foreground/60">Post RFQs, manage supplier bids, and track orders in one dashboard.</p>
            </button>

            <button
              onClick={() => handleSelect("seller")}
              className="group text-left p-6 rounded-2xl border border-border hover:border-primary hover:bg-primary/5 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🏭</div>
                <div className="px-2 py-1 bg-muted rounded-md text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:bg-secondary/20 group-hover:text-secondary transition-colors">Seller</div>
              </div>
              <h3 className="text-xl font-bold mb-1">Supplier Workspace</h3>
              <p className="text-sm text-foreground/60">Receive qualified leads, submit quotes, and build your digital reputation.</p>
            </button>
          </div>

          <p className="text-center mt-10 text-foreground/60">
            Already have an account? {" "}
            <Link href="/auth/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>

  )
}
