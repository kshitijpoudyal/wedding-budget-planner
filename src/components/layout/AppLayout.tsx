import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { BottomNav } from "./BottomNav"
import { MobileSidebar } from "./MobileSidebar"
import { useTheme } from "@/hooks/useTheme"
import { useSidebar } from "@/hooks/useSidebar"

export function AppLayout() {
  const { theme, toggleTheme } = useTheme()
  const { collapsed, toggle: toggleSidebar } = useSidebar()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleSidebar}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <MobileSidebar
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <TopBar onMenuOpen={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto pb-14 md:pb-0">
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
