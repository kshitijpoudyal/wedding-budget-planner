import { useState } from "react"
import { Timestamp } from "firebase/firestore"
import { Icon } from "@/components/ui/icon"
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { usePayments, useCreatePayment, useDeletePayment } from "@/hooks/usePayments"
import { useSettings } from "@/hooks/useSettings"
import { formatCurrency } from "@/lib/currency"
import type { PaymentInput } from "@/types"

type PaymentHistoryProps = {
  budgetItemId: string
  itemName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank", label: "Bank Transfer" },
  { value: "other", label: "Other" },
] as const

export function PaymentHistory({
  budgetItemId,
  itemName,
  open,
  onOpenChange,
}: PaymentHistoryProps) {
  const { data: payments = [], isLoading } = usePayments(budgetItemId)
  const { data: settings } = useSettings()
  const currency = settings?.currency ?? "USD"
  const rate = settings?.exchangeRate ?? 1

  const createPayment = useCreatePayment()
  const deletePayment = useDeletePayment()

  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [newPayment, setNewPayment] = useState<{
    amount: number
    date: string
    method: PaymentInput["method"]
    note: string
  }>({
    amount: 0,
    date: new Date().toISOString().split("T")[0], // Default to today
    method: null,
    note: "",
  })

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPayment.amount || newPayment.amount <= 0) return

    await createPayment.mutateAsync({
      budgetItemId,
      amount: newPayment.amount,
      date: Timestamp.fromDate(new Date(newPayment.date)),
      method: newPayment.method ?? null,
      note: newPayment.note || null,
    })

    setNewPayment({
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      method: null,
      note: "",
    })
    setShowAddForm(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deletePayment.mutateAsync(deleteId)
    setDeleteId(null)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Payment History</SheetTitle>
            <SheetDescription>{itemName}</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Total summary */}
            <div className="rounded-lg bg-surface-container-low p-4">
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold tabular-nums">
                {formatCurrency(totalPaid, currency, rate)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {payments.length} payment{payments.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Add payment button/form */}
            {showAddForm ? (
              <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="payment-amount">Amount *</Label>
                    <Input
                      id="payment-amount"
                      type="number"
                      min={0}
                      step={0.01}
                      value={newPayment.amount || ""}
                      onChange={(e) =>
                        setNewPayment((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-date">Date *</Label>
                    <Input
                      id="payment-date"
                      type="date"
                      value={newPayment.date}
                      onChange={(e) => setNewPayment((p) => ({ ...p, date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method">Method</Label>
                  <Select
                    value={newPayment.method ?? ""}
                    onValueChange={(v) =>
                      setNewPayment((p) => ({
                        ...p,
                        method: v as PaymentInput["method"],
                      }))
                    }
                  >
                    <SelectTrigger id="payment-method">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-note">Note</Label>
                  <Input
                    id="payment-note"
                    value={newPayment.note || ""}
                    onChange={(e) => setNewPayment((p) => ({ ...p, note: e.target.value }))}
                    placeholder="Payment note..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createPayment.isPending}>
                    {createPayment.isPending ? "Saving..." : "Add Payment"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button onClick={() => setShowAddForm(true)} className="w-full">
                <Icon name="add" size="md" />
                <span className="ml-1">Add Payment</span>
              </Button>
            )}

            {/* Payment list */}
            <div className="space-y-2">
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
              ) : payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 italic">
                  No payments recorded yet
                </p>
              ) : (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-surface-container-low p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium tabular-nums">
                        {formatCurrency(payment.amount, currency, rate)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {payment.date.toDate().toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {payment.method && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{payment.method}</span>
                          </>
                        )}
                      </div>
                      {payment.note && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {payment.note}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(payment.id)}
                      className="shrink-0"
                    >
                      <Icon name="delete" size="sm" className="text-error" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Payment"
        description="This will permanently delete this payment record."
        confirmLabel="Delete"
        loading={deletePayment.isPending}
        onConfirm={handleDelete}
      />
    </>
  )
}
