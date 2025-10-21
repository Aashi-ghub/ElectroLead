"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle, Zap, Shield, Users, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

export default function Home() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 sm:pt-32 sm:pb-40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-semibold">
                  ✨ The Future of B2B Electrical Trading
                </div>
                <h1 className="text-5xl sm:text-6xl font-bold text-primary leading-tight">
                  Connect with Verified Electrical Suppliers
                </h1>
                <p className="text-lg text-foreground/60 leading-relaxed">
                  ElectroLead is the modern B2B marketplace connecting buyers and sellers of electrical products. Fast,
                  secure, and transparent.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {user ? (
                  <>
                    <Link
                      href={user.role === "buyer" ? "/dashboard/buyer" : "/dashboard/seller"}
                      className="btn-primary flex items-center justify-center gap-2"
                    >
                      Go to Dashboard <ArrowRight size={16} />
                    </Link>
                    <Link href="/messages" className="btn-outline flex items-center justify-center gap-2">
                      Messages
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/register" className="btn-primary flex items-center justify-center gap-2">
                      Get Started Free <ArrowRight size={16} />
                    </Link>
                    <Link href="/auth/login" className="btn-outline flex items-center justify-center gap-2">
                      Sign In
                    </Link>
                  </>
                )}
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-foreground/60">
                  <span className="font-semibold text-foreground">2,500+</span> suppliers already connected
                </p>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative h-96 sm:h-full min-h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl" />
              <div className="absolute inset-4 bg-white rounded-xl border border-border flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-accent/20 rounded-lg mx-auto flex items-center justify-center">
                    <Zap className="text-accent" size={32} />
                  </div>
                  <p className="text-sm text-foreground/60">Modern electrical marketplace</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-primary">Why Choose ElectroLead?</h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Everything you need to source electrical products efficiently and securely
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Verified Suppliers",
                description: "All suppliers are verified and KYC compliant for your peace of mind",
              },
              {
                icon: Zap,
                title: "Fast Quotations",
                description: "Get quotes from multiple suppliers in minutes, not days",
              },
              {
                icon: Users,
                title: "Direct Communication",
                description: "Chat directly with suppliers without intermediaries",
              },
              {
                icon: TrendingUp,
                title: "Real-time Analytics",
                description: "Track your orders and supplier performance in real-time",
              },
              {
                icon: CheckCircle,
                title: "Secure Transactions",
                description: "Bank-grade security for all your transactions",
              },
              {
                icon: Users,
                title: "24/7 Support",
                description: "Our team is always here to help you succeed",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 bg-white rounded-lg border border-border hover:border-accent transition-colors group"
              >
                <feature.icon className="w-8 h-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-foreground/60">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold">Ready to Transform Your Supply Chain?</h2>
            <p className="text-lg text-white/80">
              Join thousands of businesses already using ElectroLead to source electrical products efficiently
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <Link
                href={user.role === "buyer" ? "/dashboard/buyer" : "/dashboard/seller"}
                className="px-6 py-3 bg-accent text-accent-foreground rounded-md font-medium hover:bg-accent/90 transition-all inline-flex items-center justify-center gap-2"
              >
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="px-6 py-3 bg-accent text-accent-foreground rounded-md font-medium hover:bg-accent/90 transition-all inline-flex items-center justify-center gap-2"
                >
                  Start Free Trial <ArrowRight size={16} />
                </Link>
                <button className="px-6 py-3 border border-white/30 text-white rounded-md font-medium hover:bg-white/10 transition-all">
                  Schedule Demo
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground/5 border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EL</span>
                </div>
                <span className="font-bold">ElectroLead</span>
              </div>
              <p className="text-sm text-foreground/60">Connecting electrical suppliers and buyers worldwide</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-foreground/60">
            <p>&copy; 2025 ElectroLead. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
