import { useMemo, useState } from "react"
import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/ui/section-heading"
import { FilterBar } from "@/components/ui/filter-bar"
import { BudgetCategoryCard } from "./BudgetCategoryCard"
import type { BudgetTreeNode } from "@/hooks/useBudgetTree"

type BudgetCategoryListProps = {
  tree: BudgetTreeNode[]
  onEdit: (node: BudgetTreeNode) => void
  onAddChild: (parentId: string) => void
  onDelete: (id: string) => void
  deleteLoading: boolean
  onAddRoot: () => void
}

const statusOrder: Record<string, number> = { active: 0, pending: 1, closed: 2 }

export function BudgetCategoryList({
  tree,
  onEdit,
  onAddChild,
  onDelete,
  deleteLoading,
  onAddRoot,
}: BudgetCategoryListProps) {
  const [sort, setSort] = useState("default")

  const sortedTree = useMemo(() => {
    const items = [...tree]
    switch (sort) {
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
  }, [tree, sort])

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <SectionHeading title="The Curation" subtitle="Financial narratives for your celebration" />
        <Button onClick={onAddRoot} className="hidden md:inline-flex shrink-0">
          <Icon name="add" size="md" />
          <span className="ml-1">Add Item</span>
        </Button>
      </div>

      <FilterBar sortValue={sort} onSortChange={setSort} />

      {sortedTree.length === 0 ? (
        <div className="rounded-xl bg-surface-container-low p-8 md:p-12 text-center">
          <p className="font-heading text-lg text-muted-foreground italic">
            Your celebration awaits its first chapter.
          </p>
          <Button onClick={onAddRoot} className="mt-4">
            <Icon name="add" size="md" />
            <span className="ml-1">Add First Category</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTree.map((node) => (
            <BudgetCategoryCard
              key={node.item.id}
              node={node}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDelete={onDelete}
              deleteLoading={deleteLoading}
            />
          ))}
        </div>
      )}
    </section>
  )
}
