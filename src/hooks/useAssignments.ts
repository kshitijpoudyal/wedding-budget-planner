import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getAllAssignments } from "@/services/assignments"
import type { Assignment } from "@/types"

const QUERY_KEY = ["assignments"]

export function useAssignments() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "assignments"), (snapshot) => {
      const items = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as Assignment,
      )
      queryClient.setQueryData(QUERY_KEY, items)
    })
    return unsubscribe
  }, [queryClient])

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getAllAssignments,
  })
}
