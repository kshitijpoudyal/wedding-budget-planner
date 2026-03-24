import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useUserId } from "@/contexts/AuthContext"
import { createAssignment, deleteAssignment } from "@/services/assignments"

export function useCreateAssignment() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  return useMutation({
    mutationFn: ({ budgetItemId, personId }: { budgetItemId: string; personId: string }) =>
      createAssignment(userId, budgetItemId, personId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", userId] })
    },
  })
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  return useMutation({
    mutationFn: (id: string) => deleteAssignment(userId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", userId] })
    },
  })
}
