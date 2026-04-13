import { cn } from "@/lib/utils"

type CalcButtonProps = {
  children: React.ReactNode
  onClick: () => void
  variant?: "default" | "operator" | "function" | "equals"
  span?: number
  compact?: boolean
}

export function CalcButton({
  children,
  onClick,
  variant = "default",
  span = 1,
  compact = false,
}: CalcButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl text-xl font-medium transition-all duration-200 active:scale-95",
        "flex items-center justify-center select-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        compact ? "h-12 text-lg" : "h-14 md:h-16 md:rounded-2xl md:text-2xl",
        variant === "default" && "bg-surface-container hover:bg-surface-container-high text-foreground",
        variant === "operator" && "bg-primary/15 hover:bg-primary/25 text-primary font-semibold",
        variant === "function" && "bg-secondary/15 hover:bg-secondary/25 text-secondary",
        variant === "equals" && "bg-primary hover:bg-primary/90 text-white font-semibold",
        span === 2 && "col-span-2",
      )}
    >
      {children}
    </button>
  )
}
