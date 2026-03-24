import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Person } from "@/types"

type PersonFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (name: string) => void
  loading?: boolean
  person?: Person | null
}

export function PersonForm({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
  person,
}: PersonFormProps) {
  const [name, setName] = useState("")

  useEffect(() => {
    if (open) {
      setName(person?.name ?? "")
    }
  }, [open, person])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(name.trim())
  }

  const isEditing = !!person

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Person" : "Add Person"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personName">Name</Label>
            <Input
              id="personName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Williams"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Saving..." : isEditing ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
