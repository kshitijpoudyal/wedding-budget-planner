import { NavLink, useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { Icon, type IconName } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"
import { queryClient } from "@/lib/queryClient"

const navItems: { to: string; label: string; icon: IconName }[] = [
  { to: "/budget", label: "Budget", icon: "payments" },
  { to: "/people", label: "People", icon: "group" },
  { to: "/summary", label: "Summary", icon: "auto_graph" },
  { to: "/settings", label: "Settings", icon: "settings" },
]

type MobileSidebarProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  theme: "light" | "dark"
  onToggleTheme: () => void
}

export function MobileSidebar({ open, onOpenChange, theme, onToggleTheme }: MobileSidebarProps) {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut(auth)
    queryClient.clear()
    navigate("/login", { replace: true })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[260px] p-0">
        <SheetHeader className="h-14 px-4 flex items-center">
          <SheetTitle className="font-heading text-lg font-bold tracking-tight">
            Wedding Planner
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-2 py-2">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => onOpenChange(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200",
                  "hover:bg-surface-container hover:text-accent-foreground",
                  isActive ? "bg-surface-container text-accent-foreground" : "text-foreground/70",
                )
              }
            >
              <Icon name={icon} size="lg" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto px-2 py-3 space-y-1">
          <Button variant="ghost" onClick={onToggleTheme} className="w-full justify-start gap-3">
            <Icon name={theme === "dark" ? "light_mode" : "dark_mode"} size="md" />
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </Button>
          <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start gap-3">
            <Icon name="logout" size="md" />
            <span>Sign Out</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
