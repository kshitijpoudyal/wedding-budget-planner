import { useEffect } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { userCollection } from "@/lib/userPath"
import { useUserId } from "@/contexts/AuthContext"
import {
  getPaymentsByItem,
  getAllPayments,
  createPayment,
  deletePayment,
} from "@/services/payments"
import type { Payment, PaymentInput } from "@/types"

export function usePayments(budgetItemId?: string) {
  const queryClient = useQueryClient()
  const userId = useUserId()
  const queryKey = budgetItemId
    ? ["payments", userId, budgetItemId]
    : ["payments", userId]

  useEffect(() => {
    let q
    if (budgetItemId) {
      q = query(
        collection(db, userCollection(userId, "payments")),
        where("budgetItemId", "==", budgetItemId),
        orderBy("date", "desc"),
      )
    } else {
      q = collection(db, userCollection(userId, "payments"))
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Payment,
        )
        queryClient.setQueryData(queryKey, items)
      },
      (error) => {
        console.error("payments snapshot error:", error)
        queryClient.invalidateQueries({ queryKey })
      },
    )
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, userId, budgetItemId])

  return useQuery({
    queryKey,
    queryFn: () =>
      budgetItemId
        ? getPaymentsByItem(userId, budgetItemId)
        : getAllPayments(userId),
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  const userId = useUserId()

  return useMutation({
    mutationFn: (input: PaymentInput) => createPayment(userId, input),
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: ["payments", userId] })
      queryClient.invalidateQueries({
        queryKey: ["payments", userId, input.budgetItemId],
      })
    },
  })
}

export function useDeletePayment() {
  const queryClient = useQueryClient()
  const userId = useUserId()

  return useMutation({
    mutationFn: ({ id }: { id: string; budgetItemId: string }) => deletePayment(userId, id),
    onSuccess: (_, { budgetItemId }) => {
      queryClient.invalidateQueries({ queryKey: ["payments", userId] })
      queryClient.invalidateQueries({ queryKey: ["payments", userId, budgetItemId] })
    },
  })
}
