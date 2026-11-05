"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

// Destinations that actually exist. These previously pointed at /#features and
// /#about, which no section on the page defined, and were styled
// text-primary-foreground (cream) on the cream header - invisible until hover.
const LINKS = [
  { href: "/#categories", label: "Categories" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-[var(--isabella)] text-[var(--jet-black)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 border-b border-border">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="font-semibold text-base text-[var(--jet-black)]">VoltSupply</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--jet-black)]/70 hover:text-[var(--jet-black)] transition-colors tracking-tight"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="rounded-[6px] px-4 text-[var(--jet-black)]">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-[6px] px-4">
                Get Started
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden text-[var(--jet-black)]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-3">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-sm text-[var(--jet-black)]/70 hover:text-[var(--jet-black)]"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <Link href="/auth/login" className="flex-1">
                <Button variant="ghost" size="sm" className="w-full rounded-[6px] text-[var(--jet-black)]">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register" className="flex-1">
                <Button size="sm" className="w-full bg-primary hover:bg-primary/90 rounded-[6px]">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
