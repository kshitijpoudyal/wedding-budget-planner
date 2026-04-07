/**
 * One-time script to normalize budgetItem statuses in Firestore.
 * Maps: "Active", "active", "Final" → "finalized"
 *
 * Uses collectionGroup query to find all budgetItems across all users.
 *
 * Usage: node scripts/normalize-status.mjs
 */

import { readFileSync } from "fs"
import { initializeApp } from "firebase/app"
import {
  getFirestore,
  collectionGroup,
  getDocs,
  writeBatch,
} from "firebase/firestore"

// Parse .env.local for Firebase config
function loadEnv() {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf-8")
  const env = {}
  for (const line of raw.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const idx = trimmed.indexOf("=")
    if (idx === -1) continue
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1)
  }
  return env
}

const env = loadEnv()

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
})

const db = getFirestore(app)

// Statuses to normalize → target value
const STATUS_MAP = {
  Active: "finalized",
  active: "finalized",
  Final: "finalized",
}

async function run() {
  // collectionGroup queries all subcollections named "budgetItems" across all users
  const snapshot = await getDocs(collectionGroup(db, "budgetItems"))
  const toUpdate = []

  console.log(`Total budgetItems found: ${snapshot.size}`)

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data()
    const newStatus = STATUS_MAP[data.status]
    if (newStatus) {
      toUpdate.push({
        ref: docSnap.ref,
        name: data.name,
        oldStatus: data.status,
        newStatus,
        path: docSnap.ref.path,
      })
    }
  }

  if (toUpdate.length === 0) {
    console.log("No documents need updating.")
    process.exit(0)
  }

  console.log(`\nFound ${toUpdate.length} document(s) to update:`)
  for (const item of toUpdate) {
    console.log(
      `  ${item.path} "${item.name}": "${item.oldStatus}" → "${item.newStatus}"`
    )
  }

  // Firestore batches support up to 500 writes
  for (let i = 0; i < toUpdate.length; i += 500) {
    const batch = writeBatch(db)
    const chunk = toUpdate.slice(i, i + 500)
    for (const item of chunk) {
      batch.update(item.ref, { status: item.newStatus })
    }
    await batch.commit()
    console.log(`Committed batch ${Math.floor(i / 500) + 1}`)
  }

  console.log("Done.")
  process.exit(0)
}

run().catch((err) => {
  console.error("Error:", err)
  process.exit(1)
})
