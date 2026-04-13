import { useEffect, useRef } from "react"
import { doc, writeBatch, deleteField } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { userCollection } from "@/lib/userPath"
import type { BudgetItem } from "@/types"

/**
 * One-time migration: renames the old `spentAmountRate` Firestore field to `currencyRate`.
 * Copies the value to the new field and deletes the old one in a single batch.
 */
export function useMigrateSpentRates(
  userId: string,
  items: BudgetItem[] | undefined,
) {
  const migrated = useRef(false)

  useEffect(() => {
    if (migrated.current || !items) return

    // items from Firestore may still have the old field as an unknown extra property
    const needsRename = items.filter(
      (item) => (item as unknown as Record<string, unknown>)["spentAmountRate"] !== undefined,
    )

    if (needsRename.length === 0) {
      migrated.current = true
      return
    }

    const batch = writeBatch(db)
    const colPath = userCollection(userId, "budgetItems")

    for (const item of needsRename) {
      const oldValue = (item as unknown as Record<string, unknown>)["spentAmountRate"] as number | null
      const ref = doc(db, colPath, item.id)
      batch.update(ref, {
        currencyRate: oldValue,
        spentAmountRate: deleteField(),
      })
    }

    batch.commit().then(() => {
      migrated.current = true
    }).catch(console.error)
  }, [userId, items])
}
