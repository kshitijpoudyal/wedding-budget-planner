import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"

type CategoryActionMenuProps = {
  onEdit: () => void
  onAddChild: () => void
  onDelete: () => void
  showAddChild?: boolean
}

export function CategoryActionMenu({
  onEdit,
  onAddChild,
  onDelete,
  showAddChild = true,
}: CategoryActionMenuProps) {
  const [open, setOpen] = useState(false)

  const handleAction = (action: () => void) => {
    setOpen(false)
    action()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <Icon name="more_vert" size="md" />
          </Button>
        }
      />
      <PopoverContent className="w-40 p-1" align="end">
        <div className="flex flex-col">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors duration-200 text-left"
            onClick={() => handleAction(onEdit)}
          >
            <Icon name="edit" size="sm" />
            Edit
          </button>
          {showAddChild && (
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors duration-200 text-left"
              onClick={() => handleAction(onAddChild)}
            >
              <Icon name="add" size="sm" />
              Add Sub-item
            </button>
          )}
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors duration-200 text-left"
            onClick={() => handleAction(onDelete)}
          >
            <Icon name="delete" size="sm" />
            Delete
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
