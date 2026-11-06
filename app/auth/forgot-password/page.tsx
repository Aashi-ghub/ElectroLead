"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2 } from "lucide-react"

/**
 * Password reset, in two steps on one page.
 *
 * The login page's "Forgot?" link previously pointed at "#" and no reset UI
 * existed, so a forgotten password meant a permanently locked-out customer.
 */
export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "reset" | "done">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || "Could not send the reset code")
      setStep("reset")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the reset code")
    } finally {
      setBusy(false)
    }
  }

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: password }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || "Could not reset your password")
      setStep("done")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset your password")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--isabella)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground mb-6"
        >
          <ArrowLeft size={15} />
          Back to sign in
        </Link>

        <div className="bg-card rounded-xl border border-border p-6 sm:p-8">
          {step === "done" ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-4 text-[var(--reseda-green)]" size={40} />
              <h1 className="text-2xl font-bold mb-2">Password changed</h1>
              <p className="text-foreground/65 mb-6">You can sign in with your new password now.</p>
              <Button className="w-full" onClick={() => router.push("/auth/login")}>
                Go to sign in
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1.5">Reset your password</h1>
              <p className="text-foreground/65 text-sm mb-6">
                {step === "email"
                  ? "Enter the email you registered with and we'll send you a 6-digit code."
                  : `Enter the code we sent to ${email} and choose a new password.`}
              </p>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                  {error}
                </div>
              )}

              {step === "email" ? (
                <form onSubmit={requestCode} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-4 h-11 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Sending..." : "Send reset code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={submitReset} className="space-y-4">
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium mb-1.5">
                      6-digit code
                    </label>
                    <input
                      id="otp"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full px-4 h-11 rounded-lg border border-border bg-background tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                      New password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-4 h-11 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Saving..." : "Set new password"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="w-full text-sm text-foreground/60 hover:text-foreground"
                  >
                    Didn't get a code? Try again
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
