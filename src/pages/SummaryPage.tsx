import { SectionHeading } from "@/components/ui/section-heading"
import { StatCard } from "@/components/ui/stat-card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { QuoteBlock } from "@/components/ui/quote-block"
import { CategoryBreakdown } from "@/components/summary/CategoryBreakdown"
import { useBudgetTree } from "@/hooks/useBudgetTree"
import { useSettings } from "@/hooks/useSettings"
import { formatCurrency } from "@/lib/currency"

export default function SummaryPage() {
  const { tree, grandTotalBudget, grandTotalSpent, remaining, progress, isLoading } =
    useBudgetTree()
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

      {/* Top-level stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard
          label="Total Budget"
          value={formatCurrency(grandTotalBudget, currency, rate)}
          icon="payments"
        />
        <StatCard
          label="Total Spent"
          value={formatCurrency(grandTotalSpent, currency, rate)}
          icon="trending_up"
          variant={progress > 100 ? "danger" : "default"}
        />
        <StatCard
          label="Remaining"
          value={formatCurrency(remaining, currency, rate)}
          icon="savings"
          variant={remaining < 0 ? "danger" : "default"}
        />
      </div>

      {/* Overall progress */}
      <div className="rounded-xl bg-card p-4 shadow-[0_20px_40px_rgba(128,82,83,0.06)] dark:shadow-none dark:bg-surface-container-low">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Overall Progress</p>
          <p className="text-sm font-heading font-bold tabular-nums">{Math.round(progress)}%</p>
        </div>
        <ProgressBar value={grandTotalSpent} max={grandTotalBudget} />
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
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Active"
              value={String(statusCounts.active || 0)}
              icon="check_circle"
            />
            <StatCard
              label="Pending"
              value={String(statusCounts.pending || 0)}
              icon="schedule"
            />
            <StatCard
              label="Closed"
              value={String(statusCounts.closed || 0)}
              icon="lock"
            />
          </div>
        </section>
      )}

      {tree.length === 0 && (
        <div className="rounded-xl bg-surface-container-low p-8 md:p-12 text-center">
          <p className="font-heading text-lg text-muted-foreground italic">
            Add budget items to see your summary here.
          </p>
        </div>
      )}

      <QuoteBlock
        quote="Beware of little expenses; a small leak will sink a great ship."
        attribution="Benjamin Franklin"
      />
    </div>
  )
}
