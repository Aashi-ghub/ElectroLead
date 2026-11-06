/**
 * Dashboard figures as one strip rather than four floating cards.
 *
 * Four separate cards with decorative top-right icons ate ~140px of vertical
 * space and implied data that does not exist — a trend arrow next to a number
 * that has no trend, an award next to a win rate that may be "—". A single
 * divided strip reads faster, says the same thing, and leaves the page room
 * for the content the user actually came for.
 */
export interface Stat {
  label: string
  value: string
  /** Optional emphasis for the figure that matters most on the page. */
  accent?: boolean
}

export default function StatStrip({ stats }: { stats: Stat[] }) {
  return (
    <div className="bg-card rounded-xl border border-border grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border overflow-hidden">
      {stats.map((stat) => (
        <div key={stat.label} className="px-4 py-3.5">
          <p className="text-xs text-foreground/55 leading-snug mb-1">{stat.label}</p>
          <p
            className={`text-2xl font-semibold tracking-tight ${
              stat.accent ? "text-primary" : "text-foreground"
            }`}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  )
}
