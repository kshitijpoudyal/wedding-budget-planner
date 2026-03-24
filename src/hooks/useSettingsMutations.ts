import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useUserId } from "@/contexts/AuthContext"
import { updateSettings } from "@/services/settings"
import type { Settings } from "@/types"

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  return useMutation({
    mutationFn: (data: Partial<Settings>) => updateSettings(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", userId] })
    },
  })
}
