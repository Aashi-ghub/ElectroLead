"use client"

import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle,
  CircuitBoard,
  Cog,
  Lightbulb,
  Lock,
  MapPin,
  Package,
  PhoneCall,
  Plug,
  Server,
  ShieldCheck,
  Truck,
  Wrench,
  Zap,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"

const categories = [
  {
    name: "Cables",
    icon: Plug,
    detail: "Copper, aluminium, HT/LT runs",
    image:
      "https://images.unsplash.com/photo-1582719478248-74b2f79c2a1e?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Switchgear",
    icon: Zap,
    detail: "Breakers, relays, control",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Lighting",
    icon: Lightbulb,
    detail: "Industrial, emergency, LED",
    image: "https://images.unsplash.com/photo-1505740106531-4243f3831c78?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Motors",
    icon: Cog,
    detail: "AC/DC drives, starters",
    image: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "MCBs",
    icon: CircuitBoard,
    detail: "Miniature & molded case",
    image: "https://images.unsplash.com/photo-1582719478239-36cb1c260507?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Tools",
    icon: Wrench,
    detail: "Testing, crimping, safety",
    image: "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Panels",
    icon: Server,
    detail: "Control, PCC, MCC, custom",
    image: "https://images.unsplash.com/photo-1582719478241-6cfe10a36c9e?auto=format&fit=crop&w=900&q=80",
  },
]
const marqueeCategories = [...categories, ...categories]

const trustRow = [
  { title: "Verified Sellers Only", icon: ShieldCheck, desc: "KYC + GST verified, on-time record." },
  { title: "Logistics Support", icon: Truck, desc: "Freight visibility with lane-ready partners." },
  { title: "Bulk Deals & MOQ", icon: Package, desc: "Volume-friendly quotes and negotiated MOQs." },
  { title: "Secure Payments", icon: Lock, desc: "Escrow-aligned, audit-ready transactions." },
  { title: "Account Manager", icon: PhoneCall, desc: "Human support for specs, sourcing, and follow-ups." },
]

const featuredEnquiries = [
  {
    title: "10 sqmm Copper Cable",
    location: "Pune • Buyer enquiry",
    volume: "3.5 km run",
    urgency: "Needed in 48h",
    tag: "Cables",
  },
  {
    title: "100 MCBs, 10kA",
    location: "Ahmedabad • Supplier ready",
    volume: "Schneider/ABB",
    urgency: "Quotes by today",
    tag: "MCBs",
  },
  {
    title: "HT Panel Retrofit",
    location: "Bengaluru • Industrial plant",
    volume: "Panel + relays",
    urgency: "Site visit requested",
    tag: "Panels",
  },
  {
    title: "LED High-bay Lights",
    location: "Nagpur • Warehouse",
    volume: "280 units",
    urgency: "Dispatch this week",
    tag: "Lighting",
  },
]

const testimonials = [
  {
    quote: "We closed two urgent tenders in a week—specs were clean, suppliers were ready.",
    name: "Amit K.",
    role: "Procurement Lead, Pune",
  },
  {
    quote: "VoltSupply cut our quote cycles by days. The vetted seller pool is the edge.",
    name: "Ritika S.",
    role: "Category Manager, Bengaluru",
  },
  {
    quote: "As a supplier, the enquiries are precise. Less back-and-forth, faster PO wins.",
    name: "Prakash M.",
    role: "Supplier, Ahmedabad",
  },
]

const seoLocations = ["Pune", "Mumbai", "Delhi", "Bengaluru", "Chennai", "Hyderabad", "Ahmedabad", "Surat"]
const seoCategories = ["Cables", "Switchgear", "Lighting", "Motors", "MCBs", "Tools", "Panels", "Transformers"]

