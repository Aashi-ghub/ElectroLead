"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function CreateEnquiryPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectType: "",
    priority: "",
    products: [] as { name: string; specs: string; quantity: string; unit: string }[],
    targetArea: "",
    states: [] as string[],
    quoteDeadline: "",
    projectStart: "",
    deliveryBy: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const addProduct = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { name: "", specs: "", quantity: "", unit: "" }],
    }))
  }

  const updateProduct = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    }))
  }

  const removeProduct = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }))
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleSubmit = () => {
    router.push("/dashboard/buyer/enquiries")
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
    } else {
      router.push("/auth/login")
    }
  }, [router])

  if (!user) return null

  return (
    <DashboardLayout userRole={user.role as "buyer" | "seller" | "admin"} userName={user.name} userEmail={user.email}>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-foreground/60 hover:text-foreground">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Create New Enquiry</h1>
            <p className="text-sm text-foreground/60">Step {step} of 3</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <Card className="p-8">
          {/* Step 1: Project Details */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Project Details</h2>
              <div>
                <label className="block text-sm font-medium mb-2">Enquiry Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Industrial Plant Electrical Setup"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Project Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your project requirements..."
                  rows={4}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Type</label>
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select type</option>
                    <option value="new">New Installation</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="upgrade">Upgrade</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select priority</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Products */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Product Specifications</h2>
              <div className="space-y-4">
                {formData.products.map((product, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Product {index + 1}</span>
                      <button
                        onClick={() => removeProduct(index)}
                        className="text-destructive hover:text-destructive/80 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Product name"
                      value={product.name}
                      onChange={(e) => updateProduct(index, "name", e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Specifications"
                      value={product.specs}
                      onChange={(e) => updateProduct(index, "specs", e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Quantity"
                        value={product.quantity}
                        onChange={(e) => updateProduct(index, "quantity", e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Unit"
                        value={product.unit}
                        onChange={(e) => updateProduct(index, "unit", e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" onClick={addProduct} className="w-full bg-transparent">
                + Add Product
              </Button>
            </div>
          )}

          {/* Step 3: Supplier Targeting */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Supplier Targeting & Timeline</h2>
              <div>
                <label className="block text-sm font-medium mb-2">Target Area</label>
                <select
                  name="targetArea"
                  value={formData.targetArea}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select area</option>
                  <option value="specific">Specific State</option>
                  <option value="all">All India</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium">Timeline</label>
                <input
                  type="date"
                  name="quoteDeadline"
                  value={formData.quoteDeadline}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="date"
                  name="projectStart"
                  value={formData.projectStart}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="date"
                  name="deliveryBy"
                  value={formData.deliveryBy}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="px-6">
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={handleNext} className="px-6">
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="px-6">
                Publish Enquiry
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
    </DashboardLayout>
  )
}
