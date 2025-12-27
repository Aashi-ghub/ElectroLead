import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, TrendingUp } from "lucide-react"

interface EnquiryCardProps {
  id: string
  title: string
  category: string
  quantity: string
  location: string
  deadline: string
  budget: string
  responses: number
  status: "active" | "pending" | "closed"
}

export function EnquiryCard({
  id,
  title,
  category,
  quantity,
  location,
  deadline,
  budget,
  responses,
  status,
}: EnquiryCardProps) {
  const statusColors = {
    active: "bg-primary/10 text-primary border-primary/30",
    pending: "bg-[var(--reseda-green)]/15 text-[var(--reseda-green)] border-[var(--reseda-green)]/40",
    closed: "bg-[var(--jet-black)]/10 text-[var(--jet-black)] border-[var(--jet-black)]/30",
  }

  return (
    <Card className="border border-border hover:border-primary/50 transition-colors bg-[var(--isabella)] rounded-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-foreground/60">{category}</CardDescription>
          </div>
          <Badge className={statusColors[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-foreground/60">Quantity</span>
            <p className="font-medium">{quantity}</p>
          </div>
          <div>
            <span className="text-foreground/60">Budget</span>
            <p className="font-medium">{budget}</p>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <MapPin size={16} className="text-foreground/60" />
            <span className="text-foreground/60">{location}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Calendar size={16} className="text-foreground/60" />
            <span className="text-foreground/60">{deadline}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            <span className="text-sm font-medium">{responses} responses</span>
          </div>
          <Button size="sm" variant="outline" className="rounded-[6px]">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
