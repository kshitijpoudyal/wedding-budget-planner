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

const COLLECTION = userCollection("people")

export async function getAllPeople(): Promise<Person[]> {
  const snapshot = await getDocs(collection(db, COLLECTION))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Person)
}

export async function createPerson(input: PersonInput): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updatePerson(
  id: string,
  data: Partial<PersonInput>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data)
}

export async function deletePerson(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}
