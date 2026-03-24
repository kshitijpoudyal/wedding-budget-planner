import { ProgressBar } from "@/components/ui/progress-bar"
import { formatCurrency } from "@/lib/currency"
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

        return (
          <div
            key={node.item.id}
            className="rounded-xl bg-card p-4 shadow-[0_20px_40px_rgba(128,82,83,0.06)] dark:shadow-none dark:bg-surface-container-low"
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-heading text-sm font-bold truncate">{node.item.name}</h4>
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
