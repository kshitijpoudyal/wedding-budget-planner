import { SectionHeading } from "@/components/ui/section-heading"
import { StatCard } from "@/components/ui/stat-card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { formatCurrency } from "@/lib/currency"
import { useSettings } from "@/hooks/useSettings"

type BudgetFinancialOverviewProps = {
  totalBudget: number
  totalSpent: number
  progress: number
}

export function BudgetFinancialOverview({
  totalBudget,
  totalSpent,
  progress,
}: BudgetFinancialOverviewProps) {
  const { data: settings } = useSettings()
  const currency = settings?.currency ?? "NPR"
  const rate = settings?.exchangeRate ?? 1

  return (
    <section className="space-y-4">
      <SectionHeading title="Financial Overview" subtitle="The Wedding Budget" />
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total Estimated"
          value={formatCurrency(totalBudget, currency, rate)}
          icon="payments"
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
