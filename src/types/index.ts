import type { Timestamp } from "firebase/firestore"

export type BudgetItem = {
  id: string
  name: string
  budgetAmount: number
  spentAmount: number
  parentId: string | null
  status: "draft" | "finalized"
  // Extended fields
  notes: string | null
  vendorName: string | null
  vendorContact: string | null
  dueDate: Timestamp | null
  paidDate: Timestamp | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type Settings = {
  currency: "NPR" | "USD"
  exchangeRate: number
}

export type BudgetItemInput = Omit<BudgetItem, "id" | "createdAt" | "updatedAt">

// Payment tracking for partial payments / installments
export type Payment = {
  id: string
  budgetItemId: string
  amount: number
  date: Timestamp
  method: "cash" | "card" | "bank" | "other" | null
  note: string | null
  createdAt: Timestamp
}

export type PaymentInput = Omit<Payment, "id" | "createdAt">
