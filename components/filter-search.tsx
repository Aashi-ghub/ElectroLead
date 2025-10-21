"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, Filter, X } from "lucide-react"

export function FilterSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 100000],
    location: "",
    rating: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  const handleReset = () => {
    setSearchQuery("")
    setFilters({
      category: "",
      priceRange: [0, 100000],
      location: "",
      rating: "",
    })
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={20} />
              <Input
                placeholder="Search products, suppliers, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
              <Filter size={20} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle>Filters</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
              <X size={20} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lighting">Lighting</SelectItem>
                  <SelectItem value="cables">Cables & Wires</SelectItem>
                  <SelectItem value="panels">Control Panels</SelectItem>
                  <SelectItem value="transformers">Transformers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range</label>
              <div className="space-y-3">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => setFilters({ ...filters, priceRange: value as [number, number] })}
                  min={0}
                  max={100000}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-foreground/60">
                  <span>${filters.priceRange[0].toLocaleString()}</span>
                  <span>${filters.priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                placeholder="City or region"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier Rating</label>
              <Select value={filters.rating} onValueChange={(value) => setFilters({ ...filters, rating: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="flex-1 bg-primary hover:bg-primary/90">Apply Filters</Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
