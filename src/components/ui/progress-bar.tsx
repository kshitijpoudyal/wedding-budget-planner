import { cn } from "@/lib/utils"

function getProgressColor(percent: number): string {
  if (percent > 100) return "bg-red-500"
  if (percent > 80) return "bg-orange-500"
  if (percent > 50) return "bg-yellow-500"
  return "bg-gradient-to-r from-primary to-[#D69F9E]"
}

type ProgressBarProps = {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({ value, max = 100, className, showLabel = false }: ProgressBarProps) {
  const percent = max > 0 ? (value / max) * 100 : 0
  const clampedWidth = Math.min(percent, 100)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-2 rounded-full bg-surface-container-high overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-200", getProgressColor(percent))}
          style={{ width: `${clampedWidth}%` }}
        />
      </div>
      {showLabel && (
        <span
          className={cn(
            "text-xs font-medium tabular-nums",
            percent > 100 ? "text-red-500" : "text-muted-foreground",
          )}
        >
          {Math.round(percent)}%
        </span>
      )}
    </div>
  )
}
