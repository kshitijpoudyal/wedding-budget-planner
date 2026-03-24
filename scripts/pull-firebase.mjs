import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore"
import { writeFileSync } from "fs"

const firebaseConfig = {
  apiKey: "AIzaSyAwQYdccYxg2kO9zA7H6YXPAwxQnoZkOXg",
  authDomain: "wedding-budget-planner-15882.firebaseapp.com",
  projectId: "wedding-budget-planner-15882",
  storageBucket: "wedding-budget-planner-15882.firebasestorage.app",
  messagingSenderId: "684492032315",
  appId: "1:684492032315:web:3994fc9778b6e351484f1e",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const USER_PATH = "users/5f1jhWVLSZc4Bl9Ym6A81d3dF8G2"

async function pullCollection(name) {
  const snap = await getDocs(collection(db, `${USER_PATH}/${name}`))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

async function pullDoc(path) {
  const snap = await getDoc(doc(db, path))
  return snap.exists() ? snap.data() : null
}

async function main() {
  console.log("Pulling data from Firebase...")

  const data = {
    budgetItems: await pullCollection("budgetItems"),
    people: await pullCollection("people"),
    assignments: await pullCollection("assignments"),
    settings: await pullDoc(`${USER_PATH}/settings/global`),
  }

  const outPath = "firebase-data.json"
  writeFileSync(outPath, JSON.stringify(data, null, 2))
  console.log(`Done! Wrote ${outPath}`)
  console.log(`  budgetItems: ${data.budgetItems.length}`)
  console.log(`  people: ${data.people.length}`)
  console.log(`  assignments: ${data.assignments.length}`)
  console.log(`  settings: ${data.settings ? "found" : "not found"}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
