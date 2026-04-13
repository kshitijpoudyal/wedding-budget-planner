import { useMemo, useState } from "react"
import { Icon } from "@/components/ui/icon"
import { ProgressBar } from "@/components/ui/progress-bar"
import { StatusBadge } from "@/components/ui/status-badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { BudgetSubItemCard } from "./BudgetSubItemCard"
import { CategoryActionMenu } from "./CategoryActionMenu"
import { sortNodes } from "./sortNodes"
import { formatCurrency, toDisplayAmount, toStorageAmount } from "@/lib/currency"
import { getCategoryColor } from "@/lib/categoryColors"
import { useSettings } from "@/hooks/useSettings"
import { cn } from "@/lib/utils"
import type { BudgetItem } from "@/types"
import type { BudgetTreeNode } from "@/hooks/useBudgetTree"

const STATUS_CYCLE: BudgetItem["status"][] = ["draft", "finalized", "complete"]

function nextStatus(current: BudgetItem["status"]): BudgetItem["status"] {
  const idx = STATUS_CYCLE.indexOf(current)
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

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
  onStatusChange?: (id: string, newStatus: BudgetItem["status"]) => void
  onInlineUpdate?: (id: string, field: "budgetAmount" | "spentAmount", displayValue: number) => void
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
  onStatusChange,
  onInlineUpdate,
}: BudgetCategoryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingField, setEditingField] = useState<"budgetAmount" | "spentAmount" | null>(null)
  const [editValue, setEditValue] = useState("")

  const { data: settings } = useSettings()
  const currency = settings?.currency ?? "USD"
  const rate = settings?.exchangeRate ?? 1

  const { item, children, totalBudget, totalSpent } = node
  const hasChildren = children.length > 0
  const categoryColor = getCategoryColor(item.name)
  const spentRate = hasChildren ? rate : (item.currencyRate ?? rate)
  const sortedChildren = useMemo(() => sortNodes(children, sort), [children, sort])
  const isSelected = selectedIds.has(item.id)

  // Per-item currency: leaf items show in their native currency; parents show in global
  const effectiveCurrency = !hasChildren && item.itemCurrency ? item.itemCurrency : currency
  const effectiveRate = effectiveCurrency === "NPR" ? rate : 1
  const effectiveSpentRate = effectiveCurrency === "NPR" ? spentRate : 1

  const handleClick = () => {
    if (selectionMode && onToggleSelection) {
      onToggleSelection(item.id)
    } else {
      setExpanded(!expanded)
    }
  }

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

  const currencyLabel = effectiveCurrency === "USD" ? "$" : "रु"

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden transition-all duration-200 shadow-sm glass-card bg-card",
      selectionMode && isSelected && "ring-2 ring-primary"
    )}>
      <button
        type="button"
        className="w-full text-left p-5 md:p-6"
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
              <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", categoryColor.dot)} />
              <h3 className="text-lg font-extrabold tracking-tight truncate">{item.name}</h3>
              <StatusBadge
                status={item.status}
                onClick={onStatusChange && !selectionMode ? (e) => {
                  e.stopPropagation()
                  onStatusChange(item.id, nextStatus(item.status))
                } : undefined}
              />
            </div>
            <div className="flex gap-4 mt-1.5 text-sm text-muted-foreground tabular-nums">
              {/* Budget amount — inline editable for leaf items */}
              <span>
                Budget:{" "}
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
                    className="w-24 bg-transparent border-b border-primary text-sm tabular-nums outline-none"
                    title={`Amount in ${effectiveCurrency}`}
                  />
                ) : (
                  <span
                    className={cn(!hasChildren && onInlineUpdate && !selectionMode && "cursor-pointer hover:text-foreground underline-offset-2 hover:underline")}
                    onClick={!hasChildren && onInlineUpdate && !selectionMode ? (e) => startInlineEdit("budgetAmount", e) : undefined}
                    title={!hasChildren && onInlineUpdate ? `Edit budget (${currencyLabel})` : undefined}
                  >
                    {formatCurrency(totalBudget, effectiveCurrency, effectiveRate)}
                  </span>
                )}
              </span>
              {/* Spent amount — inline editable for leaf items */}
              <span>
                Spent:{" "}
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
                    className="w-24 bg-transparent border-b border-primary text-sm tabular-nums outline-none"
                    title={`Amount in ${effectiveCurrency}`}
                  />
                ) : (
                  <span
                    className={cn(!hasChildren && onInlineUpdate && !selectionMode && "cursor-pointer hover:text-foreground underline-offset-2 hover:underline")}
                    onClick={!hasChildren && onInlineUpdate && !selectionMode ? (e) => startInlineEdit("spentAmount", e) : undefined}
                    title={!hasChildren && onInlineUpdate ? `Edit spent (${currencyLabel})` : undefined}
                  >
                    {formatCurrency(totalSpent, effectiveCurrency, effectiveSpentRate)}
                  </span>
                )}
              </span>
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
        <div className="px-5 pb-5 md:px-6 md:pb-6 space-y-2">
          {sortedChildren.map((child) => (
            <BudgetSubItemCard
              key={child.item.id}
              node={child}
              depth={1}
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
            />
          ))}
        </div>
      )}

      {expanded && !hasChildren && (
        <div className="px-5 pb-5 md:px-6 md:pb-6">
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
