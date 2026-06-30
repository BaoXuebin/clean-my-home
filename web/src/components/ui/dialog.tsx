import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

// Lightweight shadcn-style modal (no radix dependency): overlay + centered
// panel, closes on Escape / overlay click. Animations via tailwindcss-animate.
export function Dialog({
  open,
  onOpenChange,
  children,
  className,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  children: React.ReactNode
  className?: string
}) {
  React.useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    document.addEventListener("keydown", h)
    return () => document.removeEventListener("keydown", h)
  }, [open, onOpenChange])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 animate-in fade-in-0 duration-200"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border bg-background p-6 shadow-lg animate-in fade-in-0 zoom-in-95 duration-200",
          className
        )}
      >
        {children}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 pr-8", className)} {...props} />
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  )
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}
