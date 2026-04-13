import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { BottomNav } from "./BottomNav"
import { MobileSidebar } from "./MobileSidebar"
import { CalculatorModal } from "@/components/calculator/CalculatorModal"
import { Icon } from "@/components/ui/icon"
import { useTheme } from "@/hooks/useTheme"
import { useSidebar } from "@/hooks/useSidebar"

export function AppLayout() {
  const { theme, toggleTheme } = useTheme()
  const { collapsed, toggle: toggleSidebar } = useSidebar()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [calcOpen, setCalcOpen] = useState(false)

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

      {/* Calculator FAB */}
      <button
        onClick={() => setCalcOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 h-14 w-14 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg z-40 flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
        aria-label="Open calculator"
      >
        <Icon name="calculate" size="xl" />
      </button>

      <CalculatorModal open={calcOpen} onOpenChange={setCalcOpen} />
    </div>
  )
}
