"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, Search, X } from "lucide-react"
import { useEffect, useState } from "react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const terms = ["cables", "switches", "MCBs", "panels", "relays", "drives", "lighting", "tools", "PPE"]
  const [termIndex, setTermIndex] = useState(0)
  const [displayTerm, setDisplayTerm] = useState("")
  const [phase, setPhase] = useState<"typing" | "pause" | "deleting">("typing")
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    const current = terms[termIndex]

    if (phase === "typing") {
      if (charIndex < current.length) {
        const t = setTimeout(() => {
          setDisplayTerm(current.slice(0, charIndex + 1))
          setCharIndex((c) => c + 1)
        }, 55)
        return () => clearTimeout(t)
      }
      const pauseTimer = setTimeout(() => setPhase("pause"), 900)
      return () => clearTimeout(pauseTimer)
    }

    if (phase === "pause") {
      const pauseTimer = setTimeout(() => setPhase("deleting"), 500)
      return () => clearTimeout(pauseTimer)
    }

    if (phase === "deleting") {
      if (charIndex > 0) {
        const t = setTimeout(() => {
          setDisplayTerm(current.slice(0, charIndex - 1))
          setCharIndex((c) => c - 1)
        }, 45)
        return () => clearTimeout(t)
      }
      setTermIndex((i) => (i + 1) % terms.length)
      setPhase("typing")
    }
  }, [charIndex, phase, termIndex, terms])

  const placeholderText = `Search for ${displayTerm}`

  const navLinks = [
    { label: "Categories", href: "#categories" },
    { label: "About", href: "#about" },
    { label: "Pricing", href: "/pricing" },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-[var(--isabella)]/95 backdrop-blur border-b border-border text-[var(--jet-black)]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center gap-4 h-16">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight">VoltSupply</span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center flex-1">
            <div className="relative w-[260px] sm:w-[340px] lg:w-[420px] xl:w-[460px] ml-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--jet-black)]/50" size={18} />
              <input
                type="search"
                placeholder={placeholderText}
                className="w-full h-11 pl-11 pr-4 rounded-full bg-white border border-border text-sm text-[var(--jet-black)] placeholder:text-[var(--jet-black)]/50 shadow-[0_6px_20px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-[var(--reseda-green)] hover:text-[var(--reseda-green)] transition-colors tracking-tight"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <Link href="/auth/login?role=seller">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full px-4 text-[var(--reseda-green)] hover:bg-transparent underline-animate"
              >
                Register as Seller
              </Button>
            </Link>
            <Link href="/auth/login?role=buyer">
              <Button size="sm" className="rounded-full px-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                Post Enquiry
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden ml-auto inline-flex items-center justify-center h-10 w-10 rounded-full bg-white border border-border"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-4 border-t border-border pt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--jet-black)]/50" size={18} />
              <input
                type="search"
                placeholder={placeholderText}
                className="w-full h-11 pl-11 pr-4 rounded-full bg-white border border-border text-sm text-[var(--jet-black)] placeholder:text-[var(--jet-black)]/50"
              />
            </div>

            <div className="space-y-2">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-sm text-[var(--reseda-green)] hover:text-[var(--reseda-green)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Link href="/auth/login?role=seller" className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full rounded-full text-[var(--reseda-green)] hover:bg-transparent underline-animate"
                >
                  Register as Seller
                </Button>
              </Link>
              <Link href="/auth/login?role=buyer" className="flex-1">
                <Button size="sm" className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Post Enquiry
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
