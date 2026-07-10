"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

const NAV_ITEMS = [
  { label: "Pending KYC", href: "/admin/kyc" },
  { label: "Users", href: "/admin/users" },
  { label: "Subscriptions", href: "/admin/subscriptions" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-[var(--isabella)]">
      <div className="bg-[var(--jet-black)] text-primary-foreground px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="text-lg font-semibold tracking-tight">VoltSupply Admin</span>
          <nav className="flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm ${
                  pathname.startsWith(item.href)
                    ? "text-primary font-medium"
                    : "text-primary-foreground/70 hover:text-primary-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <button onClick={handleLogout} className="text-sm text-primary-foreground/70 hover:text-primary-foreground">
          Logout
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}
