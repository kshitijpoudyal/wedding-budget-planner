import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { userCollection } from "@/lib/userPath"
import type { BudgetItem, BudgetItemInput } from "@/types"

export async function getAllBudgetItems(userId: string): Promise<BudgetItem[]> {
  const snapshot = await getDocs(collection(db, userCollection(userId, "budgetItems")))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as BudgetItem)
}

export async function createBudgetItem(userId: string, input: BudgetItemInput): Promise<string> {
  const docRef = await addDoc(collection(db, userCollection(userId, "budgetItems")), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateBudgetItem(
  userId: string,
  id: string,
  data: Partial<BudgetItemInput>,
): Promise<void> {
  await updateDoc(doc(db, userCollection(userId, "budgetItems"), id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteBudgetItem(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, userCollection(userId, "budgetItems"), id))
}
