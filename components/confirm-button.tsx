"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

/**
 * A button that asks before doing something it cannot undo.
 *
 * Accepting a quote rejects every other quote and closes the requirement;
 * suspending a user locks them out; rejecting KYC blocks a supplier. All three
 * were single-click with no confirmation and no undo.
 *
 * Deliberately inline rather than a modal: a second click in the same place is
 * easier to follow than a dialog for someone who is not a heavy software user.
 */
export default function ConfirmButton({
  onConfirm,
  children,
  confirmLabel = "Tap again to confirm",
  question,
  disabled,
  variant = "default",
  size = "sm",
  className,
}: {
  onConfirm: () => void | Promise<void>
  children: React.ReactNode
  confirmLabel?: string
  /** Shown beside the button while armed, explaining the consequence. */
  question?: string
  disabled?: boolean
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive"
  size?: "sm" | "default" | "lg"
  className?: string
}) {
  const [armed, setArmed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Disarm by itself, so a half-pressed destructive action does not sit
  // waiting to fire on a stray click minutes later.
  useEffect(() => {
    if (!armed) return
    timer.current = setTimeout(() => setArmed(false), 5000)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [armed])

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        size={size}
        variant={armed ? "destructive" : variant}
        disabled={disabled}
        className={className}
        onClick={() => {
          if (!armed) {
            setArmed(true)
            return
          }
          setArmed(false)
          onConfirm()
        }}
      >
        {armed ? confirmLabel : children}
      </Button>
      {armed && question && <span className="text-xs text-foreground/60 max-w-xs">{question}</span>}
    </span>
  )
}
