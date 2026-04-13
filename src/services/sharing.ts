import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { SharedBudgetSnapshot } from "@/types"

function sharedBudgetPath(token: string) {
  return `publicBudgets/${token}`
}

export async function publishSharedBudget(token: string, snapshot: SharedBudgetSnapshot): Promise<void> {
  await setDoc(doc(db, sharedBudgetPath(token)), snapshot)
}

export async function deleteSharedBudget(token: string): Promise<void> {
  await deleteDoc(doc(db, sharedBudgetPath(token)))
}

export async function getSharedBudget(token: string): Promise<SharedBudgetSnapshot | null> {
  const snap = await getDoc(doc(db, sharedBudgetPath(token)))
  if (!snap.exists()) return null
  return snap.data() as SharedBudgetSnapshot
}
