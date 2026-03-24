import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateSettings } from "@/services/settings"
import type { Settings } from "@/types"

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Settings>) => updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] })
    },
  })
}
