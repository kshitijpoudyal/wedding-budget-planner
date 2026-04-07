import { NavLink } from "react-router-dom"
import { Icon, type IconName } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

const navItems: { to: string; label: string; icon: IconName; color: string }[] = [
  { to: "/budget", label: "Budget", icon: "payments", color: "text-blue-600 dark:text-blue-400" },
  { to: "/summary", label: "Summary", icon: "auto_graph", color: "text-emerald-600 dark:text-emerald-400" },
  { to: "/calculator", label: "Calc", icon: "calculate", color: "text-violet-600 dark:text-violet-400" },
  { to: "/settings", label: "Settings", icon: "settings", color: "text-muted-foreground" },
]

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 h-14 bg-background/70 backdrop-blur-xl flex items-center justify-around z-50">
      {navItems.map(({ to, label, icon, color }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors duration-200",
              isActive ? "text-primary" : "text-muted-foreground",
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon name={icon} size="lg" className={isActive ? undefined : color} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
