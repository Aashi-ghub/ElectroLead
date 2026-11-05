"use client"

import {
  Cable,
  CircuitBoard,
  Cog,
  Gauge,
  Lightbulb,
  Package,
  Route,
  Sun,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { categoryFor } from "@/lib/categories"

/**
 * A category thumbnail that never renders a broken image.
 *
 * Photography arrives one category at a time, so a tile without a photo falls
 * back to the category's icon on a dark panel. Earlier this drew the category
 * initials ("WC", "LL"), which read as a missing asset; a consistent icon set
 * reads as a design choice, which matters when five of eight tiles are still
 * waiting on photos.
 */
const ICONS: Record<string, LucideIcon> = {
  cables: Cable,
  switchgear: CircuitBoard,
  transformers: Zap,
  lighting: Lightbulb,
  motors: Cog,
  solar: Sun,
  conduits: Route,
  testing: Gauge,
}

export default function CategoryImage({
  categoryKey,
  className = "",
  alt,
}: {
  categoryKey?: string | null
  className?: string
  alt?: string
}) {
  const category = categoryFor(categoryKey)
  const label = category?.label ?? "General supply"

  if (category?.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- local, pre-sized
      // files; next/image's optimiser adds nothing and next.config.mjs already
      // sets images.unoptimized.
      <img
        src={category.image}
        alt={alt ?? label}
        loading="lazy"
        className={`object-cover bg-muted ${className}`}
      />
    )
  }

  const Icon = ICONS[categoryKey ?? ""] ?? Package

  return (
    <div
      role="img"
      aria-label={alt ?? label}
      className={`relative bg-[var(--jet-black)] flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Faint diagonal rule so the panel has some texture rather than reading
          as a flat grey hole in the grid. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 9px)",
        }}
      />
      <Icon className="relative text-primary/80" size={30} strokeWidth={1.5} />
    </div>
  )
}
