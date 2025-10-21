"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X, LogOut, User, MessageSquare, Home } from "lucide-react"

function AppNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isAuthPage = pathname?.startsWith("/auth")

  if (isAuthPage) return null

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "mx-4 mt-4 rounded-full bg-white/95 backdrop-blur-md border border-border shadow-lg"
          : "w-full bg-white border-b border-border"
      }`}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isScrolled ? "px-6" : ""}`}>
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">EL</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline">ElectroLead</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {user ? (
              <>
                <Link
                  href="/"
                  className="text-sm text-foreground/70 hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Home size={16} />
                  Home
                </Link>
                <Link
                  href={user.role === "buyer" ? "/dashboard/buyer" : "/dashboard/seller"}
                  className="text-sm text-foreground/70 hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/messages"
                  className="text-sm text-foreground/70 hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <MessageSquare size={16} />
                  Messages
                </Link>
              </>
            ) : (
              <>
                <Link href="/" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                  Home
                </Link>
                <a href="#features" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="#pricing" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                  Pricing
                </a>
              </>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md bg-muted">
                  <User size={16} className="text-accent" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <button onClick={handleLogout} className="btn-outline flex items-center gap-2">
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="hidden md:flex gap-2">
                <Link href="/auth/login" className="btn-outline">
                  Login
                </Link>
                <Link href="/auth/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-md transition-colors"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            {user ? (
              <>
                <Link href="/" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors">
                  Home
                </Link>
                <Link
                  href={user.role === "buyer" ? "/dashboard/buyer" : "/dashboard/seller"}
                  className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                >
                  Dashboard
                </Link>
                <Link href="/messages" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors">
                  Messages
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors text-destructive"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors">
                  Home
                </Link>
                <a href="#features" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors">
                  Features
                </a>
                <a href="#pricing" className="block px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors">
                  Pricing
                </a>
                <div className="flex gap-2 px-4 pt-2">
                  <Link href="/auth/login" className="btn-outline flex-1 text-center">
                    Login
                  </Link>
                  <Link href="/auth/register" className="btn-primary flex-1 text-center">
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export { AppNavbar }
export default AppNavbar
