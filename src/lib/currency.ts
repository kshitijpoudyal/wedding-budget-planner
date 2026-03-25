import type { Settings } from "@/types"

const nprFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 })
const usdFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })

function formatNPR(amount: number): string {
  return `रु ${nprFormatter.format(amount)}`
}

const formatters: Record<Settings["currency"], (amount: number) => string> = {
  NPR: formatNPR,
  USD: (amount) => usdFormatter.format(amount),
}

/**
 * Convert a stored USD amount to the display currency.
 * Exchange rate = NPR per 1 USD.
 */
export function toDisplayAmount(
  usdAmount: number,
  currency: Settings["currency"],
  exchangeRate: number,
): number {
  if (currency === "NPR" && exchangeRate > 0) return usdAmount * exchangeRate
  return usdAmount
}

/**
 * Convert a user-entered amount in the display currency back to USD for storage.
 * Exchange rate = NPR per 1 USD.
 */
export function toStorageAmount(
  displayAmount: number,
  currency: Settings["currency"],
  exchangeRate: number,
): number {
  if (currency === "NPR" && exchangeRate > 0) return displayAmount / exchangeRate
  return displayAmount
}

/**
 * Format an amount for display.
 * All data is stored in USD. When currency is NPR, the amount is
 * converted using the exchange rate (NPR per 1 USD) before formatting.
 */
export function formatCurrency(
  amount: number,
  currency: Settings["currency"],
  exchangeRate: number = 1,
): string {
  const converted = toDisplayAmount(amount, currency, exchangeRate)
  return formatters[currency](converted)
}
