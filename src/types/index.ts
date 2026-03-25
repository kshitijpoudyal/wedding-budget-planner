import type { Timestamp } from "firebase/firestore"

export type BudgetItem = {
  id: string
  name: string
  budgetAmount: number
  spentAmount: number
  parentId: string | null
  status: "draft" | "active" | "pending" | "closed"
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type Settings = {
  currency: "NPR" | "USD"
  exchangeRate: number
}

export type BudgetItemInput = Omit<BudgetItem, "id" | "createdAt" | "updatedAt">
