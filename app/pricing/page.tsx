"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Check } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useSession } from "@/hooks/use-session"

const PLANS = [
  {
    key: "local",
    name: "Local",
    price: "₹2,000",
    period: "/month",
    description: "Perfect for local businesses",
    features: ["One City", "Unlimited quotes", "Basic Analytics", "Email Support"],
    cta: "Choose Local",
  },
  {
    key: "state",
    name: "State",
    price: "₹6,000",
    period: "/month",
    description: "Expand across your state",
    features: ["Full State", "Unlimited quotes", "Advanced Analytics", "Chat Support"],
    cta: "Choose State",
    popular: true,
  },
  {
    key: "national",
    name: "National",
    price: "₹15,000",
    period: "/month",
    description: "Go all-India",
    features: ["All India", "Unlimited quotes", "Premium Analytics", "Priority Support"],
    cta: "Choose National",
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { user, loading } = useSession()
  const [currentPlan, setCurrentPlan] = useState<{ plan_type: string; end_date: string } | null>(null)
  const [subscribingTo, setSubscribingTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role === "seller") {
      fetch("/api/auth/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setCurrentPlan(data?.subscription ?? null))
    }
  }, [user])

  const handleChoose = async (planKey: string) => {
    if (!user) {
      router.push("/auth/register/seller")
      return
    }
    if (user.role !== "seller") {
      setError("Only supplier accounts can subscribe to a plan.")
      return
    }
    setError(null)
    setSubscribingTo(planKey)
    try {
      const res = await fetch("/api/subscriptions/activate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_type: planKey }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to activate plan")
        return
      }
      router.push("/dashboard/seller/enquiries")
    } catch {
      setError("Could not reach the server. Please try again.")
    } finally {
      setSubscribingTo(null)
    }
  }

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
            Choose the plan that fits the region you want to sell in.
          </p>
          <div className="mt-4 inline-block px-4 py-2 rounded-lg bg-accent/10 text-accent text-sm font-medium">
            Test mode — checkout is a placeholder until Razorpay live keys are configured. No real payment is taken.
          </div>
        </div>

        {!loading && currentPlan && (
          <div className="mb-8 p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-center">
            You're currently on the <strong className="capitalize">{currentPlan.plan_type}</strong> plan, active until{" "}
            {new Date(currentPlan.end_date).toLocaleDateString()}.
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {PLANS.map((plan) => (
            <Card key={plan.key} className={`p-8 relative ${plan.popular ? "ring-2 ring-primary md:scale-105" : ""}`}>
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
              <Button
                className="w-full mb-8"
                variant={plan.popular ? "default" : "outline"}
                disabled={subscribingTo === plan.key || currentPlan?.plan_type === plan.key}
                onClick={() => handleChoose(plan.key)}
              >
                {currentPlan?.plan_type === plan.key
                  ? "Current Plan"
                  : subscribingTo === plan.key
                    ? "Activating..."
                    : plan.cta}
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
