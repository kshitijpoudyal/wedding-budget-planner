/**
 * Migration: Update budget item statuses
 * 
 * This script migrates the status field:
 *   - "active", "Active" → "finalized"
 *   - "final", "Final" → "finalized"
 *   - "draft", "Draft" → "draft" (no change)
 * 
 * Usage: node scripts/migrate-status.mjs
 */

import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs, doc, writeBatch } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAwQYdccYxg2kO9zA7H6YXPAwxQnoZkOXg",
  authDomain: "wedding-budget-planner-15882.firebaseapp.com",
  projectId: "wedding-budget-planner-15882",
  storageBucket: "wedding-budget-planner-15882.firebasestorage.app",
  messagingSenderId: "684492032315",
  appId: "1:684492032315:web:3994fc9778b6e351484f1e",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Add all user paths that need migration here
const USER_PATHS = [
  "users/5f1jhWVLSZc4Bl9Ym6A81d3dF8G2",
  // Add more user paths as needed
]

// Status mapping: old status → new status (case-insensitive)
const STATUS_MAP = {
  draft: "draft",       // Keep as draft
  active: "finalized",  // Active becomes finalized
  final: "finalized",   // Final becomes finalized
  pending: "finalized", // Pending becomes finalized
  closed: "finalized",  // Closed becomes finalized
}

async function migrateUserBudgetItems(userPath) {
  console.log(`\nMigrating: ${userPath}`)
  
  const budgetItemsRef = collection(db, `${userPath}/budgetItems`)
  const snapshot = await getDocs(budgetItemsRef)
  
  if (snapshot.empty) {
    console.log("  No budget items found.")
    return { updated: 0, skipped: 0 }
  }
  
  const batch = writeBatch(db)
  let updateCount = 0
  let skipCount = 0
  
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data()
    const oldStatus = data.status?.toLowerCase() // Handle case-insensitive
    const newStatus = STATUS_MAP[oldStatus]
    
    if (!newStatus) {
      console.log(`  ⚠️  Unknown status "${data.status}" for item "${data.name}" (${docSnap.id})`)
      skipCount++
      continue
    }
    
    if (data.status !== newStatus) {
      console.log(`  📝 "${data.name}": ${data.status} → ${newStatus}`)
      batch.update(doc(db, `${userPath}/budgetItems`, docSnap.id), { status: newStatus })
      updateCount++
    } else {
      skipCount++
    }
  }
  
  if (updateCount > 0) {
    await batch.commit()
    console.log(`  ✅ Updated ${updateCount} items`)
  }
  
  return { updated: updateCount, skipped: skipCount }
}

async function main() {
  console.log("=" .repeat(50))
  console.log("Status Migration: active/final → finalized")
  console.log("=".repeat(50))
  
  let totalUpdated = 0
  let totalSkipped = 0
  
  for (const userPath of USER_PATHS) {
    try {
      const { updated, skipped } = await migrateUserBudgetItems(userPath)
      totalUpdated += updated
      totalSkipped += skipped
    } catch (error) {
      console.error(`  ❌ Error migrating ${userPath}:`, error.message)
    }
  }
  
  console.log("\n" + "=".repeat(50))
  console.log(`Migration complete!`)
  console.log(`  Total updated: ${totalUpdated}`)
  console.log(`  Total skipped (already draft): ${totalSkipped}`)
  console.log("=".repeat(50))
  
  process.exit(0)
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
