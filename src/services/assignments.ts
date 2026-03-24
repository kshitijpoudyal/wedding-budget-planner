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

export async function getAllAssignments(userId: string): Promise<Assignment[]> {
  const snapshot = await getDocs(collection(db, userCollection(userId, "assignments")))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Assignment)
}

export async function createAssignment(
  userId: string,
  budgetItemId: string,
  personId: string,
): Promise<string> {
  const docRef = await addDoc(collection(db, userCollection(userId, "assignments")), {
    budgetItemId,
    personId,
  })
  return docRef.id
}

export async function deleteAssignment(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, userCollection(userId, "assignments"), id))
}

export async function deleteAssignmentsByPerson(userId: string, personId: string): Promise<void> {
  const q = query(collection(db, userCollection(userId, "assignments")), where("personId", "==", personId))
  const snapshot = await getDocs(q)
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)))
}

export async function deleteAssignmentsByBudgetItem(userId: string, budgetItemId: string): Promise<void> {
  const q = query(collection(db, userCollection(userId, "assignments")), where("budgetItemId", "==", budgetItemId))
  const snapshot = await getDocs(q)
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)))
}
