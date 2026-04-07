import { useMemo, useState } from "react"
import { Icon } from "@/components/ui/icon"
import { ProgressBar } from "@/components/ui/progress-bar"
import { StatusBadge } from "@/components/ui/status-badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { BudgetSubItemCard } from "./BudgetSubItemCard"
import { CategoryActionMenu } from "./CategoryActionMenu"
import { sortNodes } from "./sortNodes"
import { formatCurrency } from "@/lib/currency"
import { getCategoryColor } from "@/lib/categoryColors"
import { useSettings } from "@/hooks/useSettings"
import { cn } from "@/lib/utils"
import type { BudgetTreeNode } from "@/hooks/useBudgetTree"

type BudgetCategoryCardProps = {
  node: BudgetTreeNode
  sort: string
  onEdit: (node: BudgetTreeNode) => void
  onAddChild: (parentId: string) => void
  onDelete: (id: string) => void
  deleteLoading: boolean
  selectionMode?: boolean
  selectedIds?: Set<string>
  onToggleSelection?: (id: string) => void
}

export function BudgetCategoryCard({
  node,
  sort,
  onEdit,
  onAddChild,
  onDelete,
  deleteLoading,
  selectionMode = false,
  selectedIds = new Set(),
  onToggleSelection,
}: BudgetCategoryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { data: settings } = useSettings()
  const currency = settings?.currency ?? "USD"
  const rate = settings?.exchangeRate ?? 1

  const { item, children, totalBudget, totalSpent } = node
  const hasChildren = children.length > 0
  const categoryColor = getCategoryColor(item.name)
  const sortedChildren = useMemo(() => sortNodes(children, sort), [children, sort])
  const isSelected = selectedIds.has(item.id)

  const handleClick = () => {
    if (selectionMode && onToggleSelection) {
      onToggleSelection(item.id)
    } else {
      setExpanded(!expanded)
    }
  }

  return (
    <div className={cn(
      "rounded-xl bg-card glass-card overflow-hidden transition-all duration-200 border-l-[3px]",
      categoryColor.border,
      selectionMode && isSelected && "ring-2 ring-primary"
    )}>
      <button
        type="button"
        className="w-full text-left p-4 md:p-5"
        onClick={handleClick}
      >
        <div className="flex items-start justify-between gap-2">
          {selectionMode && (
            <div
              className={cn(
                "shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors mr-2",
                isSelected
                  ? "bg-primary border-primary text-white"
                  : "border-muted-foreground/40"
              )}
            >
              {isSelected && <Icon name="check" size="sm" />}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold truncate">{item.name}</h3>
              <StatusBadge status={item.status} />
            </div>
            <div className="flex gap-4 mt-1.5 text-sm text-muted-foreground tabular-nums">
              <span>Budget: {formatCurrency(totalBudget, currency, rate)}</span>
              <span>Spent: {formatCurrency(totalSpent, currency, rate)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!selectionMode && (
              <div onClick={(e) => e.stopPropagation()}>
                <CategoryActionMenu
                  onEdit={() => onEdit(node)}
                  onAddChild={() => onAddChild(item.id)}
                  onDelete={() => setShowDeleteConfirm(true)}
                />
              </div>
            )}
            {!selectionMode && (
              <Icon
                name={expanded ? "expand_less" : "expand_more"}
                size="lg"
                className="text-muted-foreground"
              />
            )}
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
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onToggleSelection={onToggleSelection}
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
