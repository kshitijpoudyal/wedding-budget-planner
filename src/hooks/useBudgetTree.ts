import { useMemo } from "react"
import { useBudgetItems } from "./useBudgetItems"
import type { BudgetItem } from "@/types"

export type BudgetTreeNode = {
  item: BudgetItem
  children: BudgetTreeNode[]
  totalBudget: number
  totalSpent: number
  isLeaf: boolean
}

function buildTree(items: BudgetItem[], parentId: string | null): BudgetTreeNode[] {
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

      return { item, children, totalBudget, totalSpent, isLeaf }
    })
}

export function useBudgetTree() {
  const { data: items, ...rest } = useBudgetItems()

  const tree = useMemo(() => {
    if (!items) return []
    return buildTree(items, null)
  }, [items])

  const grandTotalBudget = useMemo(
    () => tree.reduce((sum, node) => sum + node.totalBudget, 0),
    [tree],
  )

  const grandTotalSpent = useMemo(
    () => tree.reduce((sum, node) => sum + node.totalSpent, 0),
    [tree],
  )

  // Status-based budget totals
  const { finalizedBudget, draftBudget, completeBudget } = useMemo(() => {
    let finalized = 0
    let draft = 0
    let complete = 0
    function sumByStatus(nodes: BudgetTreeNode[]) {
      for (const node of nodes) {
        if (node.isLeaf) {
          if (node.item.status === "finalized") {
            finalized += node.item.budgetAmount
          } else if (node.item.status === "complete") {
            complete += node.item.budgetAmount
          } else {
            draft += node.item.budgetAmount
          }
        } else {
          sumByStatus(node.children)
        }
      }
    }
    sumByStatus(tree)
    return { finalizedBudget: finalized, draftBudget: draft, completeBudget: complete }
  }, [tree])

  return {
    tree,
    grandTotalBudget,
    grandTotalSpent,
    finalizedBudget,
    draftBudget,
    completeBudget,
    remaining: grandTotalBudget - grandTotalSpent,
    progress: grandTotalBudget > 0 ? (grandTotalSpent / grandTotalBudget) * 100 : 0,
    ...rest,
  }
}
