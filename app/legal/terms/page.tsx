import Link from "next/link"
import { ArrowLeft } from "lucide-react"

// Placeholder with honest framing. The registration checkbox linked to "#",
// so anyone who did the responsible thing and clicked before agreeing got
// nothing. A page that says terms are not finalised is better than a dead
// link, and is replaced before taking real customers.
export const metadata = { title: "Terms of Service — VoltSupply" }

export default function TermsPage() {
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
          <h1 className="text-2xl font-bold">Terms of Service</h1>
          <p className="text-foreground/70 leading-relaxed">
            VoltSupply is a marketplace that connects buyers posting electrical-supply requirements with
            suppliers who quote on them. We are not party to any contract you enter with another member,
            and we do not handle payment, delivery or warranty for the goods quoted here.
          </p>
          <p className="text-foreground/70 leading-relaxed">
            Suppliers submit GST and PAN details for verification before they can quote. Verification
            confirms the documents were supplied and reviewed; it is not a guarantee of a supplier&apos;s
            performance, solvency or the quality of their goods. Buyers should carry out their own checks
            before awarding work.
          </p>
          <p className="text-foreground/70 leading-relaxed">
            Subscriptions give suppliers visibility of requirements in a geographic area. They do not
            guarantee any volume of enquiries, quotes or awarded work.
          </p>
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-foreground/60">
              These terms are a summary and are not yet final. A complete version reviewed by counsel will
              replace this page before VoltSupply accepts paying customers. Questions in the meantime:{" "}
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
