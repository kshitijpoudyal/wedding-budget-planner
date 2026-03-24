import { useState } from "react"
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
} from "@/hooks/useBudgetItemMutations"
import type { BudgetItemInput } from "@/types"

export default function BudgetPage() {
  const { tree, grandTotalBudget, grandTotalSpent, progress, isLoading, isError, error } =
    useBudgetTree()

  const createMutation = useCreateBudgetItem()
  const updateMutation = useUpdateBudgetItem()
  const deleteMutation = useDeleteBudgetItem()

  const [formOpen, setFormOpen] = useState(false)
  const [editingNode, setEditingNode] = useState<BudgetTreeNode | null>(null)
  const [newParentId, setNewParentId] = useState<string | null>(null)

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
        progress={progress}
      />

      <BudgetCategoryList
        tree={tree}
        onEdit={handleEdit}
        onAddChild={handleAddChild}
        onDelete={handleDelete}
        deleteLoading={deleteMutation.isPending}
        onAddRoot={handleAdd}
      />

      <QuoteBlock />

      {/* Mobile FAB */}
      <Button
        onClick={handleAdd}
        size="icon"
        className="md:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-[0_20px_40px_rgba(128,82,83,0.06)] z-40"
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
