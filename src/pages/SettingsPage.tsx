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
  const [shareError, setShareError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (settings) {
      setCurrency(settings.currency)
      setExchangeRate(String(settings.exchangeRate))
      setLockRate(settings.lockRate ?? false)
      setSharingEnabled(settings.sharingEnabled ?? false)
    }
  }, [settings])

  const appOrigin = import.meta.env.VITE_APP_URL ?? window.location.origin
  const shareUrl = `${appOrigin}/shared/${userId}`

  const handleEnableSharing = async () => {
    setShareLoading(true)
    setShareError(null)
    try {
      await publishSharedBudget(userId)
      await updateSettings.mutateAsync({ sharingEnabled: true })
      setSharingEnabled(true)
    } catch (e) {
      console.error("Failed to enable sharing:", e)
      setShareError("Failed to enable sharing. Check console for details.")
    } finally {
      setShareLoading(false)
    }
  }

  const handleDisableSharing = async () => {
    setShareLoading(true)
    setShareError(null)
    try {
      await deleteSharedBudget(userId)
      await updateSettings.mutateAsync({ sharingEnabled: false })
      setSharingEnabled(false)
    } catch (e) {
      console.error("Failed to disable sharing:", e)
      setShareError("Failed to disable sharing. Check console for details.")
    } finally {
      setShareLoading(false)
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    const rate = Number(exchangeRate)
    if (rate <= 0 || lockRateLoading) return

    setLockRateLoading(true)
    try {
      await updateSettings.mutateAsync({ currency, exchangeRate: rate, lockRate })

      const allItems = items ?? []
      const prevLockRate = settings?.lockRate ?? false
      if (lockRate !== prevLockRate) {
        const toUpdate = lockRate
          ? allItems.filter((item) => item.spentAmount > 0)
          : allItems
        const ids = toUpdate.map((item) => item.id)
        if (ids.length > 0) {
          await bulkUpdateBudgetItems(userId, ids, {
            currencyRate: lockRate ? rate : null,
          })
        }
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
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
            onClick={() => setLockRate((v) => !v)}
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

        <Button
          onClick={handleSave}
          disabled={lockRateLoading || Number(exchangeRate) <= 0}
        >
          {lockRateLoading ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </Button>
      </section>

      {/* Share Budget */}
      <section className="rounded-2xl bg-card glass-card p-5 md:p-6 space-y-5">
        <h3 className="text-base font-extrabold tracking-tight">Share Budget</h3>

        {/* Toggle row */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Enable Sharing</p>
            <p className="text-xs text-muted-foreground">
              {sharingEnabled ? "Anyone with the link can view your budget" : "Budget is private"}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={sharingEnabled}
            disabled={shareLoading || !settings}
            onClick={sharingEnabled ? handleDisableSharing : handleEnableSharing}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
              sharingEnabled ? "bg-primary" : "bg-muted-foreground/30",
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200",
                sharingEnabled ? "translate-x-6" : "translate-x-1",
              )}
            />
          </button>
        </div>

        {sharingEnabled && (
          <div className="rounded-xl bg-muted/50 px-3 py-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 min-w-0 group"
              >
                <Icon name="link" size="sm" className="text-primary/70 group-hover:text-primary shrink-0 transition-colors duration-200" />
                <p className="text-xs font-medium text-foreground">Share link</p>
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                title="Copy link"
              >
                <Icon name={copied ? "check" : "content_copy"} size="sm" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground break-all">{shareUrl}</p>
          </div>
        )}

        {shareError && (
          <p className="text-[11px] text-destructive">{shareError}</p>
        )}
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
