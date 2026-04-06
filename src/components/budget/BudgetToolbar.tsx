import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type BudgetToolbarProps = {
  // Search
  search: string
  onSearchChange: (value: string) => void
  // Sort
  sortValue: string
  onSortChange: (value: string) => void
  // Filter by status
  statusFilter: string
  onStatusFilterChange: (value: string) => void
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
  { value: "status", label: "Status", icon: "label" },
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
  const [sortBy, direction] = sortValue === "status"
    ? ["status", "desc"]
    : sortValue.split("-") as [string, string]
  const isAsc = direction === "asc"

  const handleSortChange = (newSortBy: string | null) => {
    if (!newSortBy) return
    if (newSortBy === "status") {
      onSortChange("status")
    } else {
      onSortChange(`${newSortBy}-${direction}`)
    }
  }

  const toggleDirection = () => {
    if (sortBy === "status") return
    onSortChange(`${sortBy}-${isAsc ? "desc" : "asc"}`)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Main toolbar row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Icon
            name="search"
            size="sm"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-9"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger size="sm" className="h-9 w-auto gap-1 rounded-r-none border-r-0">
              <Icon name="sort" size="sm" className="text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex items-center gap-2">
                    <Icon name={opt.icon} size="sm" className="text-muted-foreground" />
                    {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {sortBy !== "status" && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDirection}
              className="h-9 px-2 rounded-l-none"
            >
              <Icon name={isAsc ? "arrow_upward" : "arrow_downward"} size="sm" />
            </Button>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1 hidden sm:block" />

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
            className="h-9"
          >
            <Icon name={selectionMode ? "close" : "checklist"} size="sm" />
            <span className="ml-1 hidden sm:inline">
              {selectionMode ? "Cancel" : "Select"}
            </span>
          </Button>
        )}

        {/* Add button */}
        <Button onClick={onAdd} size="sm" className="h-9">
          <Icon name="add" size="sm" />
          <span className="ml-1 hidden sm:inline">Add</span>
        </Button>
      </div>

      {/* Selection row - only shown in selection mode */}
      {selectionMode && hasItems && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            {selectedCount} of {totalCount} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={selectedCount === totalCount ? onClearSelection : onSelectAll}
            className="h-7 px-2"
          >
            {selectedCount === totalCount ? "Deselect all" : "Select all"}
          </Button>
        </div>
      )}
    </div>
  )
}
