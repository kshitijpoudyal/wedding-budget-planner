import { Icon, type IconName } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

type StatCardProps = {
  label: string
  value: string
  icon?: IconName
  className?: string
  variant?: "default" | "danger"
  iconClassName?: string
  accentColor?: string
}

export function StatCard({ label, value, icon, className, variant = "default", iconClassName, accentColor }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-card glass-card overflow-hidden",
        className,
      )}
    >
      {accentColor && (
        <div className={cn("h-1", accentColor)} />
      )}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
          {icon && (
            <Icon
              name={icon}
              size="md"
              className={cn(
                variant === "danger" ? "text-destructive" : iconClassName ?? "text-muted-foreground",
              )}
            />
          )}
        </div>
        <p
          className={cn(
            "mt-1 text-2xl font-bold tracking-tight",
            variant === "danger" ? "text-destructive" : "text-card-foreground",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
}
