import { cn } from "@/lib/utils"
import type { BudgetItem } from "@/types"

const variants: Record<BudgetItem["status"], string> = {
  active: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
  pending: "bg-[#FDDBA7] text-[#59431C] dark:bg-secondary/20 dark:text-secondary",
  closed: "bg-surface-container-high text-muted-foreground dark:bg-surface-container dark:text-muted-foreground",
}

type StatusBadgeProps = {
  status: BudgetItem["status"]
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest",
        variants[status],
        className,
      )}
    >
      {status}
    </span>
  )
}
