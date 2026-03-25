import { useMemo, useState } from "react"
import { ProgressBar } from "@/components/ui/progress-bar"
import { StatusBadge } from "@/components/ui/status-badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { CategoryActionMenu } from "./CategoryActionMenu"
import { sortNodes } from "./sortNodes"
import { formatCurrency } from "@/lib/currency"
import { useSettings } from "@/hooks/useSettings"
import { cn } from "@/lib/utils"
import type { BudgetTreeNode } from "@/hooks/useBudgetTree"

type BudgetSubItemCardProps = {
  node: BudgetTreeNode
  depth: number
  sort: string
  onEdit: (node: BudgetTreeNode) => void
  onAddChild: (parentId: string) => void
  onDelete: (id: string) => void
  deleteLoading: boolean
}

export function BudgetSubItemCard({
  node,
  depth,
  sort,
  onEdit,
  onAddChild,
  onDelete,
  deleteLoading,
}: BudgetSubItemCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { data: settings } = useSettings()
  const currency = settings?.currency ?? "USD"
  const rate = settings?.exchangeRate ?? 1

  const { item, children, totalBudget, totalSpent } = node
  const hasChildren = children.length > 0
  const sortedChildren = useMemo(() => sortNodes(children, sort), [children, sort])

  return (
    <div className={cn(depth > 1 && "pl-4")}>
      <div className="rounded-xl bg-surface-container-low p-3 md:p-4 transition-colors duration-200">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{item.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
              {formatCurrency(totalSpent, currency, rate)} / {formatCurrency(totalBudget, currency, rate)}
            </p>
          </div>
          <CategoryActionMenu
            onEdit={() => onEdit(node)}
            onAddChild={() => onAddChild(item.id)}
            onDelete={() => setShowDeleteConfirm(true)}
            showAddChild={true}
          />
        </div>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <StatusBadge status={item.status} />
        </div>

        <ProgressBar value={totalSpent} max={totalBudget} className="mt-2" />
      </div>

      {hasChildren && (
        <div className="mt-2 space-y-2">
          {sortedChildren.map((child) => (
            <BudgetSubItemCard
              key={child.item.id}
              node={child}
              depth={depth + 1}
              sort={sort}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDelete={onDelete}
              deleteLoading={deleteLoading}
            />
          ))}
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
