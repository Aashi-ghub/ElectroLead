"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, CheckCircle, Clock } from "lucide-react"

export default function KYCPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    panNumber: "",
    gstFile: null as File | null,
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    addressProofFile: null as File | null,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [field]: file,
      }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleSubmit = () => {
    router.push("/auth/kyc-status")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 sm:p-12">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            <span className="text-sm font-medium">Step {step} of 3</span>
            <span className="text-sm text-foreground/60">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Verify Your Business</h1>
        <p className="text-foreground/60 mb-8">
          Step {step} of 3 • {step === 1 ? "Basic Info" : step === 2 ? "Address Proof" : "Review"}
        </p>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">PAN Number</label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                placeholder="ABCDE1234F"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">GST Certificate</label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "gstFile")}
                  className="hidden"
                  id="gst-file"
                  accept=".pdf,.jpg,.png"
                />
                <label htmlFor="gst-file" className="cursor-pointer">
                  <Upload className="mx-auto mb-2 text-foreground/60" size={32} />
                  <p className="text-sm font-medium">Drag & drop or click to upload</p>
                  <p className="text-xs text-foreground/60">PDF, JPG, PNG up to 10MB</p>
                </label>
              </div>
              {formData.gstFile && (
                <div className="mt-4 p-4 bg-primary/5 rounded-lg flex items-center gap-3">
                  <CheckCircle size={20} className="text-primary" />
                  <div>
                    <p className="text-sm font-medium">{formData.gstFile.name}</p>
                    <p className="text-xs text-foreground/60">Verified</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="Street address"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address Line 2</label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="Apartment, suite, etc."
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="400001"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address Proof Document</label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "addressProofFile")}
                  className="hidden"
                  id="address-file"
                  accept=".pdf,.jpg,.png"
                />
                <label htmlFor="address-file" className="cursor-pointer">
                  <Upload className="mx-auto mb-2 text-foreground/60" size={32} />
                  <p className="text-sm font-medium">Upload Electricity Bill or Bank Statement</p>
                  <p className="text-xs text-foreground/60">PDF, JPG, PNG up to 10MB</p>
                </label>
              </div>
              {formData.addressProofFile && (
                <div className="mt-4 p-4 bg-accent/5 rounded-lg flex items-center gap-3">
                  <Clock size={20} className="text-accent" />
                  <div>
                    <p className="text-sm font-medium">{formData.addressProofFile.name}</p>
                    <p className="text-xs text-foreground/60">Verifying</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="p-6 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="font-semibold mb-4">Verification Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">PAN Verification</span>
                  <span className="flex items-center gap-2 text-primary">
                    <CheckCircle size={16} /> Completed
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">GST Verification</span>
                  <span className="flex items-center gap-2 text-primary">
                    <CheckCircle size={16} /> Completed
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">Address Verification</span>
                  <span className="flex items-center gap-2 text-accent">
                    <Clock size={16} /> Under Review
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-foreground/60">
              Your documents have been submitted for verification. This usually takes 24-48 hours. You can browse the
              platform while we verify your account.
            </p>
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
              Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="px-6">
              Complete Verification
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
