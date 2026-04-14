import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function publishSharedBudget(userId: string): Promise<void> {
  await setDoc(doc(db, "publicBudgets", userId), { sharingEnabled: true, updatedAt: new Date().toISOString() })
}

export async function deleteSharedBudget(userId: string): Promise<void> {
  await deleteDoc(doc(db, "publicBudgets", userId))
}

export async function getSharedBudgetMarker(userId: string): Promise<{ updatedAt: string } | null> {
  const snap = await getDoc(doc(db, "publicBudgets", userId))
  if (!snap.exists()) return null
  return snap.data() as { updatedAt: string }
}
