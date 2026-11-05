/**
 * Product categories, shared by every surface that groups or illustrates
 * supply: the landing grid, enquiry cards, lead cards and the enquiry form.
 *
 * `image` points into public/img/categories. A tile with no photo yet renders
 * the gradient fallback in <CategoryImage>, which is a deliberate-looking
 * placeholder rather than a broken <img>. Keep this list in step with
 * backend/scripts/demo-data.mjs.
 */
export interface Category {
  key: string
  label: string
  blurb: string
  /** Set once a photo exists in public/img/categories; null falls back. */
  image: string | null
}

export const CATEGORIES: Category[] = [
  {
    key: "cables",
    label: "Wires & Cables",
    blurb: "LT/HT cable, armoured, flexible, control",
    image: null,
  },
  {
    key: "switchgear",
    label: "Switchgear & Panels",
    blurb: "MCB, MCCB, ACB, distribution boards",
    image: "/img/categories/switchgear.jpg",
  },
  {
    key: "transformers",
    label: "Transformers",
    blurb: "Distribution, isolation, dry-type",
    image: null,
  },
  {
    key: "lighting",
    label: "LED & Lighting",
    blurb: "Industrial, street, flameproof fittings",
    image: null,
  },
  {
    key: "motors",
    label: "Motors & Drives",
    blurb: "Induction motors, VFDs, soft starters",
    image: null,
  },
  {
    key: "solar",
    label: "Solar & Renewables",
    blurb: "Rooftop PV, inverters, mounting",
    image: null,
  },
  {
    key: "conduits",
    label: "Conduits & Fittings",
    blurb: "Cable tray, raceway, glands, lugs",
    image: "/img/categories/conduits.jpg",
  },
  {
    key: "testing",
    label: "Test & Measurement",
    blurb: "Meters, relays, calibration",
    image: "/img/categories/testing.jpg",
  },
]

const BY_KEY = new Map(CATEGORIES.map((c) => [c.key, c]))

export const categoryFor = (key?: string | null): Category | null =>
  key ? BY_KEY.get(key) ?? null : null

export const categoryLabel = (key?: string | null): string =>
  categoryFor(key)?.label ?? "General supply"

/**
 * Indian numbering, which is what every buyer on this platform reads prices
 * in: 2150000 -> "₹21.5 L", 20400000 -> "₹2.04 Cr". Plain toLocaleString gives
 * "21,50,000", which is correct but harder to compare at a glance on a card.
 */
export function formatINR(value: number | string | null | undefined): string {
  const n = Number(value)
  if (!Number.isFinite(n) || n === 0) return "—"
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1).replace(/\.0$/, "")} L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n.toLocaleString("en-IN")}`
}

/** "₹18.0 L – ₹24.0 L", or a single bound when only one is set. */
export function formatBudgetRange(
  min: number | string | null | undefined,
  max: number | string | null | undefined
): string {
  const lo = Number(min)
  const hi = Number(max)
  const hasLo = Number.isFinite(lo) && lo > 0
  const hasHi = Number.isFinite(hi) && hi > 0
  if (hasLo && hasHi) return `${formatINR(lo)} – ${formatINR(hi)}`
  if (hasHi) return `Up to ${formatINR(hi)}`
  if (hasLo) return `From ${formatINR(lo)}`
  return "Budget not set"
}
