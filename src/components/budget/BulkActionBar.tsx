import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { BudgetItem } from "@/types"

type BulkActionBarProps = {
  selectedCount: number
  onStatusChange: (status: BudgetItem["status"]) => void
  onClearSelection: () => void
  loading?: boolean
}

export function BulkActionBar({
  selectedCount,
  onStatusChange,
  onClearSelection,
  loading,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl bg-card glass-card px-4 py-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClearSelection}
        className="shrink-0"
      >
        <Icon name="close" size="md" />
      </Button>
      
      <span className="text-sm font-medium whitespace-nowrap">
        {selectedCount} selected
      </span>

      <div className="h-6 w-px bg-border" />

      <Select
        value=""
        onValueChange={(v) => {
          if (v) onStatusChange(v as BudgetItem["status"])
        }}
        disabled={loading}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder={loading ? "Updating..." : "Set status"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">
            <Icon name="edit_note" size="sm" className="text-muted-foreground" />
            Draft
          </SelectItem>
          <SelectItem value="finalized">
            <Icon name="check_circle" size="sm" className="text-primary" />
            Finalized
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
