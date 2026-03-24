import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createAssignment, deleteAssignment } from "@/services/assignments"

export function useCreateAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ budgetItemId, personId }: { budgetItemId: string; personId: string }) =>
      createAssignment(budgetItemId, personId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] })
    },
  })
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] })
    },
  })
}
