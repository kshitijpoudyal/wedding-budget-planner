import { useMemo, useState } from "react"
import { Icon } from "@/components/ui/icon"
import { ProgressBar } from "@/components/ui/progress-bar"
import { StatusBadge } from "@/components/ui/status-badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CategoryActionMenu } from "./CategoryActionMenu"
import { sortNodes } from "./sortNodes"
import { formatCurrency, toDisplayAmount } from "@/lib/currency"
import { useSettings } from "@/hooks/useSettings"
import { cn, formatDate } from "@/lib/utils"
import type { BudgetItem } from "@/types"
import type { BudgetTreeNode } from "@/hooks/useBudgetTree"
import type { CATEGORY_COLORS } from "@/lib/categoryColors"

// Check if a date is overdue (past and not paid)
function isOverdue(dueDate: { toDate: () => Date } | null, paidDate: { toDate: () => Date } | null): boolean {
  if (!dueDate || paidDate) return false
  return dueDate.toDate() < new Date()
}

const STATUS_CYCLE: BudgetItem["status"][] = ["draft", "finalized", "complete"]

function nextStatus(current: BudgetItem["status"]): BudgetItem["status"] {
  const idx = STATUS_CYCLE.indexOf(current)
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

type CategoryColor = typeof CATEGORY_COLORS[number]

type BudgetSubItemCardProps = {
  node: BudgetTreeNode
  depth: number
  sort: string
  categoryColor: CategoryColor
  onEdit: (node: BudgetTreeNode) => void
  onAddChild: (parentId: string) => void
  onDelete: (id: string) => void
  deleteLoading: boolean
  selectionMode?: boolean
  selectedIds?: Set<string>
  onToggleSelection?: (id: string) => void
  onStatusChange?: (id: string, newStatus: BudgetItem["status"]) => void
  onInlineUpdate?: (id: string, field: "budgetAmount" | "spentAmount", displayValue: number) => void
  readOnly?: boolean
}

export function BudgetSubItemCard({
  node,
  depth,
  sort,
  categoryColor,
  onEdit,
  onAddChild,
  onDelete,
  deleteLoading,
  selectionMode = false,
  selectedIds = new Set(),
  onToggleSelection,
  onStatusChange,
  onInlineUpdate,
  readOnly = false,
}: BudgetSubItemCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingField, setEditingField] = useState<"budgetAmount" | "spentAmount" | null>(null)
  const [editValue, setEditValue] = useState("")

  const { data: settings } = useSettings()
  const currency = settings?.currency ?? "USD"
  const rate = settings?.exchangeRate ?? 1

  const { item, children, totalBudget, totalSpent } = node
  const hasChildren = children.length > 0
  const spentRate = hasChildren ? rate : (item.currencyRate ?? rate)
  const sortedChildren = useMemo(() => sortNodes(children, sort), [children, sort])
  const isSelected = selectedIds.has(item.id)

  // Per-item currency: leaf items show in their native currency; parents show in global
  const effectiveCurrency = !hasChildren && item.itemCurrency ? item.itemCurrency : currency
  const effectiveRate = effectiveCurrency === "NPR" ? rate : 1
  const effectiveSpentRate = effectiveCurrency === "NPR" ? spentRate : 1

  const startInlineEdit = (field: "budgetAmount" | "spentAmount", e: React.MouseEvent) => {
    e.stopPropagation()
    const rawValue = field === "budgetAmount"
      ? toDisplayAmount(totalBudget, effectiveCurrency, effectiveRate)
      : toDisplayAmount(totalSpent, effectiveCurrency, effectiveSpentRate)
    setEditValue(String(Math.round(rawValue * 100) / 100))
    setEditingField(field)
  }

  const handleInlineSave = () => {
    const parsed = parseFloat(editValue)
    if (!isNaN(parsed) && parsed >= 0 && onInlineUpdate && editingField) {
      onInlineUpdate(item.id, editingField, parsed)
    }
    setEditingField(null)
  }

  const handleInlineKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === "Enter") handleInlineSave()
    if (e.key === "Escape") setEditingField(null)
  }

  return (
    <div className={cn(depth > 1 && "pl-4")}>
      <div
        className={cn(
          "rounded-xl p-3 md:p-4 transition-colors duration-200 bg-muted/40",
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
              {/* Spent — inline editable for leaf items */}
              {!hasChildren && editingField === "spentAmount" ? (
                <input
                  type="number"
                  min="0"
                  step="any"
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleInlineKeyDown}
                  onBlur={handleInlineSave}
                  onClick={(e) => e.stopPropagation()}
                  className="w-20 bg-transparent border-b border-primary text-xs tabular-nums outline-none"
                />
              ) : (
                <span
                  className={cn(!hasChildren && onInlineUpdate && !selectionMode && "cursor-pointer hover:text-foreground underline-offset-2 hover:underline")}
                  onClick={!hasChildren && onInlineUpdate && !selectionMode ? (e) => startInlineEdit("spentAmount", e) : undefined}
                  title={!hasChildren && onInlineUpdate ? "Click to edit spent" : undefined}
                >
                  {formatCurrency(totalSpent, effectiveCurrency, effectiveSpentRate)}
                </span>
              )}
              {" / "}
              {/* Budget — inline editable for leaf items */}
              {!hasChildren && editingField === "budgetAmount" ? (
                <input
                  type="number"
                  min="0"
                  step="any"
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleInlineKeyDown}
                  onBlur={handleInlineSave}
                  onClick={(e) => e.stopPropagation()}
                  className="w-20 bg-transparent border-b border-primary text-xs tabular-nums outline-none"
                />
              ) : (
                <span
                  className={cn(!hasChildren && onInlineUpdate && !selectionMode && "cursor-pointer hover:text-foreground underline-offset-2 hover:underline")}
                  onClick={!hasChildren && onInlineUpdate && !selectionMode ? (e) => startInlineEdit("budgetAmount", e) : undefined}
                  title={!hasChildren && onInlineUpdate ? "Click to edit budget" : undefined}
                >
                  {formatCurrency(totalBudget, effectiveCurrency, effectiveRate)}
                </span>
              )}
            </p>
          </div>
          {!selectionMode && !readOnly && (
            <CategoryActionMenu
              onEdit={() => onEdit(node)}
              onAddChild={() => onAddChild(item.id)}
              onDelete={() => setShowDeleteConfirm(true)}
              showAddChild={true}
            />
          )}
        </div>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <StatusBadge
            status={item.status}
            onClick={onStatusChange && !selectionMode ? (e) => {
              e.stopPropagation()
              onStatusChange(item.id, nextStatus(item.status))
            } : undefined}
          />
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
              categoryColor={categoryColor}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDelete={onDelete}
              deleteLoading={deleteLoading}
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onToggleSelection={onToggleSelection}
              onStatusChange={onStatusChange}
              onInlineUpdate={onInlineUpdate}
              readOnly={readOnly}
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
