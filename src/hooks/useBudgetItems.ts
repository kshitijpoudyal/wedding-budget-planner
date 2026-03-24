import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { userCollection } from "@/lib/userPath"
import { useUserId } from "@/contexts/AuthContext"
import { getAllBudgetItems } from "@/services/budgetItems"
import type { BudgetItem } from "@/types"

export function useBudgetItems() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  const queryKey = ["budgetItems", userId]

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, userCollection(userId, "budgetItems")),
      (snapshot) => {
        const items = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as BudgetItem,
        )
        queryClient.setQueryData(queryKey, items)
      },
      (error) => {
        console.error("budgetItems snapshot error:", error)
        queryClient.invalidateQueries({ queryKey })
      },
    )
    return unsubscribe
  }, [queryClient, userId])

  return useQuery({
    queryKey,
    queryFn: () => getAllBudgetItems(userId),
  })
}
