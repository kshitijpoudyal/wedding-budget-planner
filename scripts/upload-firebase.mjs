import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { readFileSync } from "fs"

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

async function main() {
  const data = JSON.parse(readFileSync("firebase-data.json", "utf8"))
  const { budgetItems, people } = data

  // --- Upload People ---
  console.log(`Uploading ${people.length} people...`)
  const peopleCol = collection(db, `${USER_PATH}/people`)
  for (const person of people) {
    await addDoc(peopleCol, {
      name: person.name,
      createdAt: serverTimestamp(),
    })
  }
  console.log("  Done.")

  // --- Upload Budget Items (parents first, then children) ---
  // Build a map of old ID → item for topological ordering
  const itemMap = new Map(budgetItems.map((item) => [item.id, item]))

  // Topological sort: roots first, then their children, depth by depth
  const sorted = []
  const visited = new Set()

  function visit(item) {
    if (visited.has(item.id)) return
    // Visit parent first if it exists
    if (item.parentId && itemMap.has(item.parentId)) {
      visit(itemMap.get(item.parentId))
    }
    visited.add(item.id)
    sorted.push(item)
  }

  for (const item of budgetItems) {
    visit(item)
  }

  // Upload in order, mapping old IDs → new Firebase IDs
  const idMap = new Map() // oldId → newId
  const budgetCol = collection(db, `${USER_PATH}/budgetItems`)

  console.log(`Uploading ${sorted.length} budget items (${sorted.filter(i => !i.parentId).length} root, ${sorted.filter(i => i.parentId).length} children)...`)

  for (const item of sorted) {
    const newParentId = item.parentId ? (idMap.get(item.parentId) ?? null) : null

    if (item.parentId && !newParentId) {
      console.warn(`  ⚠ "${item.name}" references unknown parent ${item.parentId}, setting to root`)
    }

    const docRef = await addDoc(budgetCol, {
      name: item.name,
      budgetAmount: item.budgetAmount,
      spentAmount: item.spentAmount,
      parentId: newParentId,
      status: item.status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    idMap.set(item.id, docRef.id)
    const depth = item.parentId ? "  └" : " "
    console.log(`${depth} ${item.name} (${item.id} → ${docRef.id})`)
  }

  console.log("\nUpload complete!")
  console.log(`  People: ${people.length}`)
  console.log(`  Budget items: ${sorted.length}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
