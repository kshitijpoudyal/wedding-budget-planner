import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type BudgetToolbarProps = {
  // Search
  search: string
  onSearchChange: (value: string) => void
  // Sort
  sortValue: string
  onSortChange: (value: string) => void
  // Selection
  selectionMode: boolean
  onSelectionModeChange: (enabled: boolean) => void
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onClearSelection: () => void
  // Add
  onAdd: () => void
  // State
  hasItems: boolean
  className?: string
}

const SORT_OPTIONS = [
  { value: "budget", label: "Budget", icon: "payments" },
  { value: "alpha", label: "Name", icon: "sort_by_alpha" },
  { value: "date", label: "Date", icon: "schedule" },
] as const

export function BudgetToolbar({
  search,
  onSearchChange,
  sortValue,
  onSortChange,
  selectionMode,
  onSelectionModeChange,
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onAdd,
  hasItems,
  className,
}: BudgetToolbarProps) {
  // Parse sort value
  const [sortBy, direction] = sortValue.split("-") as [string, string]
  const isAsc = direction === "asc"

  const handleSortSelect = (value: string) => {
    if (value === sortBy) {
      // Tapping active chip toggles direction
      onSortChange(`${value}-${isAsc ? "desc" : "asc"}`)
    } else {
      onSortChange(`${value}-${direction}`)
    }
  }

  const toggleDirection = () => {
    onSortChange(`${sortBy}-${isAsc ? "desc" : "asc"}`)
  }

  return (
    <div className={cn("rounded-2xl bg-card glass-card p-4 space-y-3", className)}>
      {/* Row 1: Full-width search */}
      <div className="relative">
        <Icon
          name="search"
          size="md"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          type="search"
          placeholder="Search budget items..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-11 text-sm"
        />
      </div>

      {/* Row 2: Sort chips + direction + actions */}
      <div className="flex items-center gap-2">
        {/* Sort chips — scrollable on mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {SORT_OPTIONS.map((opt) => {
            const isActive = sortBy === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSortSelect(opt.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 select-none",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(18,117,226,0.25)] dark:shadow-[0_2px_8px_rgba(164,201,255,0.15)]"
                    : "bg-surface-container-low text-muted-foreground hover:bg-surface-container hover:text-foreground"
                )}
              >
                <Icon name={opt.icon} size="xs" />
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            )
          })}

          {/* Direction toggle */}
          <button
              type="button"
              onClick={toggleDirection}
              className="inline-flex items-center justify-center rounded-full size-7 bg-surface-container-low text-muted-foreground hover:bg-surface-container hover:text-foreground transition-all duration-200"
              title={isAsc ? "Ascending" : "Descending"}
            >
              <Icon name={isAsc ? "arrow_upward" : "arrow_downward"} size="xs" />
            </button>
        </div>

        {/* Right-side actions */}
        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          {/* Selection toggle */}
          {hasItems && (
            <Button
              variant={selectionMode ? "secondary" : "ghost"}
              size="sm"
              onClick={() => {
                if (selectionMode) {
                  onClearSelection()
                  onSelectionModeChange(false)
                } else {
                  onSelectionModeChange(true)
                }
              }}
            >
              <Icon name={selectionMode ? "close" : "checklist"} size="sm" />
              <span className="hidden sm:inline">
                {selectionMode ? "Cancel" : "Select"}
              </span>
            </Button>
          )}

          {/* Add button */}
          <Button onClick={onAdd} size="sm">
            <Icon name="add" size="sm" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>

      {/* Selection row */}
      {selectionMode && hasItems && (
        <div className="flex items-center gap-2 text-sm pt-1 border-t border-border/30">
          <span className="text-muted-foreground">
            {selectedCount} of {totalCount} selected
          </span>
          <Button
            variant="ghost"
            size="xs"
            onClick={selectedCount === totalCount ? onClearSelection : onSelectAll}
          >
            {selectedCount === totalCount ? "Deselect all" : "Select all"}
          </Button>
        </div>
      )}
    </div>
  )
}
