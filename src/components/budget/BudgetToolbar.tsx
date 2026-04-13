import { useState, useRef, useEffect } from "react"
import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { SearchFilter } from "@/types"

export type { SearchFilter }

type BudgetToolbarProps = {
  // Search
  search: string
  onSearchChange: (value: string) => void
  searchFilter: SearchFilter
  onSearchFilterChange: (value: SearchFilter) => void
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

const FILTER_OPTIONS: { value: SearchFilter; label: string; icon: string }[] = [
  { value: "all", label: "All fields", icon: "search" },
  { value: "name", label: "Name", icon: "badge" },
  { value: "vendor", label: "Vendor", icon: "storefront" },
  { value: "notes", label: "Notes", icon: "sticky_note_2" },
]

const SORT_OPTIONS = [
  { value: "budget", label: "Budget", icon: "payments" },
  { value: "date", label: "Date modified", icon: "schedule" },
] as const

export function BudgetToolbar({
  search,
  onSearchChange,
  searchFilter,
  onSearchFilterChange,
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
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [dropdownOpen])

  // Parse sort value
  const [sortBy, direction] = sortValue.split("-") as [string, string]
  const isAsc = direction === "asc"

  const handleSortSelect = (value: string) => {
    if (value === sortBy) {
      // Toggle direction
      onSortChange(`${value}-${isAsc ? "desc" : "asc"}`)
    } else {
      onSortChange(`${value}-${direction}`)
    }
    setDropdownOpen(false)
  }

  const activeFilter = FILTER_OPTIONS.find((f) => f.value === searchFilter) ?? FILTER_OPTIONS[0]
  const placeholder = searchFilter === "all"
    ? "Search budget items..."
    : `Search by ${activeFilter.label.toLowerCase()}...`

  const hasActiveFilter = searchFilter !== "all"

  return (
    <div className={cn("rounded-2xl bg-card glass-card p-3 space-y-2.5 relative z-10", className)}>
      {/* Search bar with dropdown button on the right + action buttons */}
      <div className="flex items-center gap-2">
        {/* Search + dropdown */}
        <div className="relative flex-1 min-w-0" ref={dropdownRef}>
          <Icon
            name="search"
            size="md"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />

          <Input
            type="search"
            placeholder={placeholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 h-11 text-sm"
          />

          {/* Dropdown trigger — right side inside search bar */}
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={cn(
              "absolute right-1.5 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center rounded-lg size-8 transition-all duration-200",
              hasActiveFilter
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-container"
            )}
            title="Sort & filter"
          >
            <Icon name="tune" size="md" />
          </button>

          {/* Dropdown: sort + filter */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 z-50 rounded-xl bg-popover glass-card p-1.5 min-w-[200px]">
              {/* Sort section */}
              <p className="px-2.5 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Sort by</p>
              {SORT_OPTIONS.map((opt) => {
                const isActive = sortBy === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSortSelect(opt.value)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-150",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-surface-container"
                    )}
                  >
                    <Icon name={opt.icon} size="sm" className={isActive ? "text-primary" : "text-muted-foreground"} />
                    {opt.label}
                    {isActive && (
                      <span className="ml-auto flex items-center gap-1 text-primary">
                        <Icon name={isAsc ? "arrow_upward" : "arrow_downward"} size="xs" />
                      </span>
                    )}
                  </button>
                )
              })}

              {/* Divider */}
              <div className="my-1.5 h-px bg-border/40" />

              {/* Filter section */}
              <p className="px-2.5 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Search in</p>
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onSearchFilterChange(opt.value)
                    setDropdownOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-150",
                    searchFilter === opt.value
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-surface-container"
                  )}
                >
                  <Icon name={opt.icon} size="sm" className={searchFilter === opt.value ? "text-primary" : "text-muted-foreground"} />
                  {opt.label}
                  {searchFilter === opt.value && (
                    <Icon name="check" size="sm" className="ml-auto text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

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
            title={selectionMode ? "Cancel selection" : "Select items"}
          >
            <Icon name={selectionMode ? "close" : "checklist"} size="md" />
          </Button>
        )}

        {/* Add button */}
        <Button onClick={onAdd} size="icon" title="Add item">
          <Icon name="add" size="md" />
        </Button>
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
