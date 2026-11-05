"use client"

import { useState } from "react"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SaveContactButton({
  contactId,
  initialSaved,
  label,
}: {
  contactId: string
  initialSaved: boolean
  /** e.g. "supplier" / "buyer" - shown as "Save supplier". */
  label: string
}) {
  const [saved, setSaved] = useState(initialSaved)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = async () => {
    setBusy(true)
    try {
      const res = saved
        ? await fetch(`/api/saved/${contactId}`, { method: "DELETE" })
        : await fetch("/api/saved", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contact_id: contactId }),
          })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || "Could not update saved contacts")
      setSaved(!saved)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update saved contacts")
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button size="sm" variant={saved ? "secondary" : "outline"} disabled={busy} onClick={toggle}>
        {saved ? <BookmarkCheck size={14} className="mr-1" /> : <Bookmark size={14} className="mr-1" />}
        {saved ? "Saved" : `Save ${label}`}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </span>
  )
}
