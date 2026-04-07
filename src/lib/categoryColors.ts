/**
 * Deterministic color assignment for budget categories and people.
 * Uses a string hash to always assign the same color to the same name.
 * All Tailwind classes are literal strings for JIT detection.
 */

export const CATEGORY_COLORS = [
  {
    border: "border-l-blue-500",
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
    chipBg: "bg-blue-100 dark:bg-blue-900/30",
    chipCircle: "bg-blue-500",
  },
  {
    border: "border-l-orange-500",
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    dot: "bg-orange-500",
    chipBg: "bg-orange-100 dark:bg-orange-900/30",
    chipCircle: "bg-orange-500",
  },
  {
    border: "border-l-emerald-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    chipBg: "bg-emerald-100 dark:bg-emerald-900/30",
    chipCircle: "bg-emerald-500",
  },
  {
    border: "border-l-violet-500",
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    dot: "bg-violet-500",
    chipBg: "bg-violet-100 dark:bg-violet-900/30",
    chipCircle: "bg-violet-500",
  },
  {
    border: "border-l-rose-500",
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
    chipBg: "bg-rose-100 dark:bg-rose-900/30",
    chipCircle: "bg-rose-500",
  },
  {
    border: "border-l-amber-500",
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    chipBg: "bg-amber-100 dark:bg-amber-900/30",
    chipCircle: "bg-amber-500",
  },
  {
    border: "border-l-teal-500",
    bg: "bg-teal-500/10",
    text: "text-teal-600 dark:text-teal-400",
    dot: "bg-teal-500",
    chipBg: "bg-teal-100 dark:bg-teal-900/30",
    chipCircle: "bg-teal-500",
  },
  {
    border: "border-l-fuchsia-500",
    bg: "bg-fuchsia-500/10",
    text: "text-fuchsia-600 dark:text-fuchsia-400",
    dot: "bg-fuchsia-500",
    chipBg: "bg-fuchsia-100 dark:bg-fuchsia-900/30",
    chipCircle: "bg-fuchsia-500",
  },
] as const

export function getCategoryColorIndex(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % CATEGORY_COLORS.length
}

export function getCategoryColor(name: string) {
  return CATEGORY_COLORS[getCategoryColorIndex(name)]
}
