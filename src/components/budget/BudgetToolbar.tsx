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

  // Cycle through sort options on mobile
  const cycleSortOption = () => {
    const currentIndex = SORT_OPTIONS.findIndex((opt) => opt.value === sortBy)
    const nextIndex = (currentIndex + 1) % SORT_OPTIONS.length
    const nextSort = SORT_OPTIONS[nextIndex].value
    if (nextSort === "status") {
      onSortChange("status")
    } else {
      onSortChange(`${nextSort}-${direction}`)
    }
  }

  // Get current sort icon for mobile button
  const currentSortIcon = SORT_OPTIONS.find((opt) => opt.value === sortBy)?.icon ?? "sort"

  return (
    <div className={cn("rounded-xl bg-surface-container-low glass-surface p-2 space-y-2", className)}>
      {/* Main toolbar row */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-0 sm:max-w-xs">
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
            className="pl-8"
          />
        </div>

        {/* Sort — mobile: icon button that cycles options */}
        <Button
          variant="ghost"
          size="icon"
          onClick={cycleSortOption}
          className="sm:hidden"
          title={`Sort by ${SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}`}
        >
          <Icon name={currentSortIcon} size="md" />
        </Button>

        {/* Sort — desktop: select + direction toggle */}
        <div className="hidden sm:flex items-center">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-auto gap-1 rounded-r-none border-r-0">
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
              onClick={toggleDirection}
              className="px-2 rounded-l-none"
            >
              <Icon name={isAsc ? "arrow_upward" : "arrow_downward"} size="sm" />
            </Button>
          )}
        </div>

        {/* Right-side actions */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Selection toggle */}
          {hasItems && (
            <Button
              variant={selectionMode ? "secondary" : "ghost"}
              size="icon"
              onClick={() => {
                if (selectionMode) {
                  onClearSelection()
                  onSelectionModeChange(false)
                } else {
                  onSelectionModeChange(true)
                }
              }}
              className="sm:w-auto sm:px-2.5 sm:gap-1.5"
            >
              <Icon name={selectionMode ? "close" : "checklist"} size="md" className="sm:[font-size:14px]" />
              <span className="hidden sm:inline text-sm">
                {selectionMode ? "Cancel" : "Select"}
              </span>
            </Button>
          )}

          {/* Add button */}
          <Button
            onClick={onAdd}
            size="icon"
            className="sm:w-auto sm:px-2.5 sm:gap-1.5"
          >
            <Icon name="add" size="md" className="sm:[font-size:14px]" />
            <span className="hidden sm:inline text-sm">Add</span>
          </Button>
        </div>
      </div>

      {/* Selection row */}
      {selectionMode && hasItems && (
        <div className="flex items-center gap-2 text-sm px-0.5">
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
