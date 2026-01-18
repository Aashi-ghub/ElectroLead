"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-[var(--isabella)] text-[var(--jet-black)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-semibold text-base text-primary-foreground">VoltSupply</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#features"
              className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors tracking-tight"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors tracking-tight"
            >
              Pricing
            </Link>
            <Link
              href="/#about"
              className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors tracking-tight"
            >
              About
            </Link>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="rounded-[6px] px-4 text-primary-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-[6px] px-4">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link href="/#features" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground">
              Features
            </Link>
            <Link href="/pricing" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground">
              Pricing
            </Link>
            <Link href="/#about" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground">
              About
            </Link>
            <div className="flex gap-2 pt-2">
              <Link href="/auth/login" className="flex-1">
                <Button variant="ghost" size="sm" className="w-full rounded-[6px] text-primary-foreground">
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
