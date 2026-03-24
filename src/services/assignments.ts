import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { userCollection } from "@/lib/userPath"
import type { Assignment } from "@/types"

const COLLECTION = userCollection("assignments")

export async function getAllAssignments(): Promise<Assignment[]> {
  const snapshot = await getDocs(collection(db, COLLECTION))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Assignment)
}

export async function createAssignment(
  budgetItemId: string,
  personId: string,
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    budgetItemId,
    personId,
  })
  return docRef.id
}

export async function deleteAssignment(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}

export async function deleteAssignmentsByPerson(personId: string): Promise<void> {
  const q = query(collection(db, COLLECTION), where("personId", "==", personId))
  const snapshot = await getDocs(q)
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)))
}

export async function deleteAssignmentsByBudgetItem(budgetItemId: string): Promise<void> {
  const q = query(collection(db, COLLECTION), where("budgetItemId", "==", budgetItemId))
  const snapshot = await getDocs(q)
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)))
}
