import { useMemo, useState } from "react"
import { Icon } from "@/components/ui/icon"
import { ProgressBar } from "@/components/ui/progress-bar"
import { StatusBadge } from "@/components/ui/status-badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { BudgetSubItemCard } from "./BudgetSubItemCard"
import { CategoryActionMenu } from "./CategoryActionMenu"
import { sortNodes } from "./sortNodes"
import { formatCurrency } from "@/lib/currency"
import { useSettings } from "@/hooks/useSettings"
import type { BudgetTreeNode } from "@/hooks/useBudgetTree"

type BudgetCategoryCardProps = {
  node: BudgetTreeNode
  sort: string
  onEdit: (node: BudgetTreeNode) => void
  onAddChild: (parentId: string) => void
  onDelete: (id: string) => void
  deleteLoading: boolean
}

export function BudgetCategoryCard({
  node,
  sort,
  onEdit,
  onAddChild,
  onDelete,
  deleteLoading,
}: BudgetCategoryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { data: settings } = useSettings()
  const currency = settings?.currency ?? "USD"
  const rate = settings?.exchangeRate ?? 1

  const { item, children, totalBudget, totalSpent } = node
  const hasChildren = children.length > 0
  const sortedChildren = useMemo(() => sortNodes(children, sort), [children, sort])

  return (
    <div className="rounded-xl bg-card shadow-[0_20px_40px_rgba(128,82,83,0.06)] dark:shadow-none dark:bg-surface-container-low overflow-hidden transition-all duration-200">
      <button
        type="button"
        className="w-full text-left p-4 md:p-5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-lg font-bold truncate">{item.name}</h3>
              <StatusBadge status={item.status} />
            </div>
            <div className="flex gap-4 mt-1.5 text-sm text-muted-foreground tabular-nums">
              <span>Budget: {formatCurrency(totalBudget, currency, rate)}</span>
              <span>Spent: {formatCurrency(totalSpent, currency, rate)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <div onClick={(e) => e.stopPropagation()}>
              <CategoryActionMenu
                onEdit={() => onEdit(node)}
                onAddChild={() => onAddChild(item.id)}
                onDelete={() => setShowDeleteConfirm(true)}
              />
            </div>
            <Icon
              name={expanded ? "expand_less" : "expand_more"}
              size="lg"
              className="text-muted-foreground"
            />
          </div>
        </div>
        <ProgressBar value={totalSpent} max={totalBudget} className="mt-3" />
      </button>

      {expanded && hasChildren && (
        <div className="px-4 pb-4 md:px-5 md:pb-5 space-y-2">
          {sortedChildren.map((child) => (
            <BudgetSubItemCard
              key={child.item.id}
              node={child}
              depth={1}
              sort={sort}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDelete={onDelete}
              deleteLoading={deleteLoading}
            />
          ))}
        </div>
      )}

      {expanded && !hasChildren && (
        <div className="px-4 pb-4 md:px-5 md:pb-5">
          <p className="text-sm text-muted-foreground italic text-center py-4">
            No sub-items yet. Add one to start tracking.
          </p>
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Budget Item"
        description={
          hasChildren
            ? `This will delete "${item.name}" and all ${children.length} child item(s).`
            : `This will permanently delete "${item.name}".`
        }
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={() => {
          onDelete(item.id)
          setShowDeleteConfirm(false)
        }}
      />
    </div>
  )
}
