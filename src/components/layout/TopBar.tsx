import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"

type TopBarProps = {
  onMenuOpen: () => void
}

export function TopBar({ onMenuOpen }: TopBarProps) {
  return (
    <header className="md:hidden flex items-center h-14 px-4 bg-background/70 backdrop-blur-xl sticky top-0 z-40">
      <Button variant="ghost" size="icon" onClick={onMenuOpen}>
        <Icon name="menu" size="lg" />
      </Button>
      <span className="ml-3 text-lg font-bold tracking-tight">
        Wedding Planner
      </span>
    </header>
  )
}
