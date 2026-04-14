import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { Icon } from "@/components/ui/icon"
import { BudgetFinancialOverview } from "@/components/budget/BudgetFinancialOverview"
import { BudgetCategoryList } from "@/components/budget/BudgetCategoryList"
import { getSharedBudget } from "@/services/sharing"
import type { SharedBudgetSnapshot, Settings } from "@/types"
import type { BudgetTreeNode } from "@/hooks/useBudgetTree"
import type { BudgetItem } from "@/types"
import type { Timestamp } from "firebase/firestore"

// Convert flat snapshot items into a BudgetTreeNode tree
function buildTree(items: SharedBudgetSnapshot["items"]): BudgetTreeNode[] {
  const fakeTimestamp = { toMillis: () => 0, toDate: () => new Date(0), seconds: 0, nanoseconds: 0 } as unknown as Timestamp

  const map = new Map<string, BudgetTreeNode>()
  for (const item of items) {
    const budgetItem: BudgetItem = {
      id: item.id,
      name: item.name,
      budgetAmount: item.budgetAmount,
      spentAmount: item.spentAmount,
      parentId: item.parentId,
      status: item.status,
      itemCurrency: item.itemCurrency,
      vendorName: item.vendorName,
      notes: null,
      vendorContact: null,
      dueDate: null,
      paidDate: null,
      currencyRate: null,
      createdAt: fakeTimestamp,
      updatedAt: fakeTimestamp,
    }
    map.set(item.id, { item: budgetItem, children: [], totalBudget: item.budgetAmount, totalSpent: item.spentAmount, isLeaf: true })
  }

  const roots: BudgetTreeNode[] = []
  for (const node of map.values()) {
    const parent = node.item.parentId ? map.get(node.item.parentId) : null
    if (parent) parent.children.push(node)
    else roots.push(node)
  }

  function computeTotals(node: BudgetTreeNode) {
    if (node.children.length === 0) { node.isLeaf = true; return }
    node.isLeaf = false
    node.children.forEach(computeTotals)
    node.totalBudget = node.children.reduce((s, c) => s + c.totalBudget, 0)
    node.totalSpent = node.children.reduce((s, c) => s + c.totalSpent, 0)
  }
  roots.forEach(computeTotals)
  return roots
}

function computeOverviewTotals(tree: BudgetTreeNode[]) {
  let grandBudget = 0, grandSpent = 0, finalizedBudget = 0, draftBudget = 0

  function walk(nodes: BudgetTreeNode[]) {
    for (const node of nodes) {
      if (node.isLeaf) {
        grandBudget += node.item.budgetAmount
        grandSpent += node.item.spentAmount
        if (node.item.status === "finalized") finalizedBudget += node.item.budgetAmount
        else if (node.item.status === "draft") draftBudget += node.item.budgetAmount
      } else {
        walk(node.children)
      }
    }
  }
  walk(tree)
  return { grandBudget, grandSpent, finalizedBudget, draftBudget }
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
          // Seed snapshot settings into the query cache so useSettings()
          // inside child components returns the correct currency/rate
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

  const tree = buildTree(snapshot.items)
  const { grandBudget, grandSpent, finalizedBudget, draftBudget } = computeOverviewTotals(tree)
  const progress = grandBudget > 0 ? (grandSpent / grandBudget) * 100 : 0

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
        <BudgetFinancialOverview
          totalBudget={grandBudget}
          totalSpent={grandSpent}
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
      </div>
    </div>
  )
}
