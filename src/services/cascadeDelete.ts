import { getAllBudgetItems, deleteBudgetItem } from "./budgetItems"
import { deletePerson } from "./people"
import { deleteAssignmentsByBudgetItem, deleteAssignmentsByPerson } from "./assignments"

/**
 * Delete a budget item and all its descendants + related assignments.
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
    Array.from(idsToDelete).map(async (id) => {
      await deleteAssignmentsByBudgetItem(userId, id)
      await deleteBudgetItem(userId, id)
    }),
  )
}

/**
 * Delete a person and all their assignments.
 */
export async function cascadeDeletePerson(userId: string, personId: string): Promise<void> {
  await deleteAssignmentsByPerson(userId, personId)
  await deletePerson(userId, personId)
}
