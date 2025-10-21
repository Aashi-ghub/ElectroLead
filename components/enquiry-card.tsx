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
    active: "bg-green-500/10 text-green-700 border-green-200",
    pending: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
    closed: "bg-gray-500/10 text-gray-700 border-gray-200",
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{category}</CardDescription>
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
            <TrendingUp size={16} className="text-accent" />
            <span className="text-sm font-medium">{responses} responses</span>
          </div>
          <Button size="sm" variant="outline">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
