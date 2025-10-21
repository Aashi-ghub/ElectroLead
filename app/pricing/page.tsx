"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Check } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function PricingPage() {
  const plans = [
    {
      name: "Local",
      price: "₹2,000",
      period: "/month",
      description: "Perfect for local businesses",
      features: ["One City", "50 Leads/month", "Basic Analytics", "Email Support"],
      cta: "Choose Local",
    },
    {
      name: "State",
      price: "₹6,000",
      period: "/month",
      description: "Expand across your state",
      features: ["Full State", "200 Leads/month", "Advanced Analytics", "Chat Support"],
      cta: "Choose State",
      popular: true,
    },
    {
      name: "National",
      price: "₹15,000",
      period: "/month",
      description: "Go all-India",
      features: ["All India", "1000 Leads/month", "Premium Analytics", "Priority Support"],
      cta: "Choose National",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/">
            <button className="text-foreground/60 hover:text-foreground">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <h1 className="text-2xl font-bold">Pricing Plans</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Choose the plan that fits your business needs. Save 20% with annual billing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, idx) => (
            <Card key={idx} className={`p-8 relative ${plan.popular ? "ring-2 ring-primary md:scale-105" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-foreground/60 text-sm mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-foreground/60">{plan.period}</span>
              </div>
              <Button className="w-full mb-8" variant={plan.popular ? "default" : "outline"}>
                {plan.cta}
              </Button>
              <div className="space-y-4">
                {plan.features.map((feature, fidx) => (
                  <div key={fidx} className="flex items-center gap-3">
                    <Check size={20} className="text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-foreground/60 mb-4">All plans include 7-day money-back guarantee</p>
          <Link href="/auth/register">
            <Button size="lg">Get Started Free</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
