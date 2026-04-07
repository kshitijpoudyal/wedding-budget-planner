import { NavLink, useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { Icon, type IconName } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"
import { queryClient } from "@/lib/queryClient"

const navItems: { to: string; label: string; icon: IconName; color: string }[] = [
  { to: "/budget", label: "Budget", icon: "payments", color: "text-blue-600 dark:text-blue-400" },
  { to: "/summary", label: "Summary", icon: "auto_graph", color: "text-emerald-600 dark:text-emerald-400" },
  { to: "/calculator", label: "Calculator", icon: "calculate", color: "text-violet-600 dark:text-violet-400" },
  { to: "/settings", label: "Settings", icon: "settings", color: "text-muted-foreground" },
]

type SidebarProps = {
  collapsed: boolean
  onToggle: () => void
  theme: "light" | "dark"
  onToggleTheme: () => void
}

export function Sidebar({ collapsed, onToggle, theme, onToggleTheme }: SidebarProps) {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut(auth)
    queryClient.clear()
    navigate("/login", { replace: true })
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-sidebar text-sidebar-foreground transition-all duration-200 backdrop-blur-xl border-r border-white/10 dark:border-white/[0.04]",
        collapsed ? "w-[68px]" : "w-[260px]",
      )}
    >
      <div className={cn("flex items-center h-14 px-4", collapsed ? "justify-center" : "gap-2")}>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight truncate">
            Wedding Planner
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn("shrink-0", !collapsed && "ml-auto")}
        >
          <Icon name={collapsed ? "left_panel_open" : "left_panel_close"} size="md" />
        </Button>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-2 py-2">
        {navItems.map(({ to, label, icon, color }) => {
          const link = (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200",
                  "hover:bg-surface-container hover:text-sidebar-accent-foreground",
                  isActive
                    ? "bg-surface-container text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70",
                  collapsed && "justify-center px-0",
                )
              }
            >
              <Icon name={icon} size="lg" className={color} />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          )

          if (collapsed) {
            return (
              <Tooltip key={to}>
                <TooltipTrigger render={<span />}>{link}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            )
          }
          return link
        })}
      </nav>

      <div className="px-2 py-3 space-y-1">
        {collapsed ? (
          <>
            <Tooltip>
              <TooltipTrigger render={<span />}>
                <Button variant="ghost" size="icon" onClick={onToggleTheme} className="w-full">
                  <Icon name={theme === "dark" ? "light_mode" : "dark_mode"} size="md" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<span />}>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="w-full">
                  <Icon name="logout" size="md" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign Out</TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={onToggleTheme} className="w-full justify-start gap-3">
              <Icon name={theme === "dark" ? "light_mode" : "dark_mode"} size="md" />
              <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
            </Button>
            <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start gap-3">
              <Icon name="logout" size="md" />
              <span>Sign Out</span>
            </Button>
          </>
        )}
      </div>
    </aside>
  )
}
