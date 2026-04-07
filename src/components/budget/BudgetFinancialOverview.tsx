import { SectionHeading } from "@/components/ui/section-heading"
import { StatCard } from "@/components/ui/stat-card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { formatCurrency } from "@/lib/currency"
import { useSettings } from "@/hooks/useSettings"

type BudgetFinancialOverviewProps = {
  totalBudget: number
  totalSpent: number
  finalizedBudget: number
  draftBudget: number
  progress: number
}

export function BudgetFinancialOverview({
  totalBudget,
  totalSpent,
  finalizedBudget,
  draftBudget,
  progress,
}: BudgetFinancialOverviewProps) {
  const { data: settings } = useSettings()
  const currency = settings?.currency ?? "USD"
  const rate = settings?.exchangeRate ?? 1

  return (
    <section className="space-y-4">
      <SectionHeading title="Financial Overview" subtitle="The Wedding Budget" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Estimate"
          value={formatCurrency(totalBudget, currency, rate)}
          icon="payments"
        />
        <StatCard
          label="Finalized"
          value={formatCurrency(finalizedBudget, currency, rate)}
          icon="check_circle"
        />
        <StatCard
          label="Draft"
          value={formatCurrency(draftBudget, currency, rate)}
          icon="edit_note"
        />
        <StatCard
          label="Spent So Far"
          value={formatCurrency(totalSpent, currency, rate)}
          icon="trending_up"
          variant={progress > 100 ? "danger" : "default"}
        />
      </div>
      <ProgressBar value={totalSpent} max={totalBudget} showLabel />
    </section>
  )
}
