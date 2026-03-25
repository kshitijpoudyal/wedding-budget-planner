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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSettings } from "@/hooks/useSettings"
import { toDisplayAmount, toStorageAmount } from "@/lib/currency"
import type { BudgetItem, BudgetItemInput } from "@/types"

type BudgetItemFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: BudgetItemInput) => void
  loading?: boolean
  /** If provided, we're editing; otherwise creating */
  item?: BudgetItem | null
  /** parentId for new child items */
  parentId?: string | null
  /** Whether this item is a parent (has children) — amounts are read-only */
  isParent?: boolean
}

export function BudgetItemForm({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
  item,
  parentId = null,
  isParent = false,
}: BudgetItemFormProps) {
  const { data: settings } = useSettings()
  const currency = settings?.currency ?? "USD"
  const rate = settings?.exchangeRate ?? 1
  const currencyLabel = currency === "USD" ? "$" : "रु"

  const [name, setName] = useState("")
  const [budgetAmount, setBudgetAmount] = useState("")
  const [spentAmount, setSpentAmount] = useState("")
  const [status, setStatus] = useState<BudgetItem["status"]>("active")

  useEffect(() => {
    if (open) {
      if (item) {
        setName(item.name)
        // Convert stored USD to display currency
        setBudgetAmount(String(Math.round(toDisplayAmount(item.budgetAmount, currency, rate) * 100) / 100))
        setSpentAmount(String(Math.round(toDisplayAmount(item.spentAmount, currency, rate) * 100) / 100))
        setStatus(item.status)
      } else {
        setName("")
        setBudgetAmount("")
        setSpentAmount("")
        setStatus("active")
      }
    }
  }, [open, item, currency, rate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Convert user-entered display currency back to USD for storage
    onSubmit({
      name: name.trim(),
      budgetAmount: toStorageAmount(Number(budgetAmount) || 0, currency, rate),
      spentAmount: toStorageAmount(Number(spentAmount) || 0, currency, rate),
      parentId: item ? item.parentId : parentId,
      status,
    })
  }

  const isEditing = !!item
  const title = isEditing ? "Edit Budget Item" : "Add Budget Item"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Catering"
              required
            />
          </div>

          {!isParent && (
            <>
              <div className="space-y-2">
                <Label htmlFor="budgetAmount">Budget Amount ({currencyLabel})</Label>
                <Input
                  id="budgetAmount"
                  type="number"
                  min="0"
                  step="any"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="spentAmount">Spent Amount ({currencyLabel})</Label>
                <Input
                  id="spentAmount"
                  type="number"
                  min="0"
                  step="any"
                  value={spentAmount}
                  onChange={(e) => setSpentAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as BudgetItem["status"])}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
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
