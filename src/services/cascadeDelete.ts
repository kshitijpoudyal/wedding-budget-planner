import { getAllBudgetItems, deleteBudgetItem } from "./budgetItems"

/**
 * Delete a budget item and all its descendants.
 */
export async function cascadeDeleteBudgetItem(userId: string, itemId: string): Promise<void> {
  const allItems = await getAllBudgetItems(userId)

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
    Array.from(idsToDelete).map((id) => deleteBudgetItem(userId, id)),
  )
}
