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
import type { Person, PersonInput } from "@/types"

export async function getAllPeople(userId: string): Promise<Person[]> {
  const snapshot = await getDocs(collection(db, userCollection(userId, "people")))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Person)
}

export async function createPerson(userId: string, input: PersonInput): Promise<string> {
  const docRef = await addDoc(collection(db, userCollection(userId, "people")), {
    ...input,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updatePerson(
  userId: string,
  id: string,
  data: Partial<PersonInput>,
): Promise<void> {
  await updateDoc(doc(db, userCollection(userId, "people"), id), data)
}

export async function deletePerson(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, userCollection(userId, "people"), id))
}
