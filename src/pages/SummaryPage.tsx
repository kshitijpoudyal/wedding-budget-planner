import { Icon } from "@/components/ui/icon"
import { SectionHeading } from "@/components/ui/section-heading"
import { StatCard } from "@/components/ui/stat-card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { QuoteBlock } from "@/components/ui/quote-block"
import { CategoryBreakdown } from "@/components/summary/CategoryBreakdown"
import { useBudgetTree } from "@/hooks/useBudgetTree"
import { useSettings } from "@/hooks/useSettings"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import type { BudgetTreeNode } from "@/hooks/useBudgetTree"

// Helper to collect all leaf nodes (items without children)
function collectLeafNodes(nodes: BudgetTreeNode[]): BudgetTreeNode[] {
  const leaves: BudgetTreeNode[] = []
  function traverse(node: BudgetTreeNode) {
    if (node.children.length === 0) {
      leaves.push(node)
    } else {
      node.children.forEach(traverse)
    }
  }
  nodes.forEach(traverse)
  return leaves
}

export default function SummaryPage() {
  const { tree, grandTotalSpent, finalizedBudget, isLoading } =
    useBudgetTree()
  const finalizedRemaining = finalizedBudget - grandTotalSpent
  const finalizedProgress = finalizedBudget > 0 ? (grandTotalSpent / finalizedBudget) * 100 : 0
  const { data: settings } = useSettings()
  const currency = settings?.currency ?? "USD"
  const rate = settings?.exchangeRate ?? 1

  // Status grouping
  const statusCounts = tree.reduce(
    (acc, node) => {
      acc[node.item.status] = (acc[node.item.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading summary...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-4xl mx-auto">
      <SectionHeading title="The Overview" subtitle="Your celebration at a glance" />

      {/* Top-level stats — finalized only */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard
          label="Finalized Budget"
          value={formatCurrency(finalizedBudget, currency, rate)}
          icon="check_circle"
        />
        <StatCard
          label="Total Spent"
          value={formatCurrency(grandTotalSpent, currency, rate)}
          icon="trending_up"
          variant={finalizedProgress > 100 ? "danger" : "default"}
        />
        <StatCard
          label="Remaining"
          value={formatCurrency(finalizedRemaining, currency, rate)}
          icon="savings"
          variant={finalizedRemaining < 0 ? "danger" : "default"}
        />
      </div>

      {/* Overall progress */}
      <div className="rounded-xl bg-card glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Overall Progress</p>
          <p className="text-sm font-bold tabular-nums">{Math.round(finalizedProgress)}%</p>
        </div>
        <ProgressBar value={grandTotalSpent} max={finalizedBudget} />
      </div>

      {/* Category breakdown */}
      {tree.length > 0 && (
        <section className="space-y-4">
          <SectionHeading title="By Category" subtitle="Budget vs. spent per category" />
          <CategoryBreakdown tree={tree} currency={currency} exchangeRate={rate} />
        </section>
      )}

      {/* Status summary */}
      {tree.length > 0 && (
        <section className="space-y-4">
          <SectionHeading title="By Status" />
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Draft"
              value={String(statusCounts.draft || 0)}
              icon="edit_note"
            />
            <StatCard
              label="Finalized"
              value={String(statusCounts.finalized || 0)}
              icon="check_circle"
            />
          </div>
        </section>
      )}

      {tree.length === 0 && (
        <div className="rounded-xl bg-surface-container-low glass-surface p-8 md:p-12 text-center">
          <p className="text-lg text-muted-foreground italic">
            Add budget items to see your summary here.
          </p>
        </div>
      )}

      {/* Estimate vs Actual - Items with significant variance */}
      {tree.length > 0 && (() => {
        const leaves = collectLeafNodes(tree)
        // Filter items with >10% variance where both budget and spent are > 0
        const varianceItems = leaves
          .filter((node) => {
            const { budgetAmount, spentAmount } = node.item
            if (budgetAmount <= 0 || spentAmount <= 0) return false
            const variance = Math.abs((spentAmount - budgetAmount) / budgetAmount)
            return variance > 0.1 // More than 10% difference
          })
          .map((node) => ({
            ...node,
            variance: node.item.spentAmount - node.item.budgetAmount,
            variancePercent: ((node.item.spentAmount - node.item.budgetAmount) / node.item.budgetAmount) * 100,
          }))
          .sort((a, b) => Math.abs(b.variancePercent) - Math.abs(a.variancePercent))
          .slice(0, 5) // Top 5 variances

        if (varianceItems.length === 0) return null

        return (
          <section className="space-y-4">
            <SectionHeading title="Estimate vs Actual" subtitle="Items with significant variance" />
            <div className="space-y-2">
              {varianceItems.map((item) => (
                <div
                  key={item.item.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-surface-container-low glass-surface p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{item.item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Budget: {formatCurrency(item.item.budgetAmount, currency, rate)} →
                      Actual: {formatCurrency(item.item.spentAmount, currency, rate)}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium shrink-0",
                      item.variance > 0 ? "text-error" : "text-success"
                    )}
                  >
                    <Icon
                      name={item.variance > 0 ? "trending_up" : "trending_down"}
                      size="sm"
                    />
                    <span>
                      {item.variance > 0 ? "+" : ""}
                      {Math.round(item.variancePercent)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })()}

      <QuoteBlock
        quote="Beware of little expenses; a small leak will sink a great ship."
        attribution="Benjamin Franklin"
      />
    </div>
  )
}
