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
        "rounded-xl bg-card p-4 shadow-[0_20px_40px_rgba(128,82,83,0.06)] dark:shadow-none dark:bg-surface-container-low dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
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
