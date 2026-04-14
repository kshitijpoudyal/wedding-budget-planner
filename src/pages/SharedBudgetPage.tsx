import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Icon } from "@/components/ui/icon"
import { StatCard } from "@/components/ui/stat-card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { StatusBadge } from "@/components/ui/status-badge"
import { SectionHeading } from "@/components/ui/section-heading"
import { BudgetToolbar } from "@/components/budget/BudgetToolbar"
import { getSharedBudget } from "@/services/sharing"
import { formatCurrency } from "@/lib/currency"
import { getCategoryColor } from "@/lib/categoryColors"
import { cn } from "@/lib/utils"
import type { SharedBudgetSnapshot, SearchFilter } from "@/types"

type SnapItem = SharedBudgetSnapshot["items"][number]
type TreeNode = SnapItem & { children: TreeNode[]; totalBudget: number; totalSpent: number }

function buildTree(items: SharedBudgetSnapshot["items"]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  for (const item of items) {
    map.set(item.id, { ...item, children: [], totalBudget: item.budgetAmount, totalSpent: item.spentAmount })
  }
  const roots: TreeNode[] = []
  for (const node of map.values()) {
    const parent = node.parentId ? map.get(node.parentId) : null
    if (parent) parent.children.push(node)
    else roots.push(node)
  }
  // Compute totals bottom-up
  function computeTotals(node: TreeNode) {
    if (node.children.length === 0) return
    node.children.forEach(computeTotals)
    node.totalBudget = node.children.reduce((s, c) => s + c.totalBudget, 0)
    node.totalSpent = node.children.reduce((s, c) => s + c.totalSpent, 0)
  }
  roots.forEach(computeTotals)
  return roots
}

function sortTree(nodes: TreeNode[], sort: string): TreeNode[] {
  const items = [...nodes]
  if (sort.startsWith("budget")) return items.sort((a, b) => sort.endsWith("asc") ? a.totalBudget - b.totalBudget : b.totalBudget - a.totalBudget)
  if (sort.startsWith("alpha")) return items.sort((a, b) => sort.endsWith("asc") ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))
  return items
}

function filterTree(nodes: TreeNode[], query: string, filterBy: SearchFilter): TreeNode[] {
  if (!query.trim()) return nodes
  const q = query.toLowerCase()
  function matches(node: TreeNode): boolean {
    if (filterBy === "vendor") return node.vendorName?.toLowerCase().includes(q) ?? false
    if (filterBy === "name") return node.name.toLowerCase().includes(q)
    return node.name.toLowerCase().includes(q) || (node.vendorName?.toLowerCase().includes(q) ?? false)
  }
  function filterNode(node: TreeNode): TreeNode | null {
    const filteredChildren = node.children.map(filterNode).filter((c): c is TreeNode => c !== null)
    if (matches(node) || filteredChildren.length > 0) return { ...node, children: filteredChildren }
    return null
  }
  return nodes.map(filterNode).filter((n): n is TreeNode => n !== null)
}

