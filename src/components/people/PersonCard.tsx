import { useState } from "react"
import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

type PersonCardProps = {
  name: string
  assignmentCount: number
  onEdit: () => void
  onDelete: () => void
  deleteLoading: boolean
}

export function PersonCard({
  name,
  assignmentCount,
  onEdit,
  onDelete,
  deleteLoading,
}: PersonCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="group rounded-xl bg-card p-4 shadow-[0_20px_40px_rgba(128,82,83,0.06)] dark:shadow-none dark:bg-surface-container-low transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-base font-bold truncate">{name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {assignmentCount} {assignmentCount === 1 ? "assignment" : "assignments"}
          </p>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Icon name="edit" size="sm" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Icon name="delete" size="sm" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Person"
        description={`This will permanently delete "${name}" and remove all their budget assignments.`}
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={() => {
          onDelete()
          setShowDeleteConfirm(false)
        }}
      />
    </div>
  )
}
