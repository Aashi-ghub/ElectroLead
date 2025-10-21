import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Starter",
    description: "Perfect for small businesses",
    price: "$99",
    period: "/month",
    features: ["Up to 10 enquiries/month", "Basic supplier search", "Email support", "Standard analytics"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    description: "For growing businesses",
    price: "$299",
    period: "/month",
    features: [
      "Unlimited enquiries",
      "Advanced search & filters",
      "Priority support",
      "Advanced analytics",
      "API access",
      "Custom integrations",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    price: "Custom",
    period: "pricing",
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "Custom workflows",
      "White-label options",
      "SLA guarantee",
      "Advanced security",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">Simple, Transparent Pricing</h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">Choose the plan that fits your business needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative transition-all ${
                plan.highlighted ? "border-primary/50 shadow-lg scale-105 md:scale-100" : "border-border"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-foreground/60 ml-2">{plan.period}</span>
                </div>

                <Button
                  className={`w-full ${
                    plan.highlighted ? "bg-primary hover:bg-primary/90" : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {plan.cta}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check size={20} className="text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/70">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
