import type { Timestamp } from "firebase/firestore"

export type BudgetItem = {
  id: string
  name: string
  budgetAmount: number
  spentAmount: number
  parentId: string | null
  status: "draft" | "finalized" | "complete"
  itemCurrency: "USD" | "NPR" | null  // native currency for this item; null = follow global setting
  // Extended fields
  notes: string | null
  vendorName: string | null
  vendorContact: string | null
  dueDate: Timestamp | null
  paidDate: Timestamp | null
  currencyRate: number | null  // exchange rate (NPR/USD) locked at time spentAmount was last saved
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type Settings = {
  currency: "NPR" | "USD"
  exchangeRate: number
  lockRate: boolean  // when true, currencyRate is locked per item and won't float with rate changes
  sharingEnabled: boolean  // when true, budget is publicly readable at /shared/{userId}
}

export type BudgetItemInput = Omit<BudgetItem, "id" | "createdAt" | "updatedAt">

export const PAYMENT_METHODS = ["cash", "card", "bank", "other"] as const
export type PaymentMethod = typeof PAYMENT_METHODS[number]

// Payment tracking for partial payments / installments
export type Payment = {
  id: string
  budgetItemId: string
  amount: number
  date: Timestamp
  method: PaymentMethod | null
  note: string | null
  createdAt: Timestamp
}

export type PaymentInput = Omit<Payment, "id" | "createdAt">

export type SearchFilter = "all" | "name" | "vendor" | "notes"
