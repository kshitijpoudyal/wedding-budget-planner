import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { userCollection } from "@/lib/userPath"
import type { Payment, PaymentInput } from "@/types"

export async function getPaymentsByItem(
  userId: string,
  budgetItemId: string,
): Promise<Payment[]> {
  const q = query(
    collection(db, userCollection(userId, "payments")),
    where("budgetItemId", "==", budgetItemId),
    orderBy("date", "desc"),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Payment)
}

export async function getAllPayments(userId: string): Promise<Payment[]> {
  const snapshot = await getDocs(collection(db, userCollection(userId, "payments")))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Payment)
}

export async function createPayment(
  userId: string,
  input: PaymentInput,
): Promise<string> {
  const docRef = await addDoc(collection(db, userCollection(userId, "payments")), {
    ...input,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function deletePayment(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, userCollection(userId, "payments"), id))
}
