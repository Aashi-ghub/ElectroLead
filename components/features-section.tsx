import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Shield, TrendingUp, MessageSquare, Zap, Lock } from "lucide-react"

const features = [
  {
    icon: Search,
    title: "Advanced Search",
    description: "Find exactly what you need with powerful filters and real-time inventory tracking",
  },
  {
    icon: Shield,
    title: "Verified Suppliers",
    description: "All suppliers are verified and rated by the community for quality assurance",
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    description: "Access real-time pricing trends and market analytics for better decisions",
  },
  {
    icon: MessageSquare,
    title: "Direct Messaging",
    description: "Communicate directly with suppliers and negotiate terms in real-time",
  },
  {
    icon: Zap,
    title: "Fast Transactions",
    description: "Streamlined ordering process with integrated payment and logistics",
  },
  {
    icon: Lock,
    title: "Secure Platform",
    description: "Enterprise-grade security with encrypted communications and data protection",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">Powerful Features for Modern Sourcing</h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Everything you need to streamline your electrical supply chain
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon size={24} className="text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-foreground/60">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
