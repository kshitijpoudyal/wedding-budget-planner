import { useState, useEffect } from "react"
import { Timestamp } from "firebase/firestore"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Icon } from "@/components/ui/icon"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PaymentHistory } from "./PaymentHistory"
import { useSettings } from "@/hooks/useSettings"
import { toDisplayAmount, toStorageAmount } from "@/lib/currency"
import { cn } from "@/lib/utils"
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
  const [status, setStatus] = useState<BudgetItem["status"]>("draft")
  // Extended fields
  const [notes, setNotes] = useState("")
  const [vendorName, setVendorName] = useState("")
  const [vendorContact, setVendorContact] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [paidDate, setPaidDate] = useState("")
  const [showDetails, setShowDetails] = useState(false)
  const [showPaymentHistory, setShowPaymentHistory] = useState(false)

  // Helper to convert Timestamp to YYYY-MM-DD string
  const timestampToDateString = (ts: Timestamp | null): string => {
    if (!ts) return ""
    return ts.toDate().toISOString().split("T")[0]
  }

  // Helper to convert YYYY-MM-DD string to Timestamp
  const dateStringToTimestamp = (str: string): Timestamp | null => {
    if (!str) return null
    return Timestamp.fromDate(new Date(str))
  }

  useEffect(() => {
    if (open) {
      if (item) {
        setName(item.name)
        // Convert stored USD to display currency
        setBudgetAmount(String(Math.round(toDisplayAmount(item.budgetAmount, currency, rate) * 100) / 100))
        setSpentAmount(String(Math.round(toDisplayAmount(item.spentAmount, currency, rate) * 100) / 100))
        setStatus(item.status)
        // Extended fields
        setNotes(item.notes ?? "")
        setVendorName(item.vendorName ?? "")
        setVendorContact(item.vendorContact ?? "")
        setDueDate(timestampToDateString(item.dueDate))
        setPaidDate(timestampToDateString(item.paidDate))
        // Show details section if any extended field has data
        setShowDetails(
          !!(item.notes || item.vendorName || item.vendorContact || item.dueDate || item.paidDate)
        )
      } else {
        setName("")
        setBudgetAmount("")
        setSpentAmount("")
        setStatus("draft")
        setNotes("")
        setVendorName("")
        setVendorContact("")
        setDueDate("")
        setPaidDate("")
        setShowDetails(false)
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
      // Extended fields
      notes: notes.trim() || null,
      vendorName: vendorName.trim() || null,
      vendorContact: vendorContact.trim() || null,
      dueDate: dateStringToTimestamp(dueDate),
      paidDate: dateStringToTimestamp(paidDate),
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
                <SelectItem value="finalized">Finalized</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Collapsible Details Section */}
          <div className="border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              <Icon name={showDetails ? "expand_less" : "expand_more"} size="sm" />
              <span>Details (vendor, dates, notes)</span>
            </button>

            <div className={cn("space-y-4 mt-4", !showDetails && "hidden")}>
              {/* Vendor Section */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="vendorName">Vendor Name</Label>
                  <Input
                    id="vendorName"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. ABC Catering"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendorContact">Contact</Label>
                  <Input
                    id="vendorContact"
                    value={vendorContact}
                    onChange={(e) => setVendorContact(e.target.value)}
                    placeholder="Phone or email"
                  />
                </div>
              </div>

              {/* Dates Section */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paidDate">Paid Date</Label>
                  <Input
                    id="paidDate"
                    type="date"
                    value={paidDate}
                    onChange={(e) => setPaidDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment terms, reminders, details..."
                  rows={3}
                />
              </div>

              {/* Payment History (only for existing leaf items) */}
              {isEditing && !isParent && item && (
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowPaymentHistory(true)}
                  >
                    <Icon name="receipt_long" size="md" />
                    <span className="ml-1">Payment History</span>
                  </Button>
                </div>
              )}
            </div>
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

      {/* Payment History Sheet */}
      {item && (
        <PaymentHistory
          budgetItemId={item.id}
          itemName={item.name}
          open={showPaymentHistory}
          onOpenChange={setShowPaymentHistory}
        />
      )}
    </Dialog>
  )
}
