import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { userCollection } from "@/lib/userPath"
import { useUserId } from "@/contexts/AuthContext"
import { getAllPeople } from "@/services/people"
import type { Person } from "@/types"

export function usePeople() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  const queryKey = ["people", userId]

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, userCollection(userId, "people")),
      (snapshot) => {
        const items = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Person,
        )
        queryClient.setQueryData(queryKey, items)
      },
      (error) => {
        console.error("people snapshot error:", error)
        queryClient.invalidateQueries({ queryKey })
      },
    )
    return unsubscribe
  }, [queryClient, userId])

  return useQuery({
    queryKey,
    queryFn: () => getAllPeople(userId),
  })
}
