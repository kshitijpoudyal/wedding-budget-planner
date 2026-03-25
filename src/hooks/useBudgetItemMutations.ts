import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useUserId } from "@/contexts/AuthContext"
import { createBudgetItem, updateBudgetItem } from "@/services/budgetItems"
import { cascadeDeleteBudgetItem } from "@/services/cascadeDelete"
import type { BudgetItemInput } from "@/types"

export function useCreateBudgetItem() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  return useMutation({
    mutationFn: (input: BudgetItemInput) => createBudgetItem(userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetItems", userId] })
    },
  })
}

export function useUpdateBudgetItem() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BudgetItemInput> }) =>
      updateBudgetItem(userId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetItems", userId] })
    },
  })
}

export function useDeleteBudgetItem() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  return useMutation({
    mutationFn: (id: string) => cascadeDeleteBudgetItem(userId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetItems", userId] })
    },
  })
}
