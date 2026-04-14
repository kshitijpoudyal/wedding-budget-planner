import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useOptionalUserId } from "@/contexts/AuthContext"
import { getSettings } from "@/services/settings"
import type { Settings } from "@/types"

export function useSettings() {
  const queryClient = useQueryClient()
  const userId = useOptionalUserId()
  const queryKey = ["settings", userId]

  useEffect(() => {
    if (!userId) return
    const unsubscribe = onSnapshot(
      doc(db, `users/${userId}/settings/global`),
      (snap) => {
        if (snap.exists()) {
          queryClient.setQueryData(queryKey, snap.data() as Settings)
        }
      },
      (error) => {
        console.error("settings snapshot error:", error)
        queryClient.invalidateQueries({ queryKey })
      },
    )
    return unsubscribe
  }, [queryClient, userId])

  return useQuery({
    queryKey,
    queryFn: () => getSettings(userId!),
    enabled: !!userId,
  })
}
