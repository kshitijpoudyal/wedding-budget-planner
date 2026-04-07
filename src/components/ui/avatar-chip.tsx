import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { getCategoryColor } from "@/lib/categoryColors"

type AvatarChipProps = {
  name: string
  onRemove?: () => void
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function AvatarChip({ name, onRemove, className }: AvatarChipProps) {
  const color = getCategoryColor(name)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-foreground dark:text-foreground",
        color.chipBg,
        className,
      )}
    >
      <span className={cn("flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white", color.chipCircle)}>
        {getInitials(name)}
      </span>
      <span className="truncate max-w-[80px]">{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors duration-200"
        >
          <Icon name="close" size="xs" />
        </button>
      )}
    </span>
  )
}
