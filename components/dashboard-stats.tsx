import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Package, MessageSquare } from "lucide-react"

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  change: string
  trend: "up" | "down"
}

function StatCard({ icon, label, value, change, trend }: StatCardProps) {
  return (
    <Card className="rounded-lg border border-border bg-[var(--isabella)]">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-xs uppercase tracking-[0.08em] text-foreground/60">{label}</CardTitle>
        <div className={`flex items-center gap-1 text-xs ${trend === "up" ? "text-[var(--reseda-green)]" : "text-red-600"}`}>
          <TrendingUp size={14} className={trend === "down" ? "rotate-180" : ""} />
          {change}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <span className="text-3xl font-semibold tracking-tight block">{value}</span>
        <div className="w-12 h-12 bg-primary/10 border border-border rounded-[10px] flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={<Package size={24} className="text-primary" />}
        label="Active Enquiries"
        value="24"
        change="+12%"
        trend="up"
      />
      <StatCard
        icon={<Users size={24} className="text-primary" />}
        label="Supplier Responses"
        value="156"
        change="+8%"
        trend="up"
      />
      <StatCard
        icon={<MessageSquare size={24} className="text-primary" />}
        label="Messages"
        value="42"
        change="+5%"
        trend="up"
      />
      <StatCard
        icon={<TrendingUp size={24} className="text-primary" />}
        label="Conversion Rate"
        value="34%"
        change="+2%"
        trend="up"
      />
    </div>
  )
}
