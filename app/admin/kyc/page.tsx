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
  gst_number: string | null
  pan_number: string | null
  kyc_status: "pending" | "approved" | "rejected"
  created_at: string
}

interface UserDocument {
  id: string
  document_type: string
  file_url: string
  uploaded_at: string
}

export default function AdminKycPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [documents, setDocuments] = useState<UserDocument[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = () => {
    setLoading(true)
    fetch("/api/admin/users")
      .then((res) => (res.ok ? res.json() : { users: [] }))
      .then((data) => setUsers((data.users ?? []).filter((u: AdminUser) => u.kyc_status === "pending")))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const toggleDocuments = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    setDocsLoading(true)
    setDocuments([])
    const res = await fetch(`/api/admin/users/${id}/documents`)
    const data = await res.json().catch(() => ({ documents: [] }))
    setDocuments(data.documents ?? [])
    setDocsLoading(false)
  }

  const handleDecision = async (id: string, action: "approve" | "reject") => {
    setError(null)
    setActioningId(id)
    try {
      const res = await fetch(`/api/admin/users/${id}/approve-kyc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Action failed")
      }
      setUsers((prev) => prev.filter((u) => u.id !== id))
      if (expandedId === id) setExpandedId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed")
    } finally {
      setActioningId(null)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Pending KYC</h1>
      <p className="text-sm text-foreground/60 mb-6">Review uploaded documents and approve or reject each account.</p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-foreground/60">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-foreground/60">No pending KYC reviews.</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="bg-[var(--surface-panel)] border border-border rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{user.company_name || user.name}</h3>
                  <p className="text-sm text-foreground/60">
                    {user.name} • {user.email} • {user.role}
                  </p>
                  <p className="text-sm text-foreground/60">
                    {user.city ?? "-"}, {user.state ?? "-"}
                  </p>
                  <p className="text-sm text-foreground/60">
                    GST: {user.gst_number ?? "not provided"} • PAN: {user.pan_number ?? "not provided"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleDocuments(user.id)}
                    className="btn-outline text-sm"
                  >
                    {expandedId === user.id ? "Hide Documents" : "View Documents"}
                  </button>
                  <button
                    onClick={() => handleDecision(user.id, "approve")}
                    disabled={actioningId === user.id}
                    className="btn-primary text-sm disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecision(user.id, "reject")}
                    disabled={actioningId === user.id}
                    className="btn-outline text-sm text-destructive disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </div>

              {expandedId === user.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  {docsLoading ? (
                    <p className="text-sm text-foreground/60">Loading documents...</p>
                  ) : documents.length === 0 ? (
                    <p className="text-sm text-foreground/60">No documents uploaded.</p>
                  ) : (
                    <ul className="space-y-2">
                      {documents.map((doc) => (
                        <li key={doc.id} className="text-sm">
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {doc.document_type}
                          </a>
                          <span className="text-foreground/50"> • uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
