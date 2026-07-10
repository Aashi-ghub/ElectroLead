"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { useSession } from "@/hooks/use-session"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Profile {
  name: string
  phone: string | null
  city: string | null
  state: string | null
  company_name: string | null
  gst_number: string | null
  pan_number: string | null
}

export default function SettingsPage() {
  const { user, loading } = useSession()
  const [form, setForm] = useState<Profile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setForm(data?.user ?? null))
      .finally(() => setLoadingProfile(false))
  }, [])

  const handleChange = (field: keyof Profile, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleSave = async () => {
    if (!form) return
    setMessage(null)
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          company_name: form.company_name || undefined,
          gst_number: form.gst_number || undefined,
          pan_number: form.pan_number || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || data.errors?.[0]?.message || "Failed to save" })
        return
      }
      setMessage({ type: "success", text: "Profile updated." })
    } catch {
      setMessage({ type: "error", text: "Could not reach the server. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user) return null

  return (
    <DashboardLayout userRole={user.role as "buyer" | "seller" | "admin"} userName={user.name} userEmail={user.email}>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-1">Account Settings</h1>
        <p className="text-sm text-foreground/60 mb-6">Update your profile details.</p>

        {loadingProfile || !form ? (
          <p className="text-sm text-foreground/60">Loading...</p>
        ) : (
          <Card className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="text"
                value={form.phone ?? ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  value={form.city ?? ""}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {user.role === "seller" && (
                  <p className="text-xs text-foreground/50 mt-1">Changing this changes which enquiries you see.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <input
                  type="text"
                  value={form.state ?? ""}
                  onChange={(e) => handleChange("state", e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Company Name</label>
              <input
                type="text"
                value={form.company_name ?? ""}
                onChange={(e) => handleChange("company_name", e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">GST Number</label>
                <input
                  type="text"
                  value={form.gst_number ?? ""}
                  onChange={(e) => handleChange("gst_number", e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">PAN Number</label>
                <input
                  type="text"
                  value={form.pan_number ?? ""}
                  onChange={(e) => handleChange("pan_number", e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {message && (
              <div
                className={`px-4 py-3 rounded-lg text-sm ${
                  message.type === "success"
                    ? "bg-primary/10 border border-primary/20 text-primary"
                    : "bg-destructive/10 border border-destructive/30 text-destructive"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
