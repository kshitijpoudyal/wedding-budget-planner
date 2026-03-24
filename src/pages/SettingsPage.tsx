import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
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
import { SectionHeading } from "@/components/ui/section-heading"
import { useSettings } from "@/hooks/useSettings"
import { useUpdateSettings } from "@/hooks/useSettingsMutations"
import { useTheme } from "@/hooks/useTheme"
import { useAuth } from "@/contexts/AuthContext"
import { auth } from "@/lib/firebase"
import { queryClient } from "@/lib/queryClient"
import type { Settings } from "@/types"

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [currency, setCurrency] = useState<Settings["currency"]>("NPR")
  const [exchangeRate, setExchangeRate] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings) {
      setCurrency(settings.currency)
      setExchangeRate(String(settings.exchangeRate))
    }
  }, [settings])

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-2xl mx-auto">
      <SectionHeading title="Settings" subtitle="Configure your planner" />

      {/* Currency */}
      <section className="rounded-xl bg-card p-4 md:p-5 shadow-[0_20px_40px_rgba(128,82,83,0.06)] dark:shadow-none dark:bg-surface-container-low space-y-4">
        <h3 className="font-heading text-base font-bold">Currency</h3>

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
      </section>

      {/* Appearance */}
      <section className="rounded-xl bg-card p-4 md:p-5 shadow-[0_20px_40px_rgba(128,82,83,0.06)] dark:shadow-none dark:bg-surface-container-low space-y-4">
        <h3 className="font-heading text-base font-bold">Appearance</h3>
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
      <section className="rounded-xl bg-card p-4 md:p-5 shadow-[0_20px_40px_rgba(128,82,83,0.06)] dark:shadow-none dark:bg-surface-container-low space-y-4">
        <h3 className="font-heading text-base font-bold">Account</h3>
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
