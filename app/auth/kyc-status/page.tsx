"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Clock, XCircle } from "lucide-react"

interface Document {
  id: string
  document_type: string
  file_url: string
  uploaded_at: string
}

interface ProfileData {
  user: { role: string; kyc_status: "pending" | "approved" | "rejected" }
  documents: Document[]
}

const DOCUMENT_LABELS: Record<string, string> = {
  gst_certificate: "GST Certificate",
  address_proof: "Address Proof",
}

export default function KYCStatusPage() {
  const router = useRouter()
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  const kycStatus = data?.user?.kyc_status ?? "pending"
  const documents = data?.documents ?? []

  const statusCopy = {
    pending: {
      icon: Clock,
      color: "text-accent",
      title: "Verification in Progress",
      body: "We're reviewing your documents. This usually takes 24-48 hours.",
    },
    approved: {
      icon: CheckCircle,
      color: "text-primary",
      title: "Verification Complete",
      body: "Your account is approved. You now have full access to the marketplace.",
    },
    rejected: {
      icon: XCircle,
      color: "text-destructive",
      title: "Verification Rejected",
      body: "Your documents could not be verified. Please contact support to resubmit.",
    },
  }[kycStatus]

  const StatusIcon = statusCopy.icon

  return (
    <div className="min-h-screen bg-[var(--isabella)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 sm:p-12 text-center border border-border rounded-[14px] bg-[var(--surface-panel)] shadow-none">
        <div className="mb-6">
          <StatusIcon className={`mx-auto mb-4 ${statusCopy.color}`} size={48} />
          <h1 className="text-2xl font-bold mb-2">{statusCopy.title}</h1>
          <p className="text-foreground/60">{statusCopy.body}</p>
        </div>

        <div className="space-y-3 mb-8 text-left">
          {documents.length === 0 ? (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Clock size={20} className="text-muted-foreground flex-shrink-0" />
              <span className="text-sm">No documents uploaded yet</span>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <CheckCircle size={20} className="text-primary flex-shrink-0" />
                <span className="text-sm">{DOCUMENT_LABELS[doc.document_type] || doc.document_type} • Uploaded</span>
              </div>
            ))
          )}
        </div>

        <p className="text-sm text-foreground/60 mb-8">
          You can still browse the platform while we verify your account.
        </p>

        <div className="flex flex-col gap-3">
          <Button onClick={() => router.push(data?.user?.role === "buyer" ? "/dashboard/buyer" : "/dashboard/seller")} className="px-6">
            Browse Marketplace
          </Button>
          <Button variant="outline" className="px-6 bg-transparent">
            Contact Support
          </Button>
        </div>
      </Card>
    </div>
  )
}
