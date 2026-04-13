import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteSharedBudget, publishSharedBudget } from "@/services/sharing"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SectionHeading } from "@/components/ui/section-heading"
import { useSettings } from "@/hooks/useSettings"
import { useUpdateSettings } from "@/hooks/useSettingsMutations"
import { useTheme } from "@/hooks/useTheme"
import { useAuth, useUserId } from "@/contexts/AuthContext"
import { auth } from "@/lib/firebase"
import { queryClient } from "@/lib/queryClient"
import { useBudgetItems } from "@/hooks/useBudgetItems"
import { bulkUpdateBudgetItems } from "@/services/budgetItems"
import { cn } from "@/lib/utils"
import type { Settings } from "@/types"

export default function SettingsPage() {
  const { data: settings, isLoading, isError, error } = useSettings()
  const updateSettings = useUpdateSettings()
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: items } = useBudgetItems()
  const userId = useUserId()

  const [currency, setCurrency] = useState<Settings["currency"]>("USD")
  const [exchangeRate, setExchangeRate] = useState("")
  const [lockRate, setLockRate] = useState(false)
  const [lockRateLoading, setLockRateLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sharingEnabled, setSharingEnabled] = useState(false)
  const [shareLoading, setShareLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (settings) {
      setCurrency(settings.currency)
      setExchangeRate(String(settings.exchangeRate))
      setLockRate(settings.lockRate ?? false)
      setSharingEnabled(settings.sharingEnabled ?? false)
    }
  }, [settings])

  const shareUrl = `${window.location.origin}/shared/${userId}`

  const buildSnapshot = () => ({
    userId,
    items: (items ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      budgetAmount: item.budgetAmount,
      spentAmount: item.spentAmount,
      parentId: item.parentId,
      status: item.status,
      vendorName: item.vendorName,
      itemCurrency: item.itemCurrency,
    })),
    settings: { currency: settings!.currency, exchangeRate: settings!.exchangeRate },
    updatedAt: new Date().toISOString(),
  })

  const handleEnableSharing = async () => {
    setShareLoading(true)
    try {
      await publishSharedBudget(userId, buildSnapshot())
      await updateSettings.mutateAsync({ sharingEnabled: true })
      setSharingEnabled(true)
    } finally {
      setShareLoading(false)
    }
  }

  const handleDisableSharing = async () => {
    setShareLoading(true)
    try {
      await deleteSharedBudget(userId)
      await updateSettings.mutateAsync({ sharingEnabled: false })
      setSharingEnabled(false)
    } finally {
      setShareLoading(false)
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    const rate = Number(exchangeRate)
    if (rate <= 0) return
    updateSettings.mutate(
      { currency, exchangeRate: rate },
      {
        onSuccess: () => {
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        },
      },
    )
  }

  const handleToggleLockRate = async () => {
    const rate = Number(exchangeRate)
    if (rate <= 0 || lockRateLoading) return

    const newLockRate = !lockRate
    setLockRate(newLockRate)
    setLockRateLoading(true)

    try {
      await updateSettings.mutateAsync({ lockRate: newLockRate })

      const allItems = items ?? []
      const toUpdate = newLockRate
        ? allItems.filter((item) => item.spentAmount > 0)
        : allItems
      const ids = toUpdate.map((item) => item.id)

      if (ids.length > 0) {
        await bulkUpdateBudgetItems(userId, ids, {
          currencyRate: newLockRate ? rate : null,
        })
      }
    } catch (e) {
      // Revert optimistic toggle on failure
      setLockRate(!newLockRate)
      console.error(e)
    } finally {
      setLockRateLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <p className="text-destructive font-medium">Failed to load settings</p>
        <p className="text-muted-foreground text-sm">
          {(error as Error)?.message || "Please check your connection and try again."}
        </p>
      </div>
    )
  }

  return (
    <div className="p-5 md:p-8 space-y-8 max-w-2xl mx-auto">
      <SectionHeading title="Settings" subtitle="Configure your planner" />

      {/* Currency */}
      <section className="rounded-2xl bg-card glass-card p-5 md:p-6 space-y-5">
        <h3 className="text-base font-extrabold tracking-tight">Currency</h3>

        <div className="space-y-2">
          <Label htmlFor="currency">Display Currency</Label>
          <Select value={currency} onValueChange={(v) => { if (v) setCurrency(v as Settings["currency"]) }}>
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NPR">NPR — Nepalese Rupee</SelectItem>
              <SelectItem value="USD">USD — US Dollar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="exchangeRate">Exchange Rate (NPR per 1 USD)</Label>
          <Input
            id="exchangeRate"
            type="number"
            min="0.01"
            step="any"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value)}
            placeholder="e.g. 133.5"
          />
          {Number(exchangeRate) <= 0 && exchangeRate !== "" && (
            <p className="text-xs text-destructive">Exchange rate must be greater than 0</p>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending || Number(exchangeRate) <= 0}
        >
          {updateSettings.isPending ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </Button>

        <div className="flex items-center justify-between gap-4 pt-1">
          <div>
            <p className="text-sm font-medium">Lock Rate</p>
            <p className="text-xs text-muted-foreground">
              {lockRate
                ? "Spent amounts are frozen at the rate they were entered"
                : "Spent amounts update when the exchange rate changes"}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={lockRate}
            disabled={lockRateLoading || Number(exchangeRate) <= 0}
            onClick={handleToggleLockRate}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
              lockRate ? "bg-primary" : "bg-muted-foreground/30",
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200",
                lockRate ? "translate-x-6" : "translate-x-1",
              )}
            />
          </button>
        </div>
      </section>

      {/* Appearance */}
      <section className="rounded-2xl bg-card glass-card p-5 md:p-6 space-y-5">
        <h3 className="text-base font-extrabold tracking-tight">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Dark Mode</p>
            <p className="text-xs text-muted-foreground">
              {theme === "dark" ? "Velvet aesthetic enabled" : "Paper aesthetic enabled"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <Icon name={theme === "dark" ? "light_mode" : "dark_mode"} size="lg" />
          </Button>
        </div>
      </section>

      {/* Share Budget */}
      <section className="rounded-2xl bg-card glass-card p-5 md:p-6 space-y-5">
        <div>
          <h3 className="text-base font-extrabold tracking-tight">Share Budget</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Share a fixed read-only link with family. The URL never changes — just toggle access on or off.
          </p>
        </div>

        {sharingEnabled ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
              <Icon name="link" size="sm" className="text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground truncate flex-1 tabular-nums">{shareUrl}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopyLink} variant="outline" size="sm" className="flex-1">
                <Icon name={copied ? "check" : "content_copy"} size="sm" className="mr-1.5" />
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button
                onClick={handleDisableSharing}
                variant="outline"
                size="sm"
                disabled={shareLoading}
                className="text-destructive hover:text-destructive"
              >
                <Icon name="link_off" size="sm" className="mr-1.5" />
                Stop Sharing
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Updates automatically whenever you make changes to the budget.
            </p>
          </div>
        ) : (
          <Button onClick={handleEnableSharing} variant="outline" disabled={shareLoading || !settings}>
            <Icon name="share" size="sm" className="mr-2" />
            {shareLoading ? "Enabling..." : "Enable Sharing"}
          </Button>
        )}
      </section>

      {/* Account */}
      <section className="rounded-2xl bg-card glass-card p-5 md:p-6 space-y-5">
        <h3 className="text-base font-extrabold tracking-tight">Account</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Signed in</p>
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              await signOut(auth)
              queryClient.clear()
              navigate("/login", { replace: true })
            }}
          >
            <Icon name="logout" size="md" className="mr-2" />
            Sign Out
          </Button>
        </div>
      </section>
    </div>
  )
}
