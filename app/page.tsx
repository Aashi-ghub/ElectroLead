"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  MapPin,
  Search,
  Star,
  TrendingUp,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import CategoryImage from "@/components/category-image"
import { CATEGORIES, categoryLabel, formatBudgetRange } from "@/lib/categories"

interface Summary {
  stats: {
    suppliers: number
    buyers: number
    supplier_cities: number
    open_enquiries: number
    quotes: number
    open_value: string
  }
  categories: { category: string; supplier_count: number }[]
  featured_suppliers: {
    company_name: string
    city: string | null
    state: string | null
    category: string | null
    rating: string | null
    review_count: number
    years_in_business: number | null
    response_hours: number | null
    kyc_status: string | null
  }[]
  recent_enquiries: {
    title: string
    city: string
    state: string | null
    category: string | null
    budget_min: string | null
    budget_max: string | null
    quote_deadline: string | null
    quote_count: number
  }[]
}

const crore = (value: string | number) => {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return null
  return n >= 10000000 ? `₹${(n / 10000000).toFixed(1)} Cr` : `₹${(n / 100000).toFixed(0)} L`
}

const daysLeft = (iso: string | null) => {
  if (!iso) return null
  const diff = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
  return diff > 0 ? diff : null
}

export default function Home() {
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => {
    // Render's free tier cold-starts, so this can take a while on first load.
    // Every number on the page is real or absent — nothing is invented while
    // waiting.
    fetch("/api/marketplace")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSummary(data))
      .catch(() => setSummary(null))
  }, [])

  const supplierCountFor = (key: string) =>
    summary?.categories.find((c) => c.category === key)?.supplier_count ?? null

  const stats = summary?.stats

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* ---------------------------------------------------------- hero */}
      <section className="bg-[var(--isabella)] border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center py-14 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[var(--reseda-green)] font-semibold mb-5">
              <span className="w-6 h-px bg-[var(--reseda-green)]" />
              B2B electrical supply · India
            </span>

            <h1 className="text-[40px] sm:text-[52px] font-semibold leading-[1.05] tracking-[-0.02em] text-[var(--jet-black)] mb-5">
              Post a requirement.
              <br />
              Get quotes from verified suppliers.
            </h1>

            <p className="text-lg text-[var(--jet-black)]/70 leading-relaxed mb-7 max-w-xl">
              Cable, switchgear, transformers, lighting and more — sourced from suppliers near your site,
              with GST-verified credentials and prices you can compare side by side.
            </p>

            {/* Search is the primary action on a marketplace, so it leads. */}
            <form
              action="/auth/register/buyer"
              className="flex flex-col sm:flex-row gap-2 mb-5 max-w-xl"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
                <input
                  name="q"
                  type="text"
                  placeholder="What do you need to source?"
                  aria-label="What do you need to source?"
                  className="w-full pl-11 pr-4 h-12 rounded-lg border border-border bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="h-12 px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                Post requirement
                <ArrowRight size={17} />
              </button>
            </form>

            <p className="text-sm text-foreground/55">
              Sourcing for your business?{" "}
              <Link href="/auth/register/buyer" className="text-primary font-medium hover:underline">
                Register as a buyer
              </Link>{" "}
              · Supplying?{" "}
              <Link href="/auth/register/seller" className="text-primary font-medium hover:underline">
                List your business
              </Link>
            </p>
          </div>

          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/scenes/hero.jpg"
              alt="Electrician working on a distribution panel"
              className="w-full h-[320px] lg:h-[440px] object-cover rounded-xl border border-border"
            />
            {stats && (
              <div className="absolute -bottom-6 left-4 right-4 lg:left-6 lg:right-6 bg-white rounded-xl border border-border shadow-sm grid grid-cols-3 divide-x divide-border">
                {[
                  { value: stats.suppliers, label: "Verified suppliers" },
                  { value: stats.supplier_cities, label: "Cities covered" },
                  { value: stats.open_enquiries, label: "Open requirements" },
                ].map((s) => (
                  <div key={s.label} className="px-3 py-4 text-center">
                    <p className="text-2xl font-semibold text-primary">{s.value}</p>
                    <p className="text-[11px] text-foreground/55 mt-0.5 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- categories */}
      <section id="categories" className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20 mt-6 scroll-mt-20">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.01em]">Browse by category</h2>
            <p className="text-foreground/60 mt-1.5">
              Every supplier is KYC-checked before they can quote.
            </p>
          </div>
          <Link
            href="/auth/register/buyer"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline whitespace-nowrap"
          >
            Post a requirement
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((category) => {
            const count = supplierCountFor(category.key)
            return (
              <Link
                key={category.key}
                href="/auth/register/buyer"
                className="group rounded-xl overflow-hidden border border-border bg-card hover:border-primary/60 hover:shadow-md transition-all"
              >
                <CategoryImage
                  categoryKey={category.key}
                  className="w-full h-32 sm:h-36 group-hover:scale-[1.03] transition-transform duration-300"
                />
                <div className="p-4">
                  <h3 className="font-medium leading-snug">{category.label}</h3>
                  <p className="text-xs text-foreground/55 mt-1 leading-snug">{category.blurb}</p>
                  {count !== null && (
                    <p className="text-xs text-[var(--reseda-green)] font-medium mt-2">
                      {count} supplier{count === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ------------------------------------------------ live enquiries */}
      {summary && summary.recent_enquiries.length > 0 && (
        <section className="bg-[var(--isabella)] border-y border-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-semibold tracking-[-0.01em]">Open right now</h2>
                <p className="text-foreground/60 mt-1.5">
                  Live requirements buyers have posted. Suppliers on a matching plan can quote today.
                </p>
              </div>
              {stats && crore(stats.open_value) && (
                <div className="hidden sm:block text-right">
                  <p className="text-2xl font-semibold text-primary">{crore(stats.open_value)}</p>
                  <p className="text-xs text-foreground/55">value open for quotes</p>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.recent_enquiries.map((enquiry, i) => {
                const left = daysLeft(enquiry.quote_deadline)
                return (
                  <article
                    key={`${enquiry.title}-${i}`}
                    className="bg-card rounded-xl border border-border overflow-hidden flex hover:border-primary/60 transition-colors"
                  >
                    <CategoryImage categoryKey={enquiry.category} className="w-24 shrink-0 h-auto" />
                    <div className="p-4 min-w-0 flex-1">
                      <p className="text-[11px] uppercase tracking-wide text-[var(--reseda-green)] font-semibold mb-1">
                        {categoryLabel(enquiry.category)}
                      </p>
                      <h3 className="font-medium text-sm leading-snug line-clamp-2 mb-2">{enquiry.title}</h3>
                      <p className="text-xs text-foreground/60 flex items-center gap-1 mb-1">
                        <MapPin size={12} className="shrink-0" />
                        {[enquiry.city, enquiry.state].filter(Boolean).join(", ")}
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        {formatBudgetRange(enquiry.budget_min, enquiry.budget_max)}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-foreground/55">
                        <span>{enquiry.quote_count} quote{enquiry.quote_count === 1 ? "" : "s"}</span>
                        {left && (
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {left}d left
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------- featured suppliers */}
      {summary && summary.featured_suppliers.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
          <h2 className="text-3xl font-semibold tracking-[-0.01em] mb-1.5">Top-rated suppliers</h2>
          <p className="text-foreground/60 mb-8">
            Suppliers with the strongest track record on the platform.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.featured_suppliers.map((supplier) => (
              <article
                key={supplier.company_name}
                className="bg-card rounded-xl border border-border p-5 hover:border-primary/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold leading-snug">{supplier.company_name}</h3>
                  {supplier.kyc_status === "approved" && (
                    <span
                      title="KYC verified"
                      className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--reseda-green)] bg-[var(--reseda-green)]/10 px-2 py-1 rounded-full"
                    >
                      <BadgeCheck size={12} />
                      Verified
                    </span>
                  )}
                </div>

                <p className="text-xs text-foreground/55 mb-3">{categoryLabel(supplier.category)}</p>

                <div className="flex items-center gap-1.5 mb-3">
                  <Star size={15} className="text-primary fill-primary" />
                  <span className="font-semibold text-sm">{Number(supplier.rating).toFixed(1)}</span>
                  <span className="text-xs text-foreground/50">({supplier.review_count} reviews)</span>
                </div>

                <dl className="text-xs text-foreground/65 space-y-1.5 pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="shrink-0 text-foreground/40" />
                    <dd>{[supplier.city, supplier.state].filter(Boolean).join(", ")}</dd>
                  </div>
                  {supplier.years_in_business && (
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={12} className="shrink-0 text-foreground/40" />
                      <dd>{supplier.years_in_business} years in business</dd>
                    </div>
                  )}
                  {supplier.response_hours && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="shrink-0 text-foreground/40" />
                      <dd>Typically replies in {supplier.response_hours}h</dd>
                    </div>
                  )}
                </dl>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* -------------------------------------------------- how it works */}
      <section id="how-it-works" className="bg-[var(--isabella)] border-y border-border scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
          <h2 className="text-3xl font-semibold tracking-[-0.01em] mb-10">How it works</h2>
          <ol className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Post what you need",
                body: "Specification, quantity, delivery location and budget. Takes about two minutes.",
              },
              {
                title: "Suppliers near you quote",
                body: "Only KYC-verified suppliers whose plan covers your location can see and quote on it.",
              },
              {
                title: "Compare and award",
                body: "Price, lead time, warranty and terms side by side. Message the supplier, then award.",
              },
            ].map((step, i) => (
              <li key={step.title}>
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground font-semibold text-sm mb-4">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-foreground/65 leading-relaxed text-[15px]">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------- supplier band */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/scenes/warehouse.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[var(--jet-black)]/85" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20 text-primary-foreground">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.01em] mb-4">
              Selling electrical supply? Get the leads near you.
            </h2>
            <p className="text-primary-foreground/75 text-lg leading-relaxed mb-7">
              List free and quote on requirements in your city. Upgrade to cover your whole state, or
              all of India, and reach every buyer posting on the platform.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/register/seller"
                className="h-12 px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                List your business free
                <ArrowRight size={17} />
              </Link>
              <Link
                href="/pricing"
                className="h-12 px-6 rounded-lg border border-primary-foreground/30 text-primary-foreground font-medium hover:bg-white/10 transition-colors inline-flex items-center"
              >
                See plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- footer */}
      <footer className="bg-[var(--jet-black)] text-primary-foreground/70">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>
            <span className="font-semibold text-primary-foreground">VoltSupply</span> — B2B electrical
            procurement, India
          </p>
          <nav className="flex items-center gap-6">
            <Link href="/pricing" className="hover:text-primary-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/auth/login" className="hover:text-primary-foreground transition-colors">
              Sign in
            </Link>
            <Link href="/auth/register" className="hover:text-primary-foreground transition-colors">
              Register
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  )
}
