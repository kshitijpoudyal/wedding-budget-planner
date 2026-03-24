import { cn } from "@/lib/utils"

const quotes = [
  { text: "A budget is telling your money where to go instead of wondering where it went.", author: "Dave Ramsey" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
]

type QuoteBlockProps = {
  quote?: string
  attribution?: string
  className?: string
}

export function QuoteBlock({ quote, attribution, className }: QuoteBlockProps) {
  const selected = quote
    ? { text: quote, author: attribution }
    : quotes[Math.floor(Date.now() / 86400000) % quotes.length]

  return (
    <div className={cn("rounded-xl bg-surface-container-low p-6 md:p-8 text-center", className)}>
      <p className="font-heading italic text-lg text-muted-foreground leading-relaxed">
        &ldquo;{selected.text}&rdquo;
      </p>
      {selected.author && (
        <p className="mt-3 text-sm text-muted-foreground/70">
          &mdash; {selected.author}
        </p>
      )}
    </div>
  )
}
