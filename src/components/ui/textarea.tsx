import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full min-w-0 rounded-sm rounded-t-lg border-0 border-b-2 border-border bg-surface-container-low px-2.5 py-2 text-base transition-all outline-none resize-none placeholder:text-muted-foreground focus-visible:bg-surface-container-high focus-visible:border-primary focus-visible:ring-0 focus-visible:shadow-[0_2px_8px_rgba(128,82,83,0.1)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-surface-container-low dark:focus-visible:bg-surface-container dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
