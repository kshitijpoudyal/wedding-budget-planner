import { SectionHeading } from "@/components/ui/section-heading"
import { StatCard } from "@/components/ui/stat-card"
import { formatCurrency } from "@/lib/currency"
import { useSettings } from "@/hooks/useSettings"

type BudgetFinancialOverviewProps = {
  totalBudget: number
  totalSpent: number
  finalizedBudget: number
  draftBudget: number
  progress: number
  readOnly?: boolean
}

export function BudgetFinancialOverview({
  totalBudget,
  totalSpent,
  finalizedBudget,
  draftBudget,
  progress,
  readOnly = false,
}: BudgetFinancialOverviewProps) {
  const { data: settings } = useSettings()
  const currency = settings?.currency ?? "USD"
  const rate = settings?.exchangeRate ?? 1

  return (
    <section className="space-y-5">
      <SectionHeading title="Financial Overview" subtitle="The Wedding Budget" />
      <div className={readOnly ? "grid grid-cols-2 gap-3" : "grid grid-cols-2 md:grid-cols-4 gap-3"}>
        {!readOnly && (
          <StatCard
            label="Total Estimate"
            value={formatCurrency(totalBudget, currency, rate)}
            icon="payments"
            iconClassName="text-primary"
            iconBg="bg-primary/10"
          />
        )}
        <StatCard
          label="Finalized"
          value={formatCurrency(finalizedBudget, currency, rate)}
          icon="check_circle"
          iconClassName="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        {!readOnly && (
          <StatCard
            label="Draft"
            value={formatCurrency(draftBudget, currency, rate)}
            icon="edit_note"
            iconClassName="text-amber-600 dark:text-amber-400"
            iconBg="bg-amber-500/10"
          />
        )}
        <StatCard
          label="Spent So Far"
          value={formatCurrency(totalSpent, currency, rate)}
          icon="trending_up"
          variant={progress > 100 ? "danger" : "default"}
          iconClassName="text-tertiary"
          iconBg={progress > 100 ? "bg-destructive/10" : "bg-tertiary/10"}
        />
      </div>
    </section>
  )
}
