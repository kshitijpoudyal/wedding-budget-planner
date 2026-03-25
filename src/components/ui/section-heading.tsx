import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  title: string
  subtitle?: string
  className?: string
}

export function SectionHeading({ title, subtitle, className }: SectionHeadingProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  )
}
