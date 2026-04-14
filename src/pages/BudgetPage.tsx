import { useState, useEffect } from "react"
import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { BudgetFinancialOverview } from "@/components/budget/BudgetFinancialOverview"
import { BudgetCategoryList } from "@/components/budget/BudgetCategoryList"
import { BudgetItemForm } from "@/components/budget/BudgetItemForm"
import { QuoteBlock } from "@/components/ui/quote-block"
import { useBudgetTree } from "@/hooks/useBudgetTree"
import type { BudgetTreeNode } from "@/hooks/useBudgetTree"
import {
  useCreateBudgetItem,
  useUpdateBudgetItem,
  useDeleteBudgetItem,
  useBulkUpdateStatus,
} from "@/hooks/useBudgetItemMutations"
import { useBudgetItems } from "@/hooks/useBudgetItems"
import { useMigrateSpentRates } from "@/hooks/useMigrateSpentRates"
import { useUserId } from "@/contexts/AuthContext"
import { useSettings } from "@/hooks/useSettings"
import { toStorageAmount } from "@/lib/currency"
import { publishSharedBudget } from "@/services/sharing"
import type { BudgetItem, BudgetItemInput } from "@/types"

export default function BudgetPage() {
  const { tree, grandTotalBudget, grandTotalSpent, finalizedBudget, draftBudget, progress, isLoading, isError, error } =
    useBudgetTree()
  const { data: items } = useBudgetItems()
  const { data: settings } = useSettings()
  const userId = useUserId()
  useMigrateSpentRates(userId, items)

  const createMutation = useCreateBudgetItem()
  const updateMutation = useUpdateBudgetItem()
  const deleteMutation = useDeleteBudgetItem()
  const bulkUpdateMutation = useBulkUpdateStatus()

  const [formOpen, setFormOpen] = useState(false)
  const [editingNode, setEditingNode] = useState<BudgetTreeNode | null>(null)
  const [newParentId, setNewParentId] = useState<string | null>(null)

  // Auto-refresh public share snapshot whenever budget data changes
  useEffect(() => {
    if (!settings?.sharingEnabled || !items || items.length === 0) return
    publishSharedBudget(userId, {
      userId,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        budgetAmount: item.budgetAmount ?? 0,
        spentAmount: item.spentAmount ?? 0,
        parentId: item.parentId ?? null,
        status: item.status ?? "draft",
        itemCurrency: item.itemCurrency ?? null,
        notes: item.notes ?? null,
        vendorName: item.vendorName ?? null,
        vendorContact: item.vendorContact ?? null,
        dueDate: item.dueDate ?? null,
        paidDate: item.paidDate ?? null,
        currencyRate: item.currencyRate ?? null,
        ...(item.createdAt ? { createdAt: item.createdAt } : {}),
        ...(item.updatedAt ? { updatedAt: item.updatedAt } : {}),
      })),
      settings: { currency: settings.currency, exchangeRate: settings.exchangeRate },
      updatedAt: new Date().toISOString(),
    }).catch(() => {}) // silently ignore publish errors
  }, [items, settings?.sharingEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = () => {
    setEditingNode(null)
    setNewParentId(null)
    setFormOpen(true)
  }

  const handleAddChild = (parentId: string) => {
    setEditingNode(null)
    setNewParentId(parentId)
    setFormOpen(true)
  }

  const handleEdit = (node: BudgetTreeNode) => {
    setEditingNode(node)
    setNewParentId(null)
    setFormOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  const handleBulkStatusChange = (ids: string[], status: BudgetItem["status"]) => {
    bulkUpdateMutation.mutate({ ids, status })
  }

  const handleStatusChange = (id: string, newStatus: BudgetItem["status"]) => {
    updateMutation.mutate({ id, data: { status: newStatus } as Partial<BudgetItemInput> })
  }

  const handleInlineUpdate = (id: string, field: "budgetAmount" | "spentAmount", displayValue: number) => {
    const item = items?.find((i) => i.id === id)
    const currency = settings?.currency ?? "USD"
    const rate = settings?.exchangeRate ?? 1
    const lockRate = settings?.lockRate ?? false

    // Use item's native currency for conversion, fall back to global
    const effectiveCurrency = item?.itemCurrency ?? currency
    const usdValue = toStorageAmount(displayValue, effectiveCurrency, rate)

    const data: Partial<BudgetItemInput> = { [field]: usdValue }
    // Lock the exchange rate on spent updates if lockRate is enabled and item is an NPR item
    if (field === "spentAmount" && lockRate && effectiveCurrency === "NPR" && displayValue > 0) {
      data.currencyRate = rate
    }
    updateMutation.mutate({ id, data })
  }

  const handleSubmit = (data: BudgetItemInput) => {
    if (editingNode) {
      updateMutation.mutate(
        { id: editingNode.item.id, data },
        { onSuccess: () => setFormOpen(false) },
      )
    } else {
      createMutation.mutate(data, { onSuccess: () => setFormOpen(false) })
    }
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <p className="text-destructive font-medium">Failed to load budget data</p>
        <p className="text-muted-foreground text-sm">
          {error?.message || "Please check your connection and try again."}
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading budget...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-4xl mx-auto">
      <BudgetFinancialOverview
        totalBudget={grandTotalBudget}
        totalSpent={grandTotalSpent}
        finalizedBudget={finalizedBudget}
        draftBudget={draftBudget}
        progress={progress}
      />

      <BudgetCategoryList
        tree={tree}
        onEdit={handleEdit}
        onAddChild={handleAddChild}
        onDelete={handleDelete}
        deleteLoading={deleteMutation.isPending}
        onAddRoot={handleAdd}
        onBulkStatusChange={handleBulkStatusChange}
        bulkUpdateLoading={bulkUpdateMutation.isPending}
        onStatusChange={handleStatusChange}
        onInlineUpdate={handleInlineUpdate}
      />

      <QuoteBlock />

      {/* Mobile FAB */}
      <Button
        onClick={handleAdd}
        size="icon"
        className="md:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full glass-card z-40"
      >
        <Icon name="add" size="xl" />
      </Button>

      <BudgetItemForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
        item={editingNode?.item}
        parentId={newParentId}
        isParent={editingNode ? !editingNode.isLeaf : false}
      />
    </div>
  )
}
