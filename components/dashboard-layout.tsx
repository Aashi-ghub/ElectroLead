"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  Menu,
  X,
  Inbox,
  FileText,
  Plus,
  MessageSquare,
  Bookmark,
  Settings,
  LogOut,
  User,
  Home,
  Send,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: "buyer" | "seller"
  userName: string
  userEmail: string
}

export default function DashboardLayout({ children, userRole, userName, userEmail }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/auth/login")
  }

  const buyerMenuItems = [
    { label: "Dashboard", href: "/dashboard/buyer", icon: Home },
    { label: "My Enquiries", href: "/dashboard/buyer/enquiries", icon: FileText },
    { label: "Create Enquiry", href: "/dashboard/buyer/create-enquiry", icon: Plus },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Saved Suppliers", href: "/dashboard/buyer/saved", icon: Bookmark },
  ]

  const sellerMenuItems = [
    { label: "Dashboard", href: "/dashboard/seller", icon: Home },
    { label: "Available Leads", href: "/dashboard/seller/enquiries", icon: Inbox },
    { label: "My Quotes", href: "/dashboard/seller/quotes", icon: Send },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Saved Buyers", href: "/dashboard/seller/saved", icon: Bookmark },
  ]

  const menuItems = userRole === "buyer" ? buyerMenuItems : sellerMenuItems

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-primary to-primary/90 text-white transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">ElectroLead</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active ? "bg-white/20 text-white font-medium" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="border-t border-white/10"></div>

        {/* User Profile Section */}
        <div className="p-4 space-y-3">
          {/* Settings */}
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <Settings size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Settings</span>}
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all text-left"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>

          {/* User Profile Card */}
          {sidebarOpen && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <User size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{userName}</p>
                  <p className="text-xs text-white/60 truncate">{userEmail}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">
              {userRole === "buyer" ? "Buyer Dashboard" : "Supplier Dashboard"}
            </h2>
            <p className="text-sm text-foreground/60">Welcome back, {userName}!</p>
          </div>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Menu size={20} className="text-primary" />
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
