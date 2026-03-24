import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useUserId } from "@/contexts/AuthContext"
import { createPerson, updatePerson } from "@/services/people"
import { cascadeDeletePerson } from "@/services/cascadeDelete"
import type { PersonInput } from "@/types"

export function useCreatePerson() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  return useMutation({
    mutationFn: (input: PersonInput) => createPerson(userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people", userId] })
    },
  })
}

export function useUpdatePerson() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PersonInput> }) =>
      updatePerson(userId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people", userId] })
    },
  })
}

export function useDeletePerson() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  return useMutation({
    mutationFn: (id: string) => cascadeDeletePerson(userId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people", userId] })
      queryClient.invalidateQueries({ queryKey: ["assignments", userId] })
    },
  })
}
