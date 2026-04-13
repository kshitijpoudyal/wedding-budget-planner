import { getAllBudgetItems, deleteBudgetItem } from "./budgetItems"
import { deletePaymentsByItem } from "./payments"
import type { BudgetItem } from "@/types"

/**
 * Delete a budget item and all its descendants, including their payments.
 * Pass `allItems` from the React Query cache to avoid an extra Firestore fetch.
 */
export async function cascadeDeleteBudgetItem(
  userId: string,
  itemId: string,
  cachedItems?: BudgetItem[],
): Promise<void> {
  const allItems = cachedItems ?? await getAllBudgetItems(userId)

  const idsToDelete = new Set<string>()

  function collectDescendants(parentId: string) {
    for (const item of allItems) {
      if (item.parentId === parentId && !idsToDelete.has(item.id)) {
        idsToDelete.add(item.id)
        collectDescendants(item.id)
      }
    }
  }

  idsToDelete.add(itemId)
  collectDescendants(itemId)

  await Promise.all(
    Array.from(idsToDelete).flatMap((id) => [
      deleteBudgetItem(userId, id),
      deletePaymentsByItem(userId, id),
    ]),
  )
}
