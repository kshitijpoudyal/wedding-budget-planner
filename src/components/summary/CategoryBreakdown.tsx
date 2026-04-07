import { ProgressBar } from "@/components/ui/progress-bar"
import { formatCurrency } from "@/lib/currency"
import { getCategoryColor } from "@/lib/categoryColors"
import { cn } from "@/lib/utils"
import type { BudgetTreeNode } from "@/hooks/useBudgetTree"
import type { Settings } from "@/types"

type CategoryBreakdownProps = {
  tree: BudgetTreeNode[]
  currency: Settings["currency"]
  exchangeRate: number
}

export function CategoryBreakdown({ tree, currency, exchangeRate }: CategoryBreakdownProps) {
  if (tree.length === 0) return null

  return (
    <div className="space-y-4">
      {tree.map((node) => {
        const percent = node.totalBudget > 0
          ? (node.totalSpent / node.totalBudget) * 100
          : 0

        const color = getCategoryColor(node.item.name)

        return (
          <div
            key={node.item.id}
            className={cn("rounded-xl bg-card glass-card p-4 border-l-[3px]", color.border)}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn("h-2 w-2 rounded-full shrink-0", color.dot)} />
                <h4 className="text-sm font-bold truncate">{node.item.name}</h4>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {Math.round(percent)}%
              </span>
            </div>
            <ProgressBar value={node.totalSpent} max={node.totalBudget} />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground tabular-nums">
              <span>Spent: {formatCurrency(node.totalSpent, currency, exchangeRate)}</span>
              <span>Budget: {formatCurrency(node.totalBudget, currency, exchangeRate)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
