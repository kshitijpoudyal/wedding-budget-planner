import { Icon, type IconName } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

type StatCardProps = {
  label: string
  value: string
  icon?: IconName
  className?: string
  variant?: "default" | "danger"
  iconClassName?: string
  iconBg?: string
  accentColor?: string // kept for API compatibility
}

export function StatCard({ label, value, icon, className, variant = "default", iconClassName, iconBg }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card glass-card overflow-hidden p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground leading-none">
            {label}
          </p>
          <p
            className={cn(
              "mt-3 text-2xl font-extrabold tracking-tight leading-none",
              variant === "danger" ? "text-destructive" : "text-card-foreground",
            )}
          >
            {value}
          </p>
        </div>
        {icon && (
          <div className={cn(
            "shrink-0 rounded-lg p-2",
            iconBg ?? "bg-muted",
          )}>
            <Icon
              name={icon}
              size="md"
              className={cn(
                variant === "danger" ? "text-destructive" : iconClassName ?? "text-muted-foreground",
              )}
            />
          </div>
        )}
      </div>
    </div>
  )
}
