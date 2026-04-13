import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(
  timestamp: { toDate(): Date } | null | undefined,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
): string {
  if (!timestamp) return ""
  return timestamp.toDate().toLocaleDateString("en-US", options)
}
