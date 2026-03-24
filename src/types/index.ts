import type { Timestamp } from "firebase/firestore"

export type BudgetItem = {
  id: string
  name: string
  budgetAmount: number
  spentAmount: number
  parentId: string | null
  status: "active" | "pending" | "closed"
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type Person = {
  id: string
  name: string
  createdAt: Timestamp
}

export type Assignment = {
  id: string
  budgetItemId: string
  personId: string
}

export type Settings = {
  currency: "NPR" | "USD"
  exchangeRate: number
}

export type BudgetItemInput = Omit<BudgetItem, "id" | "createdAt" | "updatedAt">

export type PersonInput = Omit<Person, "id" | "createdAt">
