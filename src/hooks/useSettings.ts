import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getSettings } from "@/services/settings"
import type { Settings } from "@/types"

const QUERY_KEY = ["settings"]

export function useSettings() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings/global"), (snap) => {
      if (snap.exists()) {
        queryClient.setQueryData(QUERY_KEY, snap.data() as Settings)
      }
    })
    return unsubscribe
  }, [queryClient])

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getSettings,
  })
}
