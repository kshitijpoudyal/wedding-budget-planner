import { NavLink } from "react-router-dom"
import { Icon, type IconName } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

const navItems: { to: string; label: string; icon: IconName }[] = [
  { to: "/budget", label: "Budget", icon: "payments" },
  { to: "/people", label: "People", icon: "group" },
  { to: "/", label: "Home", icon: "home" },
  { to: "/summary", label: "Summary", icon: "auto_graph" },
  { to: "/settings", label: "Settings", icon: "settings" },
]

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 h-14 bg-background/70 backdrop-blur-xl flex items-center justify-around z-50">
      {navItems.map(({ to, label, icon }) => (
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
          <Icon name={icon} size="lg" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
