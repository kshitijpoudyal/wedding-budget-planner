import { useMemo, useState } from "react"
import { Icon } from "@/components/ui/icon"
import { ProgressBar } from "@/components/ui/progress-bar"
import { StatusBadge } from "@/components/ui/status-badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CategoryActionMenu } from "./CategoryActionMenu"
import { sortNodes } from "./sortNodes"
import { formatCurrency } from "@/lib/currency"
import { useSettings } from "@/hooks/useSettings"
import { cn } from "@/lib/utils"
import type { BudgetTreeNode } from "@/hooks/useBudgetTree"

// Helper to format date for display
function formatDate(timestamp: { toDate: () => Date } | null): string {
  if (!timestamp) return ""
  return timestamp.toDate().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

// Check if a date is overdue (past and not paid)
function isOverdue(dueDate: { toDate: () => Date } | null, paidDate: { toDate: () => Date } | null): boolean {
  if (!dueDate || paidDate) return false
  return dueDate.toDate() < new Date()
}

type BudgetSubItemCardProps = {
  node: BudgetTreeNode
  depth: number
  sort: string
  onEdit: (node: BudgetTreeNode) => void
  onAddChild: (parentId: string) => void
  onDelete: (id: string) => void
  deleteLoading: boolean
  selectionMode?: boolean
  selectedIds?: Set<string>
  onToggleSelection?: (id: string) => void
}

export function BudgetSubItemCard({
  node,
  depth,
  sort,
  onEdit,
  onAddChild,
  onDelete,
  deleteLoading,
  selectionMode = false,
  selectedIds = new Set(),
  onToggleSelection,
}: BudgetSubItemCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { data: settings } = useSettings()
  const currency = settings?.currency ?? "USD"
  const rate = settings?.exchangeRate ?? 1

  const { item, children, totalBudget, totalSpent } = node
  const hasChildren = children.length > 0
  const sortedChildren = useMemo(() => sortNodes(children, sort), [children, sort])
  const isSelected = selectedIds.has(item.id)

  return (
    <div className={cn(depth > 1 && "pl-4")}>
      <div
        className={cn(
          "rounded-xl bg-surface-container glass-surface p-3 md:p-4 transition-colors duration-200",
          selectionMode && "cursor-pointer",
          selectionMode && isSelected && "ring-2 ring-primary"
        )}
        onClick={selectionMode && onToggleSelection ? () => onToggleSelection(item.id) : undefined}
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
            <p className="font-medium text-sm truncate">{item.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
              {formatCurrency(totalSpent, currency, rate)} / {formatCurrency(totalBudget, currency, rate)}
            </p>
          </div>
          {!selectionMode && (
            <CategoryActionMenu
              onEdit={() => onEdit(node)}
              onAddChild={() => onAddChild(item.id)}
              onDelete={() => setShowDeleteConfirm(true)}
              showAddChild={true}
            />
          )}
        </div>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <StatusBadge status={item.status} />
          {item.dueDate && (
            <Tooltip>
              <TooltipTrigger>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                    isOverdue(item.dueDate, item.paidDate)
                      ? "bg-error/10 text-error"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon name="calendar" size="sm" />
                  {formatDate(item.dueDate)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {isOverdue(item.dueDate, item.paidDate) ? "Overdue!" : "Due date"}
              </TooltipContent>
            </Tooltip>
          )}
          {item.paidDate && (
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                  <Icon name="check" size="sm" />
                  Paid {formatDate(item.paidDate)}
                </span>
              </TooltipTrigger>
              <TooltipContent>Payment date</TooltipContent>
            </Tooltip>
          )}
          {item.vendorName && (
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground max-w-[120px] truncate">
                  <Icon name="store" size="sm" />
                  {item.vendorName}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {item.vendorName}
                {item.vendorContact && ` • ${item.vendorContact}`}
              </TooltipContent>
            </Tooltip>
          )}
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
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onToggleSelection={onToggleSelection}
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
