import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createPerson, updatePerson } from "@/services/people"
import { cascadeDeletePerson } from "@/services/cascadeDelete"
import type { PersonInput } from "@/types"

export function useCreatePerson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PersonInput) => createPerson(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] })
    },
  })
}

export function useUpdatePerson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PersonInput> }) =>
      updatePerson(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] })
    },
  })
}

export function useDeletePerson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cascadeDeletePerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] })
      queryClient.invalidateQueries({ queryKey: ["assignments"] })
    },
  })
}
