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
    <div className="min-h-screen bg-[var(--isabella)] px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
      <div className="w-full max-w-5xl bg-[var(--surface-panel)] border border-border rounded-[16px] p-8 sm:p-12 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.08em] text-foreground/60">Create your role</p>
            <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.05]">Choose how you work on VoltSupply.</h1>
            <p className="text-base text-foreground/70 max-w-2xl">
              Built for electrical procurement teams and suppliers. Pick the workspace that matches how you do business.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <span className="h-5 w-1 bg-primary rounded-full" />
            Verified onboarding with KYC controls.
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Buyer Card */}
          <button
            onClick={() => handleSelect("buyer")}
            className="group relative text-left border border-border rounded-[12px] p-6 sm:p-8 bg-background hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 border border-primary/30 rounded-[10px] flex items-center justify-center text-primary text-xl">
                ⚡
              </div>
              <span className="text-xs uppercase tracking-[0.08em] text-foreground/60">Procurement</span>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Buyer workspace</h2>
            <ul className="space-y-3 text-sm text-foreground/70 mb-6">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Post enquiries with specs
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Compare verified supplier quotes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Track approvals and delivery
              </li>
            </ul>
            <button className="btn-primary w-full flex items-center justify-center gap-2">
              Select Buyer <ArrowRight size={16} />
            </button>
          </button>

          {/* Seller Card */}
          <button
            onClick={() => handleSelect("seller")}
            className="group relative text-left border border-border rounded-[12px] p-6 sm:p-8 bg-background hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-secondary text-primary-foreground border border-border rounded-[10px] flex items-center justify-center text-lg">
                🏭
              </div>
              <span className="text-xs uppercase tracking-[0.08em] text-foreground/60">Supply</span>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Seller workspace</h2>
            <ul className="space-y-3 text-sm text-foreground/70 mb-6">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Receive qualified leads
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Submit quotes with delivery terms
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Build reputation with on-time jobs
              </li>
            </ul>
            <button className="btn-outline w-full flex items-center justify-center gap-2">
              Select Seller <ArrowRight size={16} />
            </button>
          </button>
        </div>

        <div className="text-center">
          <p className="text-foreground/60">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
