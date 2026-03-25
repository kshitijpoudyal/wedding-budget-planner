import { Icon } from "@/components/ui/icon"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type FilterBarProps = {
  sortValue: string
  onSortChange: (value: string) => void
  className?: string
}

export function FilterBar({ sortValue, onSortChange, className }: FilterBarProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Icon name="filter_list" size="md" className="text-muted-foreground" />
      <Select value={sortValue} onValueChange={(v) => { if (v) onSortChange(v) }}>
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default</SelectItem>
          <SelectItem value="alpha-asc">Name (A → Z)</SelectItem>
          <SelectItem value="alpha-desc">Name (Z → A)</SelectItem>
          <SelectItem value="date-desc">Recently Modified</SelectItem>
          <SelectItem value="date-asc">Oldest Modified</SelectItem>
          <SelectItem value="budget-desc">Budget (High → Low)</SelectItem>
          <SelectItem value="budget-asc">Budget (Low → High)</SelectItem>
          <SelectItem value="status">Status</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
