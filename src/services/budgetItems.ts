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
import type { BudgetItem, BudgetItemInput } from "@/types"

const COLLECTION = "budgetItems"

export async function getAllBudgetItems(): Promise<BudgetItem[]> {
  const snapshot = await getDocs(collection(db, COLLECTION))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as BudgetItem)
}

export async function createBudgetItem(input: BudgetItemInput): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateBudgetItem(
  id: string,
  data: Partial<BudgetItemInput>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteBudgetItem(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}
