import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Icon } from "@/components/ui/icon"
import { StatCard } from "@/components/ui/stat-card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { StatusBadge } from "@/components/ui/status-badge"
import { SectionHeading } from "@/components/ui/section-heading"
import { getSharedBudget } from "@/services/sharing"
import { formatCurrency } from "@/lib/currency"
import { getCategoryColor } from "@/lib/categoryColors"
import { cn } from "@/lib/utils"
import type { SharedBudgetSnapshot } from "@/types"

type SnapshotItem = SharedBudgetSnapshot["items"][number]

type TreeNode = SnapshotItem & { children: TreeNode[] }

function buildTree(items: SharedBudgetSnapshot["items"]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  for (const item of items) map.set(item.id, { ...item, children: [] })
  const roots: TreeNode[] = []
  for (const node of map.values()) {
    const parent = node.parentId ? map.get(node.parentId) : null
    if (parent) parent.children.push(node)
    else roots.push(node)
  }
  return roots
}

function sumTree(node: TreeNode): { budget: number; spent: number } {
  if (node.children.length === 0) return { budget: node.budgetAmount, spent: node.spentAmount }
  return node.children.reduce(
    (acc, child) => {
      const { budget, spent } = sumTree(child)
      return { budget: acc.budget + budget, spent: acc.spent + spent }
    },
    { budget: 0, spent: 0 },
  )
}

// ── Read-only sub-item card ───────────────────────────────────────────────────
function ReadOnlySubItem({
  node,
  depth,
  currency,
  rate,
}: {
  node: TreeNode
  depth: number
  currency: "USD" | "NPR"
  rate: number
}) {
  const hasChildren = node.children.length > 0
  const { budget, spent } = sumTree(node)
  const effectiveCurrency = !hasChildren && node.itemCurrency ? node.itemCurrency : currency
  const effectiveRate = effectiveCurrency === "NPR" ? rate : 1

  return (
    <div className={cn(depth > 1 && "pl-4")}>
      <div className="rounded-xl p-3 md:p-4 bg-muted/40">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{node.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
              {formatCurrency(spent, effectiveCurrency, effectiveRate)}
              {" / "}
              {formatCurrency(budget, effectiveCurrency, effectiveRate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <StatusBadge status={node.status} />
          {node.vendorName && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground max-w-[140px] truncate">
              <Icon name="store" size="sm" />
              {node.vendorName}
            </span>
          )}
        </div>
        <ProgressBar value={spent} max={budget} className="mt-2" />
      </div>
      {hasChildren && (
        <div className="mt-2 space-y-2">
          {node.children.map((child) => (
            <ReadOnlySubItem key={child.id} node={child} depth={depth + 1} currency={currency} rate={rate} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Read-only category card ───────────────────────────────────────────────────
function ReadOnlyCategoryCard({
  node,
  currency,
  rate,
}: {
  node: TreeNode
  currency: "USD" | "NPR"
  rate: number
}) {
  const [expanded, setExpanded] = useState(false)
  const { budget, spent } = sumTree(node)
  const hasChildren = node.children.length > 0
  const color = getCategoryColor(node.name)

  return (
    <div className={cn("rounded-2xl overflow-hidden shadow-sm glass-card bg-card border-l-4", color.border)}>
      <button type="button" className="w-full text-left p-5 md:p-6" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", color.dot)} />
              <h3 className="text-lg font-extrabold tracking-tight truncate">{node.name}</h3>
              <StatusBadge status={node.status} />
            </div>
            <div className="flex gap-4 mt-1.5 text-sm text-muted-foreground tabular-nums">
              <span>Budget: {formatCurrency(budget, currency, currency === "NPR" ? rate : 1)}</span>
              <span>Spent: {formatCurrency(spent, currency, currency === "NPR" ? rate : 1)}</span>
            </div>
          </div>
          {hasChildren && (
            <Icon name={expanded ? "expand_less" : "expand_more"} size="lg" className="text-muted-foreground shrink-0" />
          )}
        </div>
        <ProgressBar value={spent} max={budget} className="mt-3" />
      </button>

      {expanded && hasChildren && (
        <div className="px-5 pb-5 md:px-6 md:pb-6 space-y-2">
          {node.children.map((child) => (
            <ReadOnlySubItem key={child.id} node={child} depth={1} currency={currency} rate={rate} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SharedBudgetPage() {
  const { token } = useParams<{ token: string }>()
  const [snapshot, setSnapshot] = useState<SharedBudgetSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return }
    getSharedBudget(token)
      .then((data) => { if (!data) setNotFound(true); else setSnapshot(data) })
      .catch(() => setNotFound(true))
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
  const rate = exchangeRate
  const tree = buildTree(snapshot.items)

  let grandBudget = 0, grandSpent = 0, finalizedBudget = 0, draftBudget = 0
  for (const node of tree) {
    const { budget, spent } = sumTree(node)
    grandBudget += budget
    grandSpent += spent
    if (node.status === "finalized" || node.status === "complete") finalizedBudget += budget
    if (node.status === "draft") draftBudget += budget
  }

  const progress = grandBudget > 0 ? (grandSpent / grandBudget) * 100 : 0
  const remaining = grandBudget - grandSpent
  const fmt = (n: number) => formatCurrency(n, currency, currency === "NPR" ? rate : 1)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/40 px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="favorite" size="sm" className="text-primary" />
          </div>
          <span className="text-sm font-bold tracking-tight">Wedding Budget</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">
            Updated {new Date(snapshot.updatedAt).toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <Icon name="lock" size="sm" />
            View only
          </span>
        </div>
      </div>

      <div className="p-5 md:p-8 space-y-10 max-w-4xl mx-auto">
        {/* Financial Overview */}
        <section className="space-y-5">
          <SectionHeading title="Financial Overview" subtitle="The Wedding Budget" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total Estimate" value={fmt(grandBudget)} icon="payments" iconClassName="text-primary" iconBg="bg-primary/10" />
            <StatCard label="Finalized" value={fmt(finalizedBudget)} icon="check_circle" iconClassName="text-emerald-600 dark:text-emerald-400" iconBg="bg-emerald-500/10" />
            <StatCard label="Draft" value={fmt(draftBudget)} icon="edit_note" iconClassName="text-amber-600 dark:text-amber-400" iconBg="bg-amber-500/10" />
            <StatCard label="Spent So Far" value={fmt(grandSpent)} icon="trending_up" variant={progress > 100 ? "danger" : "default"} iconClassName="text-tertiary" iconBg={progress > 100 ? "bg-destructive/10" : "bg-tertiary/10"} />
          </div>
          <div className="rounded-2xl bg-card glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Overall Progress</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground tabular-nums">
                <span>Remaining: <span className={cn("font-bold", remaining < 0 && "text-destructive")}>{fmt(remaining)}</span></span>
                <span className="font-bold">{Math.round(progress)}%</span>
              </div>
            </div>
            <ProgressBar value={grandSpent} max={grandBudget} showLabel />
          </div>
        </section>

        {/* Budget Categories */}
        {tree.length > 0 && (
          <section className="space-y-4">
            <SectionHeading title="Budget Categories" subtitle="Tap a category to expand" />
            <div className="space-y-3">
              {tree.map((node) => (
                <ReadOnlyCategoryCard key={node.id} node={node} currency={currency} rate={rate} />
              ))}
            </div>
          </section>
        )}

        <p className="text-center text-xs text-muted-foreground pb-4">
          Last updated: {new Date(snapshot.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
