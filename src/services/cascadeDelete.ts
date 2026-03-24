import { getAllBudgetItems, deleteBudgetItem } from "./budgetItems"
import { deleteAssignmentsByBudgetItem, deleteAssignmentsByPerson } from "./assignments"

/**
 * Delete a budget item and all its descendants + related assignments.
 */
export async function cascadeDeleteBudgetItem(itemId: string): Promise<void> {
  const allItems = await getAllBudgetItems()

  // Collect all descendant IDs recursively
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

  // Delete all assignments for each item, then delete the items
  await Promise.all(
    Array.from(idsToDelete).map(async (id) => {
      await deleteAssignmentsByBudgetItem(id)
      await deleteBudgetItem(id)
    }),
  )
}

/**
 * Delete a person and all their assignments.
 */
export async function cascadeDeletePerson(personId: string): Promise<void> {
  await deleteAssignmentsByPerson(personId)
  const { deletePerson } = await import("./people")
  await deletePerson(personId)
}
