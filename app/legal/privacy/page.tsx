import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = { title: "Privacy Policy — VoltSupply" }

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--isabella)] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground mb-6"
        >
          <ArrowLeft size={15} />
          Back
        </Link>
        <div className="bg-card rounded-xl border border-border p-6 sm:p-8 space-y-4">
          <h1 className="text-2xl font-bold">Privacy Policy</h1>

          <h2 className="font-semibold pt-2">What we collect</h2>
          <p className="text-foreground/70 leading-relaxed">
            Your name, business name, email, phone, city and state. From suppliers, GST and PAN details and
            any documents uploaded for verification. From buyers, the requirements you post. From everyone,
            the quotes and messages you send through the platform.
          </p>

          <h2 className="font-semibold pt-2">Who can see it</h2>
          <p className="text-foreground/70 leading-relaxed">
            Your business name, city and category are shown to the counterparties you transact with.
            Contact details are shared with a supplier only once they have quoted on your requirement.
            Quote prices are visible only to the buyer who posted the requirement — suppliers never see
            each other&apos;s pricing. GST and PAN documents are visible only to our verification team.
          </p>

          <h2 className="font-semibold pt-2">What we do not do</h2>
          <p className="text-foreground/70 leading-relaxed">
            We do not sell your data, and we do not share contact details with suppliers who have not
            quoted on your requirement.
          </p>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-foreground/60">
              This is a summary and is not yet a final policy. To ask what we hold about you, or to have it
              deleted, email{" "}
              <a href="mailto:support@voltsupply.in" className="text-primary hover:underline">
                support@voltsupply.in
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
