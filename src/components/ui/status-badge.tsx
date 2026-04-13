import { cn } from "@/lib/utils"
import type { BudgetItem } from "@/types"

const variants: Record<BudgetItem["status"], string> = {
  draft: "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground",
  finalized: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
  complete: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
}

type StatusBadgeProps = {
  status: BudgetItem["status"]
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

export function StatusBadge({ status, className, onClick }: StatusBadgeProps) {
  return (
    <span
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(e as unknown as React.MouseEvent) } : undefined}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest",
        variants[status],
        onClick && "cursor-pointer select-none hover:opacity-80 transition-opacity",
        className,
      )}
    >
      {status}
    </span>
  )
}
