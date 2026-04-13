import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Settings } from "@/types"

const DEFAULT_SETTINGS: Settings = {
  currency: "USD",
  exchangeRate: 147.5,
  lockRate: false,
  shareToken: null,
}

function settingsDocPath(userId: string) {
  return `users/${userId}/settings/global`
}

export async function getSettings(userId: string): Promise<Settings> {
  const snap = await getDoc(doc(db, settingsDocPath(userId)))
  if (!snap.exists()) return DEFAULT_SETTINGS
  return snap.data() as Settings
}

export async function updateSettings(userId: string, data: Partial<Settings>): Promise<void> {
  await setDoc(doc(db, settingsDocPath(userId)), data, { merge: true })
}
