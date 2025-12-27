"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Clock } from "lucide-react"

export default function KYCStatusPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[var(--isabella)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 sm:p-12 text-center border border-border rounded-[14px] bg-[var(--surface-panel)] shadow-none">
        <div className="mb-6">
          <Clock className="mx-auto mb-4 text-accent" size={48} />
          <h1 className="text-2xl font-bold mb-2">Verification in Progress</h1>
          <p className="text-foreground/60">We're reviewing your documents. This usually takes 24-48 hours.</p>
        </div>

        <div className="space-y-3 mb-8 text-left">
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
            <CheckCircle size={20} className="text-primary flex-shrink-0" />
            <span className="text-sm">PAN Verification • Completed</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
            <CheckCircle size={20} className="text-primary flex-shrink-0" />
            <span className="text-sm">GST Verification • Completed</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-accent/5 rounded-lg">
            <Clock size={20} className="text-accent flex-shrink-0" />
            <span className="text-sm">Business Address • Under Review</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Clock size={20} className="text-muted-foreground flex-shrink-0" />
            <span className="text-sm">Bank Details • Pending</span>
          </div>
        </div>

        <p className="text-sm text-foreground/60 mb-8">
          You can still browse the platform while we verify your account.
        </p>

        <div className="flex flex-col gap-3">
          <Button onClick={() => router.push("/dashboard/buyer")} className="px-6">
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
