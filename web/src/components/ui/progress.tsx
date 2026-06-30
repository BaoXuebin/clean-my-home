import { cn } from "@/lib/utils"

// Lightweight shadcn-style progress (no radix dependency).
export function Progress({ value, className }: { value?: number; className?: string }) {
  return (
    <div
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/15", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%` }}
      />
    </div>
  )
}
