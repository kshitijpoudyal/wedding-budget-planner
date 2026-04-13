import { useState } from "react"
import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
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
  const [pendingStatus, setPendingStatus] = useState<BudgetItem["status"] | null>(null)

  if (selectedCount === 0) return null

  const handleConfirm = () => {
    if (pendingStatus) {
      onStatusChange(pendingStatus)
      setPendingStatus(null)
    }
  }

  return (
    <>
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
            if (v) setPendingStatus(v as BudgetItem["status"])
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
            <SelectItem value="complete">
              <Icon name="task_alt" size="sm" className="text-emerald-600 dark:text-emerald-400" />
              Complete
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ConfirmDialog
        open={!!pendingStatus}
        onOpenChange={(open) => !open && setPendingStatus(null)}
        title={`Update ${selectedCount} Item${selectedCount !== 1 ? "s" : ""}`}
        description={`Set status to "${pendingStatus}" for all selected items?`}
        confirmLabel="Update"
        variant="default"
        onConfirm={handleConfirm}
      />
    </>
  )
}
