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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-semibold mb-4">
            ✨ Join ElectroLead
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-3">Choose Your Profile</h1>
          <p className="text-lg text-foreground/60">Get started in seconds</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Buyer Card */}
          <button
            onClick={() => handleSelect("buyer")}
            className="group relative p-8 bg-white border border-border rounded-lg hover:border-primary hover:shadow-lg transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">⚡</span>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-4">Buyer</h2>
              <ul className="space-y-3 text-sm text-foreground/70 mb-6">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                  Post Enquiries
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                  Get Quotes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                  Compare Offers
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                  Manage Projects
                </li>
              </ul>
              <button className="btn-primary w-full flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                Select <ArrowRight size={16} />
              </button>
            </div>
          </button>

          {/* Seller Card */}
          <button
            onClick={() => handleSelect("seller")}
            className="group relative p-8 bg-white border border-border rounded-lg hover:border-accent hover:shadow-lg transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🏭</span>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-4">Seller</h2>
              <ul className="space-y-3 text-sm text-foreground/70 mb-6">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                  Receive Leads
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                  Submit Quotes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                  Grow Business
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                  Build Network
                </li>
              </ul>
              <button className="btn-outline w-full flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                Select <ArrowRight size={16} />
              </button>
            </div>
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
