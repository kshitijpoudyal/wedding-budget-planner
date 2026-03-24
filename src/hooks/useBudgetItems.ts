import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { userCollection } from "@/lib/userPath"
import { getAllBudgetItems } from "@/services/budgetItems"
import type { BudgetItem } from "@/types"

const QUERY_KEY = ["budgetItems"]

export function useBudgetItems() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, userCollection("budgetItems")), (snapshot) => {
      const items = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as BudgetItem,
      )
      queryClient.setQueryData(QUERY_KEY, items)
    })
    return unsubscribe
  }, [queryClient])

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getAllBudgetItems,
  })
}
