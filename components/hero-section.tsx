import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
              <Zap size={16} className="text-accent" />
              <span className="text-sm text-accent font-medium">Trusted by 5000+ businesses</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance leading-tight">
              Connect with Verified Electrical Suppliers
            </h1>

            <p className="text-lg text-foreground/70 text-balance leading-relaxed">
              VoltSupply is the B2B marketplace connecting buyers and suppliers in the electrical industry. Find
              quality products, competitive pricing, and reliable partners.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                Start Sourcing <ArrowRight size={18} />
              </Button>
              <Button size="lg" variant="outline">
                Become a Supplier
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 pt-8 border-t border-border">
              <div>
                <div className="text-2xl font-bold">5000+</div>
                <div className="text-sm text-foreground/60">Active Buyers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">2000+</div>
                <div className="text-sm text-foreground/60">Verified Suppliers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">$50M+</div>
                <div className="text-sm text-foreground/60">Annual Volume</div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative h-96 sm:h-full min-h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl" />
            <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-8 h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full">
                  <Zap size={32} className="text-primary" />
                </div>
                <p className="text-foreground/60">Marketplace Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
