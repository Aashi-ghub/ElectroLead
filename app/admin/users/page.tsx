"use client"

import { useEffect, useState } from "react"

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  city: string | null
  state: string | null
  company_name: string | null
  kyc_status: "pending" | "approved" | "rejected"
  is_active: boolean
  created_at: string
}

const KYC_BADGE: Record<string, string> = {
  pending: "bg-accent/10 text-accent",
  approved: "bg-primary/10 text-primary",
  rejected: "bg-destructive/10 text-destructive",
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState<string>("")
  const [actioningId, setActioningId] = useState<string | null>(null)

  const loadUsers = (role: string) => {
    setLoading(true)
    const query = role ? `?role=${role}` : ""
    fetch(`/api/admin/users${query}`)
      .then((res) => (res.ok ? res.json() : { users: [] }))
      .then((data) => setUsers(data.users ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers(roleFilter)
  }, [roleFilter])

  const toggleSuspend = async (user: AdminUser) => {
    setActioningId(user.id)
    const action = user.is_active ? "suspend" : "activate"
    try {
      const res = await fetch(`/api/admin/users/${user.id}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u)))
      }
    } finally {
      setActioningId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Users</h1>
          <p className="text-sm text-foreground/60">All registered buyers and sellers.</p>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-input text-sm"
        >
          <option value="">All roles</option>
          <option value="buyer">Buyers</option>
          <option value="seller">Sellers</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-foreground/60">Loading...</p>
      ) : (
        <div className="bg-[var(--surface-panel)] border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-foreground/60">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Location</th>
                <th className="p-4">KYC</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="p-4">{user.company_name || user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4 capitalize">{user.role}</td>
                  <td className="p-4">{[user.city, user.state].filter(Boolean).join(", ") || "-"}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${KYC_BADGE[user.kyc_status]}`}>
                      {user.kyc_status}
                    </span>
                  </td>
                  <td className="p-4">{user.is_active ? "Active" : "Suspended"}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleSuspend(user)}
                      disabled={actioningId === user.id}
                      className="btn-outline text-xs disabled:opacity-60"
                    >
                      {user.is_active ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="p-6 text-sm text-foreground/60">No users found.</p>}
        </div>
      )}
    </div>
  )
}
