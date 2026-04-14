import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { Icon } from "@/components/ui/icon"
import { BudgetFinancialOverview } from "@/components/budget/BudgetFinancialOverview"
import { BudgetCategoryList } from "@/components/budget/BudgetCategoryList"
import { QuoteBlock } from "@/components/ui/quote-block"
import { getSharedBudget } from "@/services/sharing"
import type { BudgetItem, Settings, SharedBudgetSnapshot, SnapshotItem } from "@/types"
import type { BudgetTreeNode } from "@/hooks/useBudgetTree"
import type { Timestamp } from "firebase/firestore"

const FAKE_TS = { toMillis: () => 0, toDate: () => new Date(0), seconds: 0, nanoseconds: 0 } as unknown as Timestamp

function toItem(s: SnapshotItem): BudgetItem {
  return { ...s, createdAt: s.createdAt ?? FAKE_TS, updatedAt: s.updatedAt ?? FAKE_TS }
}

// Exact same logic as useBudgetTree.ts
function buildTree(items: SnapshotItem[], parentId: string | null): BudgetTreeNode[] {
  return items
    .filter((item) => item.parentId === parentId)
    .map((item) => {
      const children = buildTree(items, item.id)
      const isLeaf = children.length === 0
      const totalBudget = isLeaf
        ? item.budgetAmount
        : children.reduce((sum, child) => sum + child.totalBudget, 0)
      const totalSpent = isLeaf
        ? item.spentAmount
        : children.reduce((sum, child) => sum + child.totalSpent, 0)
      return { item: toItem(item), children, totalBudget, totalSpent, isLeaf }
    })
}

function computeStats(tree: BudgetTreeNode[]) {
  const grandTotalBudget = tree.reduce((s, n) => s + n.totalBudget, 0)
  const grandTotalSpent = tree.reduce((s, n) => s + n.totalSpent, 0)
  let finalizedBudget = 0
  let draftBudget = 0

  function sumByStatus(nodes: BudgetTreeNode[]) {
    for (const node of nodes) {
      if (node.isLeaf) {
        if (node.item.status === "finalized") finalizedBudget += node.item.budgetAmount
        else if (node.item.status === "complete") { /* included in finalized display */ }
        else draftBudget += node.item.budgetAmount
      } else {
        sumByStatus(node.children)
      }
    }
  }
  sumByStatus(tree)

  const progress = grandTotalBudget > 0 ? (grandTotalSpent / grandTotalBudget) * 100 : 0
  return { grandTotalBudget, grandTotalSpent, finalizedBudget, draftBudget, progress }
}

const NOOP = () => {}

export default function SharedBudgetPage() {
  const { token } = useParams<{ token: string }>()
  const queryClient = useQueryClient()
  const [snapshot, setSnapshot] = useState<SharedBudgetSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return }
    getSharedBudget(token)
      .then((data) => {
        if (!data) {
          setNotFound(true)
        } else {
          const settings: Settings = {
            currency: data.settings.currency,
            exchangeRate: data.settings.exchangeRate,
            lockRate: false,
            sharingEnabled: false,
          }
          queryClient.setQueryData(["settings", null], settings)
          setSnapshot(data)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [token, queryClient])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
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

  const tree = buildTree(snapshot.items, null)
  const { grandTotalBudget, grandTotalSpent, finalizedBudget, draftBudget, progress } = computeStats(tree)

  return (
    <div className="min-h-screen bg-background">
      {/* View-only banner */}
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

      {/* Exact same layout as BudgetPage */}
      <div className="p-4 md:p-6 space-y-8 max-w-4xl mx-auto">
        <BudgetFinancialOverview
          totalBudget={grandTotalBudget}
          totalSpent={grandTotalSpent}
          finalizedBudget={finalizedBudget}
          draftBudget={draftBudget}
          progress={progress}
          readOnly
        />

        <BudgetCategoryList
          tree={tree}
          onEdit={NOOP}
          onAddChild={NOOP}
          onDelete={NOOP}
          deleteLoading={false}
          onAddRoot={NOOP}
          onBulkStatusChange={NOOP}
          readOnly
        />

        <QuoteBlock />
      </div>
    </div>
  )
}
