import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Icon } from "@/components/ui/icon"
import { StatCard } from "@/components/ui/stat-card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { SectionHeading } from "@/components/ui/section-heading"
import { getSharedBudget } from "@/services/sharing"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import type { SharedBudgetSnapshot } from "@/types"

type SimpleNode = {
  id: string
  name: string
  budgetAmount: number
  spentAmount: number
  status: "draft" | "finalized" | "complete"
  vendorName: string | null
  children: SimpleNode[]
}

function buildTree(items: SharedBudgetSnapshot["items"]): SimpleNode[] {
  const map = new Map<string, SimpleNode>()
  for (const item of items) {
    map.set(item.id, { ...item, children: [] })
  }
  const roots: SimpleNode[] = []
  for (const node of map.values()) {
    const raw = items.find((i) => i.id === node.id)!
    if (raw.parentId && map.has(raw.parentId)) {
      map.get(raw.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

function sumTree(node: SimpleNode): { budget: number; spent: number } {
  if (node.children.length === 0) return { budget: node.budgetAmount, spent: node.spentAmount }
  return node.children.reduce(
    (acc, child) => {
      const { budget, spent } = sumTree(child)
      return { budget: acc.budget + budget, spent: acc.spent + spent }
    },
    { budget: 0, spent: 0 },
  )
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  finalized: "bg-primary/10 text-primary",
  complete: "bg-emerald-500/10 text-emerald-600",
}

const PROGRESS_DOT_COLORS = [
  "bg-blue-500", "bg-orange-500", "bg-emerald-500", "bg-violet-500",
  "bg-rose-500", "bg-amber-500", "bg-teal-500", "bg-fuchsia-500",
]

export default function SharedBudgetPage() {
  const { token } = useParams<{ token: string }>()
  const [snapshot, setSnapshot] = useState<SharedBudgetSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return }
    getSharedBudget(token).then((data) => {
      if (!data) setNotFound(true)
      else setSnapshot(data)
    }).catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading budget...</p>
      </div>
    )
  }

  if (notFound || !snapshot) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 p-8 text-center">
        <Icon name="link_off" size="xl" className="text-muted-foreground" />
        <p className="font-semibold text-lg">Link not found</p>
        <p className="text-sm text-muted-foreground">This budget is no longer being shared, or the link is invalid.</p>
      </div>
    )
  }

  const { currency, exchangeRate } = snapshot.settings
  const tree = buildTree(snapshot.items)

  // Compute top-level totals
  let grandBudget = 0
  let grandSpent = 0
  let finalizedBudget = 0

  for (const node of tree) {
    const { budget, spent } = sumTree(node)
    grandBudget += budget
    grandSpent += spent
    if (node.status === "finalized" || node.status === "complete") {
      finalizedBudget += budget
    }
  }

  const progress = grandBudget > 0 ? (grandSpent / grandBudget) * 100 : 0
  const remaining = grandBudget - grandSpent

  const updatedAt = new Date(snapshot.updatedAt).toLocaleString()

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/40 px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="favorite" size="sm" className="text-primary" />
          </div>
          <span className="text-sm font-bold tracking-tight">Wedding Budget</span>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:block">
          Read-only · Updated {updatedAt}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          View only
        </span>
      </div>

      <div className="p-5 md:p-8 space-y-10 max-w-4xl mx-auto">
        <SectionHeading title="The Overview" subtitle="Your celebration at a glance" />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard
            label="Total Budget"
            value={formatCurrency(grandBudget, currency, exchangeRate)}
            icon="payments"
            iconClassName="text-primary"
            iconBg="bg-primary/10"
          />
          <StatCard
            label="Total Spent"
            value={formatCurrency(grandSpent, currency, exchangeRate)}
            icon="trending_up"
            variant={progress > 100 ? "danger" : "default"}
            iconClassName="text-tertiary"
            iconBg={progress > 100 ? "bg-destructive/10" : "bg-tertiary/10"}
          />
          <StatCard
            label="Remaining"
            value={formatCurrency(remaining, currency, exchangeRate)}
            icon="savings"
            variant={remaining < 0 ? "danger" : "default"}
            iconClassName="text-emerald-600 dark:text-emerald-400"
            iconBg="bg-emerald-500/10"
            className="col-span-2 md:col-span-1"
          />
        </div>

        {/* Progress bar */}
        <div className="rounded-2xl bg-card glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">Overall Progress</p>
            <p className="text-sm font-bold tabular-nums text-muted-foreground">{Math.round(progress)}%</p>
          </div>
          <ProgressBar value={grandSpent} max={grandBudget} />
        </div>

        {/* Category breakdown */}
        {tree.length > 0 && (
          <section className="space-y-4">
            <SectionHeading title="By Category" subtitle="Budget vs. spent per category" />
            <div className="space-y-3">
              {tree.map((node, i) => {
                const { budget, spent } = sumTree(node)
                const pct = budget > 0 ? (spent / budget) * 100 : 0
                const dot = PROGRESS_DOT_COLORS[i % PROGRESS_DOT_COLORS.length]
                return (
                  <div key={node.id} className="rounded-2xl bg-card glass-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", dot)} />
                        <p className="text-sm font-bold truncate">{node.name}</p>
                        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest", STATUS_COLORS[node.status] ?? STATUS_COLORS.draft)}>
                          {node.status}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                        {Math.round(pct)}%
                      </span>
                    </div>
                    <ProgressBar value={spent} max={budget} />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground tabular-nums">
                      <span>Spent: {formatCurrency(spent, currency, exchangeRate)}</span>
                      <span>Budget: {formatCurrency(budget, currency, exchangeRate)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <p className="text-center text-xs text-muted-foreground pb-4">
          Last updated: {updatedAt}
        </p>
      </div>
    </div>
  )
}