// ── Read-only sub-item (matches BudgetSubItemCard visually) ──────────────────
function ReadOnlySubItem({ node, depth, currency, rate }: { node: TreeNode; depth: number; currency: "USD" | "NPR"; rate: number }) {
  const hasChildren = node.children.length > 0
  const effectiveCurrency = !hasChildren && node.itemCurrency ? node.itemCurrency : currency
  const effectiveRate = effectiveCurrency === "NPR" ? rate : 1

  return (
    <div className={cn(depth > 1 && "pl-4")}>
      <div className="rounded-xl p-3 md:p-4 bg-muted/40">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{node.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
              {formatCurrency(node.totalSpent, effectiveCurrency, effectiveRate)}
              {" / "}
              {formatCurrency(node.totalBudget, effectiveCurrency, effectiveRate)}
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
        <ProgressBar value={node.totalSpent} max={node.totalBudget} className="mt-2" />
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

// ── Read-only category card (matches BudgetCategoryCard visually) ────────────
function ReadOnlyCategoryCard({ node, sort, currency, rate }: { node: TreeNode; sort: string; currency: "USD" | "NPR"; rate: number }) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = node.children.length > 0
  const color = getCategoryColor(node.name)
  const effectiveCurrency = hasChildren ? currency : (node.itemCurrency ?? currency)
  const effectiveRate = effectiveCurrency === "NPR" ? rate : 1
  const sortedChildren = useMemo(() => sortTree(node.children, sort), [node.children, sort])

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-200 shadow-sm glass-card bg-card">
      <button type="button" className="w-full text-left p-5 md:p-6" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", color.dot)} />
              <h3 className="text-lg font-extrabold tracking-tight truncate">{node.name}</h3>
              <StatusBadge status={node.status} />
            </div>
            <div className="flex gap-4 mt-1.5 text-sm text-muted-foreground tabular-nums">
              <span>Budget: {formatCurrency(node.totalBudget, effectiveCurrency, effectiveRate)}</span>
              <span>Spent: {formatCurrency(node.totalSpent, effectiveCurrency, effectiveRate)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Icon name={expanded ? "expand_less" : "expand_more"} size="lg" className="text-muted-foreground" />
          </div>
        </div>
        <ProgressBar value={node.totalSpent} max={node.totalBudget} className="mt-3" />
      </button>

      {expanded && hasChildren && (
        <div className="px-5 pb-5 md:px-6 md:pb-6 space-y-2">
          {sortedChildren.map((child) => (
            <ReadOnlySubItem key={child.id} node={child} depth={1} currency={currency} rate={rate} />
          ))}
        </div>
      )}
      {expanded && !hasChildren && (
        <div className="px-5 pb-5 md:px-6 md:pb-6">
          <p className="text-sm text-muted-foreground italic text-center py-4">No sub-items.</p>
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

  // Toolbar state
  const [sort, setSort] = useState("budget-desc")
  const [search, setSearch] = useState("")
  const [searchFilter, setSearchFilter] = useState<SearchFilter>("all")

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

  const { currency, exchangeRate: rate } = snapshot.settings
  const tree = buildTree(snapshot.items)

  // Financial totals
  let grandBudget = 0, grandSpent = 0, finalizedBudget = 0, draftBudget = 0
  function sumLeaves(nodes: TreeNode[]) {
    for (const n of nodes) {
      if (n.children.length === 0) {
        grandBudget += n.budgetAmount
        grandSpent += n.spentAmount
        if (n.status === "finalized") finalizedBudget += n.budgetAmount
        else if (n.status === "draft") draftBudget += n.budgetAmount
      } else {
        sumLeaves(n.children)
      }
    }
  }
  sumLeaves(tree)
  const progress = grandBudget > 0 ? (grandSpent / grandBudget) * 100 : 0
  const fmt = (n: number) => formatCurrency(n, currency, currency === "NPR" ? rate : 1)

  const filteredTree = filterTree(tree, search, searchFilter)
  const sortedTree = sortTree(filteredTree, sort)

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

      <div className="p-4 md:p-6 space-y-8 max-w-4xl mx-auto">
        {/* Financial Overview — matches BudgetFinancialOverview */}
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
              <p className="text-sm font-semibold text-foreground">Overall Progress</p>
              <p className="text-sm font-bold tabular-nums text-muted-foreground">{Math.round(progress)}%</p>
            </div>
            <ProgressBar value={grandSpent} max={grandBudget} showLabel />
          </div>
        </section>

        {/* Budget list — matches BudgetCategoryList */}
        <section className="space-y-4">
          <SectionHeading title="The Curation" subtitle="Financial narratives for your celebration" />

          <BudgetToolbar
            search={search}
            onSearchChange={setSearch}
            searchFilter={searchFilter}
            onSearchFilterChange={setSearchFilter}
            sortValue={sort}
            onSortChange={setSort}
            selectionMode={false}
            onSelectionModeChange={() => {}}
            selectedCount={0}
            totalCount={tree.length}
            onSelectAll={() => {}}
            onClearSelection={() => {}}
            onAdd={() => {}}
            hasItems={tree.length > 0}
            readOnly
            className="sticky top-4 md:top-6 z-20"
          />

          {sortedTree.length === 0 && tree.length === 0 ? (
            <div className="rounded-xl bg-surface-container-low glass-surface p-8 md:p-12 text-center">
              <p className="text-lg text-muted-foreground italic">No budget items shared yet.</p>
            </div>
          ) : sortedTree.length === 0 ? (
            <div className="rounded-xl bg-surface-container-low glass-surface p-8 md:p-12 text-center">
              <Icon name="search_off" size="lg" className="text-muted-foreground mx-auto mb-2" />
              <p className="text-lg text-muted-foreground italic">No items match your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTree.map((node) => (
                <ReadOnlyCategoryCard key={node.id} node={node} sort={sort} currency={currency} rate={rate} />
              ))}
            </div>
          )}
        </section>

        <p className="text-center text-xs text-muted-foreground pb-4">
          Last updated: {new Date(snapshot.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
