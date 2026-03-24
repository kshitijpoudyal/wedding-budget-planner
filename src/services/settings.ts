import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Settings } from "@/types"

const DOC_PATH = "settings/global"

const DEFAULT_SETTINGS: Settings = {
  currency: "NPR",
  exchangeRate: 1,
}

export async function getSettings(): Promise<Settings> {
  const snap = await getDoc(doc(db, DOC_PATH))
  if (!snap.exists()) return DEFAULT_SETTINGS
  return snap.data() as Settings
}

export async function updateSettings(data: Partial<Settings>): Promise<void> {
  await setDoc(doc(db, DOC_PATH), data, { merge: true })
}
