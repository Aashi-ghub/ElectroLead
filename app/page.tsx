"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle, Zap, Shield, Users, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"

export default function Home() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      {/* Hero Section */}
      <section className="bg-[var(--isabella)] text-[var(--jet-black)] border-b border-border">
        <div className="max-w-5xl mx-auto px-6 sm:px-20 lg:px-24 pt-16 pb-16">
          <span className="block text-[12px] sm:text-[13px] uppercase tracking-[0.12em] text-[var(--reseda-green)] mb-5">
            B2B ELECTRICAL SUPPLY NETWORK · INDIA
          </span>
          <h1 className="text-[56px] sm:text-[60px] lg:text-[64px] font-semibold leading-[1.06] tracking-[-0.02em] text-[var(--jet-black)] max-w-4xl mb-5">
            Trade with trust. Delivered with speed.
          </h1>
          <h2 className="text-xl sm:text-2xl text-[var(--jet-black)]/80 leading-relaxed max-w-4xl mb-5">
            A verified B2B platform connecting buyers with trusted electrical suppliers, manufacturers, and distributors
            across India.
          </h2>
          <p className="text-sm text-[var(--jet-black)]/60 max-w-3xl">
            Active suppliers in Mumbai · Delhi · Bengaluru · Pune · Chennai · Ahmedabad
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            {user ? (
              <Link
                href={user.role === "buyer" ? "/dashboard/buyer" : "/dashboard/seller"}
                className="btn-primary flex items-center justify-center gap-2"
              >
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link href="/auth/register" className="btn-primary flex items-center justify-center gap-2">
                  Start Sourcing <ArrowRight size={16} />
                </Link>
                <Link
                  href="/auth/login"
                  className="btn-outline flex items-center justify-center gap-2 text-[var(--jet-black)]"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 border-b border-border bg-[var(--isabella)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-[1fr,1.2fr] gap-12">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.08em] text-foreground/70">Platform backbone</p>
            <h2 className="text-4xl font-semibold leading-tight">Infrastructure for electrical procurement.</h2>
            <p className="text-base text-foreground/70">
              No glossy SaaS gimmicks. Just the control, traceability, and speed industrial teams need to move material.
            </p>
            <div className="flex gap-3">
              <div className="h-10 w-1 bg-[var(--reseda-green)] rounded-full" />
              <div className="space-y-2 text-sm text-foreground/70">
                <p>Real supplier IDs, compliance status, and delivery cadences surfaced up front.</p>
                <p>Messaging, quotes, and approvals stay tied to each enquiry thread.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: Shield,
                title: "Verified partners only",
                body: "KYC, GST, and performance history baked into every supplier profile.",
              },
              {
                icon: Zap,
                title: "Quote-ready in minutes",
                body: "Structured enquiries keep specs clear so suppliers can respond without back-and-forth.",
              },
              {
                icon: Users,
                title: "Direct, auditable comms",
                body: "Role-based messaging with decision trails for procurement, engineering, and finance.",
              },
              {
                icon: TrendingUp,
                title: "Operations signals",
                body: "Response speed, win rates, and delivery reliability surfaced for your shortlists.",
              },
              {
                icon: CheckCircle,
                title: "Secure transactions",
                body: "Controlled access, secure uploads, and export-safe data boundaries.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex gap-4 border border-border rounded-[10px] p-5 bg-card hover:border-primary/50 transition-colors"
              >
                <div className="mt-1">
                  <feature.icon className="text-[var(--reseda-green)]" size={22} />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-lg">{feature.title}</p>
                  <p className="text-sm text-foreground/70">{feature.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-[var(--jet-black)] text-primary-foreground border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-[1.2fr,1fr] gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-4xl font-semibold leading-tight">Move bids, quotes, and deliveries in one rail.</h2>
            <p className="text-base text-primary-foreground/75">
              Keep every enquiry, quote, and supplier conversation aligned. No detours. No shadow threads. Built for
              electrical buyers, sellers, and ops teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {user ? (
                <Link
                  href={user.role === "buyer" ? "/dashboard/buyer" : "/dashboard/seller"}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  Go to Dashboard <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link href="/auth/register" className="btn-primary flex items-center justify-center gap-2">
                    Start Now <ArrowRight size={16} />
                  </Link>
                  <button className="btn-outline text-primary-foreground border-white/30 hover:bg-white/10">
                    Talk to our team
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="border border-[var(--reseda-green)]/60 rounded-[10px] p-6 bg-[var(--reseda-green)]/15 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.08em] text-primary-foreground/60">Operational proof</p>
              <span className="text-xs px-2 py-1 rounded-[6px] bg-primary text-primary-foreground">Live</span>
            </div>
            <div className="space-y-3 text-sm text-primary-foreground/80">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span>Quote cycle time</span>
                <strong className="text-base">-36%</strong>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span>Supplier response</span>
                <strong className="text-base">2h avg</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>On-time deliveries</span>
                <strong className="text-base">94%</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-[6px] border border-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm tracking-tight">VS</span>
              </div>
              <div>
                <p className="font-semibold">VoltSupply</p>
                <p className="text-sm text-foreground/60">Industrial electrical supply network</p>
              </div>
            </div>
            <div className="flex gap-10 text-sm text-foreground/70">
              <a href="#features" className="hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="/auth/login" className="hover:text-foreground transition-colors">
                Sign In
              </a>
              <a href="/auth/register" className="hover:text-foreground transition-colors">
                Register
              </a>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-sm text-foreground/60">
            <p>&copy; 2025 VoltSupply. Built for industrial procurement.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
