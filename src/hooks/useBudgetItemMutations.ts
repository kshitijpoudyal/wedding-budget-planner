import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createBudgetItem, updateBudgetItem } from "@/services/budgetItems"
import { cascadeDeleteBudgetItem } from "@/services/cascadeDelete"
import type { BudgetItemInput } from "@/types"

export function useCreateBudgetItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: BudgetItemInput) => createBudgetItem(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetItems"] })
    },
  })
}

export function useUpdateBudgetItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BudgetItemInput> }) =>
      updateBudgetItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetItems"] })
    },
  })
}

export function useDeleteBudgetItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cascadeDeleteBudgetItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetItems"] })
      queryClient.invalidateQueries({ queryKey: ["assignments"] })
    },
  })
}
