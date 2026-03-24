import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { userCollection } from "@/lib/userPath"
import { getAllPeople } from "@/services/people"
import type { Person } from "@/types"

const QUERY_KEY = ["people"]

export function usePeople() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, userCollection("people")),
      (snapshot) => {
        const items = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Person,
        )
        queryClient.setQueryData(QUERY_KEY, items)
      },
      (error) => {
        console.error("people snapshot error:", error)
        queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      },
    )
    return unsubscribe
  }, [queryClient])

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getAllPeople,
  })
}