export default function Home() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  return (
    <main className="min-h-screen bg-[var(--isabella)] text-[var(--jet-black)]">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-[var(--isabella)]" id="top">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 grid gap-10 md:grid-cols-[1.05fr,0.95fr]">
          <div className="relative z-10 space-y-6">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--reseda-green)]">
              India • Electrical Supply • B2B
            </span>
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-semibold leading-[1.05] tracking-[-0.02em] max-w-3xl">
                India’s Trusted B2B Marketplace for Electrical Supply
              </h1>
              <p className="text-base sm:text-lg text-[var(--jet-black)]/80 max-w-2xl">
                Bulk deals, verified sellers, instant quotes—everything in one rail. Built for procurement, projects,
                and maintenance teams that can’t miss a deadline.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {user ? (
                <Link
                  href={user.role === "buyer" ? "/dashboard/buyer" : "/dashboard/seller"}
                  className="btn-primary flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base"
                >
                  Go to Dashboard <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login?role=buyer"
                    className="btn-primary flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base"
                  >
                    Post Your Enquiry <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/auth/login?role=seller"
                    className="btn-outline flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base text-[var(--jet-black)]"
                  >
                    Seller Login
                  </Link>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              {["10K+ buyers onboarded", "GST-verified sellers", "100% secure", "Pan-India fulfilment"].map(
                (badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-border px-3 py-2 text-xs font-medium shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
                  >
                    <BadgeCheck size={14} className="text-[var(--reseda-green)]" />
                    {badge}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="relative z-10">
            <div className="rounded-2xl bg-[var(--jet-black)] text-primary-foreground p-6 sm:p-8 border border-border/50 shadow-xl overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(240,100,0,0.25),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(100,110,87,0.25),transparent_45%)]" />
              <div className="relative space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-primary-foreground/60">Live sourcing lane</p>
                    <h3 className="text-2xl font-semibold mt-1">Trust shield • India map</h3>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary text-primary-foreground">Live</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-primary-foreground/80">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-primary-foreground/60">Quote cycle</p>
                    <p className="text-lg font-semibold">-36% faster</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-primary-foreground/60">On-time dispatch</p>
                    <p className="text-lg font-semibold">94%</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-primary-foreground/60">Avg. response</p>
                    <p className="text-lg font-semibold">2h</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-primary-foreground/60">Cities live</p>
                    <p className="text-lg font-semibold">100+</p>
                  </div>
                </div>

                <div className="relative mt-4 h-44 rounded-xl border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(240,100,0,0.5),transparent_45%),radial-gradient(circle_at_80%_60%,rgba(100,110,87,0.45),transparent_40%)] overflow-hidden">
                  <div className="absolute inset-0 line-pattern opacity-30" aria-hidden />
                  <div className="absolute left-6 top-6 flex items-center gap-2 text-sm">
                    <ShieldCheck size={16} className="text-primary" />
                    <span className="text-primary-foreground/90">Verified supplier mesh</span>
                  </div>
                  <div className="absolute right-4 bottom-4 text-right">
                    <p className="text-xs text-primary-foreground/60">Enquiries today</p>
                    <p className="text-xl font-semibold">48</p>
                  </div>
                  <div className="absolute inset-4 border border-dashed border-white/15 rounded-xl" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary/30 blur-2xl" aria-hidden />
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section id="categories" className="bg-background border-b border-border py-14">
        <div className="w-full space-y-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--reseda-green)]">Shop by category</p>
              <h2 className="text-2xl sm:text-3xl font-semibold">Source electrical parts faster</h2>
              <p className="text-sm text-[var(--jet-black)]/65 max-w-2xl">
                Equal-height cards in a continuous left-moving rail—tap any to filter the catalog.
              </p>
            </div>
            <Link href="/?view=catalog" className="btn-outline rounded-full px-4 py-2 text-sm self-start sm:self-auto">
              View full catalog
            </Link>
          </div>

          <div className="relative w-full overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-24 bg-gradient-to-r from-background via-background/70 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-24 bg-gradient-to-l from-background via-background/70 to-transparent" />

            <div className="animate-marquee flex w-max gap-6 py-6 px-1 sm:px-2">
              {marqueeCategories.map((category, idx) => (
                <Link
                  key={`${category.name}-${idx}`}
                  href={`/?category=${encodeURIComponent(category.name.toLowerCase())}`}
                  className="w-[230px] sm:w-[250px] lg:w-[270px] h-[220px] sm:h-[230px] flex-shrink-0 rounded-2xl border border-border bg-white shadow-sm hover:-translate-y-1 transition-transform duration-150 hover:border-primary/70 flex flex-col overflow-hidden"
                >
                  <div
                    className="flex-[7] relative w-full bg-[var(--isabella)]"
                    style={{ backgroundImage: `url(${category.image})`, backgroundSize: "cover", backgroundPosition: "center" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/5 to-black/20" />
                  </div>
                  <div className="flex-[3] flex items-center gap-3 px-4 py-3 bg-white">
                    <div className="h-11 w-11 rounded-full bg-[var(--isabella)] text-[var(--jet-black)] flex items-center justify-center border border-border">
                      <category.icon size={18} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-base leading-tight">{category.name}</p>
                      <p className="text-xs text-[var(--jet-black)]/60 leading-relaxed">{category.detail}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="about" className="bg-[var(--isabella)] border-b border-border py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-[1fr,1.05fr] gap-10 lg:gap-14 items-start">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--reseda-green)]">Why VoltSupply</p>
            <h2 className="text-3xl font-semibold leading-tight">Procurement built for electrical teams</h2>
            <p className="text-base text-[var(--jet-black)]/75 leading-relaxed">
              Structured enquiries, verified sellers, and logistics support keep your timelines intact. Every quote,
              spec, and approval stays tied to its thread.
            </p>
            <div className="space-y-2 text-sm text-[var(--jet-black)]/70">
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-[var(--reseda-green)] mt-[2px]" />
                <span>Specs stay consistent—no misaligned PDFs or missing line items.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-[var(--reseda-green)] mt-[2px]" />
                <span>Messaging, quotes, and documents stay auditable for finance and QA.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-[var(--reseda-green)] mt-[2px]" />
                <span>Response speed, win-rates, and delivery reliability are surfaced automatically.</span>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 lg:gap-5">
            {trustRow.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm hover:border-primary/60 transition-colors min-h-[150px]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-[var(--reseda-green)]/10 border border-border flex items-center justify-center">
                    <item.icon size={18} className="text-[var(--reseda-green)]" />
                  </div>
                  <p className="font-semibold leading-tight">{item.title}</p>
                </div>
                <p className="text-sm text-[var(--jet-black)]/70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Enquiries */}
      <section id="features" className="bg-background border-b border-border py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--reseda-green)]">Featured products & enquiries</p>
              <h2 className="text-2xl sm:text-3xl font-semibold mt-2">Real-time sourcing lanes</h2>
              <p className="text-sm text-[var(--jet-black)]/70">Horizontal scroll, lazy-ready cards for mobile.</p>
            </div>
            <span className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-full bg-[var(--isabella)] border border-border">
              Live feed • Auto-updates
            </span>
          </div>

          <div className="overflow-x-auto pb-2 -mx-2 md:mx-0">
            <div className="flex gap-4 min-w-full snap-x snap-mandatory">
              {featuredEnquiries.map((item, idx) => (
                <div
                  key={item.title}
                  className="min-w-[260px] sm:min-w-[280px] lg:min-w-[300px] snap-start rounded-xl border border-border bg-card p-5 shadow-sm hover:-translate-y-1 transition-transform duration-150"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs uppercase tracking-[0.12em] text-[var(--reseda-green)]">Lead #{idx + 1}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-[var(--jet-black)] text-primary-foreground">{item.tag}</span>
                  </div>
                  <h3 className="text-lg font-semibold mt-2">{item.title}</h3>
                  <p className="text-sm text-[var(--jet-black)]/70 mt-1">{item.location}</p>
                  <div className="mt-4 space-y-2 text-sm text-[var(--jet-black)]/80">
                    <div className="flex items-center gap-2">
                      <Package size={15} />
                      <span>{item.volume}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={15} />
                      <span>{item.urgency}</span>
                    </div>
                  </div>
                  <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80">
                    Respond to enquiry <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[var(--isabella)] border-b border-border py-14" id="help">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--reseda-green)]">Testimonials</p>
              <h2 className="text-2xl sm:text-3xl font-semibold mt-2">Credibility from buyers & suppliers</h2>
            </div>
            <Link href="/auth/register" className="btn-primary rounded-full px-4 py-2">
              Join the network
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 text-[var(--reseda-green)] text-xs font-semibold uppercase tracking-[0.12em]">
                  <BadgeCheck size={16} />
                  Verified voice
                </div>
                <p className="mt-3 text-base leading-relaxed text-[var(--jet-black)]/85">“{item.quote}”</p>
                <div className="mt-4 text-sm font-semibold text-[var(--jet-black)]">{item.name}</div>
                <div className="text-xs text-[var(--jet-black)]/60">{item.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="bg-[var(--jet-black)] text-primary-foreground py-16 border-b border-border" id="cta">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-[1.1fr,0.9fr] gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-semibold leading-tight">Start sourcing with confidence.</h2>
            <p className="text-base text-primary-foreground/75">
              Post enquiries, receive verified quotes, and move to delivery without losing context. Built for mobile and
              desktop with fast, above-the-fold rendering.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={user ? (user.role === "buyer" ? "/dashboard/buyer" : "/dashboard/seller") : "/auth/register"}
                className="btn-primary flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base"
              >
                Get Quotes Now <ArrowRight size={16} />
              </Link>
              <Link
                href="/auth/register"
                className="btn-outline flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base text-primary-foreground border-white/30 hover:bg-white/10"
              >
                Join as Supplier
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-primary-foreground/60">Help & support</p>
                <p className="text-lg font-semibold">Need a human?</p>
              </div>
              <PhoneCall size={20} />
            </div>
            <p className="text-sm text-primary-foreground/75">
              Talk to a dedicated account manager for specs clarification, freight options, or onboarding queries.
            </p>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} />
                <span>Assisted KYC and GST verification</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={16} />
                <span>Lane suggestions for urgent dispatches</span>
              </div>
              <div className="flex items-center gap-2">
                <Package size={16} />
                <span>MOQ negotiation support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Footer */}
      <footer className="bg-background text-[var(--jet-black)] border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary rounded-[8px] border border-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  VS
                </div>
                <div>
                  <p className="font-semibold">VoltSupply</p>
                  <p className="text-sm text-[var(--jet-black)]/70">Industrial electrical supply network</p>
                </div>
              </div>
              <p className="text-sm text-[var(--jet-black)]/70">
                India-wide sourcing with verified sellers, fast quotes, and secure payments.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Quick links</p>
              <div className="flex flex-col gap-2 text-sm text-[var(--jet-black)]/70">
                <Link href="#categories" className="hover:text-[var(--jet-black)]">
                  Categories
                </Link>
                <Link href="#about" className="hover:text-[var(--jet-black)]">
                  About
                </Link>
                <Link href="#help" className="hover:text-[var(--jet-black)]">
                  Help
                </Link>
                <Link href="/auth/login" className="hover:text-[var(--jet-black)]">
                  Login / Signup
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Locations</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-[var(--jet-black)]/70">
                {seoLocations.map((city) => (
                  <Link key={city} href={`/?city=${encodeURIComponent(city.toLowerCase())}`} className="hover:text-[var(--jet-black)]">
                    Electrical suppliers in {city}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Categories</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-[var(--jet-black)]/70">
                {seoCategories.map((cat) => (
                  <Link key={cat} href={`/?category=${encodeURIComponent(cat.toLowerCase())}`} className="hover:text-[var(--jet-black)]">
                    {cat} in India
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-2 text-xs text-[var(--jet-black)]/60">
                <Link href="/privacy" className="hover:text-[var(--jet-black)]">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-[var(--jet-black)]">
                  Terms
                </Link>
                <Link href="/sitemap" className="hover:text-[var(--jet-black)]">
                  Sitemap
                </Link>
                <Link href="/faqs" className="hover:text-[var(--jet-black)]">
                  FAQs
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6 text-sm text-[var(--jet-black)]/60">
            <p>&copy; 2025 VoltSupply. Built for industrial procurement.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
