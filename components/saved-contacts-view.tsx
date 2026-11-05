"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Phone, Mail, Trash2, BookmarkX, MessageSquare } from "lucide-react"

export interface SavedContact {
  id: string
  name: string
  company_name: string | null
  city: string | null
  state: string | null
  email: string
  phone: string | null
  kyc_status: "pending" | "approved" | "rejected" | null
  note: string | null
  saved_at: string
  deal_count: number
  last_interaction: string | null
}

export default function SavedContactsView({
  counterpartyLabel,
  emptyHint,
  messagesHref,
}: {
  /** "supplier"/"buyer" - singular, lowercase; used in copy only. */
  counterpartyLabel: string
  emptyHint: string
  /** Each role has its own messages page. */
  messagesHref: string
}) {
  const [contacts, setContacts] = useState<SavedContact[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/saved")
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to load saved contacts")
      setContacts(data.contacts ?? [])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load saved contacts")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleRemove = async (id: string) => {
    setRemoving(id)
    try {
      const res = await fetch(`/api/saved/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to remove contact")
      setContacts((prev) => prev.filter((c) => c.id !== id))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove contact")
    } finally {
      setRemoving(null)
    }
  }

  const term = query.trim().toLowerCase()
  const filtered = term
    ? contacts.filter((c) =>
        [c.name, c.company_name, c.city, c.state].some((v) => v?.toLowerCase().includes(term))
      )
    : contacts

  if (loading) return <p className="text-foreground/60">Loading saved {counterpartyLabel}s...</p>

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {contacts.length === 0 ? (
        <Card className="p-10 text-center">
          <BookmarkX className="mx-auto mb-4 text-foreground/30" size={40} />
          <h2 className="text-lg font-semibold mb-2">No saved {counterpartyLabel}s yet</h2>
          <p className="text-sm text-foreground/60 max-w-md mx-auto">{emptyHint}</p>
        </Card>
      ) : (
        <>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search saved ${counterpartyLabel}s...`}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-foreground/60">No saved {counterpartyLabel}s match "{query}".</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((contact) => (
                <Card key={contact.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg truncate">{contact.company_name || contact.name}</h3>
                        <p className="text-sm text-foreground/60 truncate">{contact.name}</p>
                        {contact.kyc_status === "approved" && (
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">
                            KYC verified
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={removing === contact.id}
                        onClick={() => handleRemove(contact.id)}
                        className="text-destructive hover:text-destructive shrink-0"
                        aria-label={`Remove ${contact.name}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>

                    <div className="space-y-2 text-sm text-foreground/70">
                      {(contact.city || contact.state) && (
                        <p className="flex items-center gap-2">
                          <MapPin size={14} className="shrink-0" />
                          <span className="truncate">
                            {[contact.city, contact.state].filter(Boolean).join(", ")}
                          </span>
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <Mail size={14} className="shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </p>
                      {contact.phone && (
                        <p className="flex items-center gap-2">
                          <Phone size={14} className="shrink-0" />
                          {contact.phone}
                        </p>
                      )}
                    </div>

                    {contact.note && (
                      <p className="text-xs text-foreground/60 border-l-2 border-border pl-3">{contact.note}</p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-xs text-foreground/50">
                        {contact.deal_count} quote{Number(contact.deal_count) === 1 ? "" : "s"} together
                      </span>
                      <Link href={messagesHref} className="text-xs text-primary flex items-center gap-1">
                        <MessageSquare size={12} />
                        Message
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
