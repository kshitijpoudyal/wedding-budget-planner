import { Icon, type IconName } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

type StatCardProps = {
  label: string
  value: string
  icon?: IconName
  className?: string
  variant?: "default" | "danger"
}

export function StatCard({ label, value, icon, className, variant = "default" }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-card glass-card p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
        {icon && (
          <Icon
            name={icon}
            size="md"
            className={cn(
              variant === "danger" ? "text-destructive" : "text-muted-foreground",
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
  )
}
