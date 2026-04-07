import type { BudgetTreeNode } from "@/hooks/useBudgetTree"

const statusOrder: Record<string, number> = { draft: 0, finalized: 1, complete: 2 }

export function sortNodes(nodes: BudgetTreeNode[], sort: string): BudgetTreeNode[] {
  if (sort === "default") return nodes
  const items = [...nodes]
  switch (sort) {
    case "alpha-asc":
      return items.sort((a, b) => a.item.name.localeCompare(b.item.name))
    case "alpha-desc":
      return items.sort((a, b) => b.item.name.localeCompare(a.item.name))
    case "date-desc":
      return items.sort((a, b) => b.item.updatedAt.toMillis() - a.item.updatedAt.toMillis())
    case "date-asc":
      return items.sort((a, b) => a.item.updatedAt.toMillis() - b.item.updatedAt.toMillis())
    case "budget-desc":
      return items.sort((a, b) => b.totalBudget - a.totalBudget)
    case "budget-asc":
      return items.sort((a, b) => a.totalBudget - b.totalBudget)
    case "status":
      return items.sort(
        (a, b) => (statusOrder[a.item.status] ?? 9) - (statusOrder[b.item.status] ?? 9),
      )
    default:
      return items
  }
}
