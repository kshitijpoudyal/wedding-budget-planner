import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { userCollection } from "@/lib/userPath"
import { useUserId } from "@/contexts/AuthContext"
import { getAllAssignments } from "@/services/assignments"
import type { Assignment } from "@/types"

export function useAssignments() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  const queryKey = ["assignments", userId]

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, userCollection(userId, "assignments")),
      (snapshot) => {
        const items = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Assignment,
        )
        queryClient.setQueryData(queryKey, items)
      },
      (error) => {
        console.error("assignments snapshot error:", error)
        queryClient.invalidateQueries({ queryKey })
      },
    )
    return unsubscribe
  }, [queryClient, userId])

  return useQuery({
    queryKey,
    queryFn: () => getAllAssignments(userId),
  })
}
