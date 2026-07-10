"use client"

import { useEffect, useState } from "react"

export interface SessionUser {
  id: string
  email: string
  name: string
  role: "buyer" | "seller" | "admin"
  city?: string
  state?: string
  company_name?: string
  kyc_status?: "pending" | "approved" | "rejected"
}

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) setUser(data?.user ?? null)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { user, loading }
}
