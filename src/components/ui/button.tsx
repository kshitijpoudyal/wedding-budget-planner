import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap tracking-wide transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:shadow-[0_0_0_3px_rgba(18,117,226,0.08)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default: "rounded-xl bg-primary text-primary-foreground tracking-[0.1em] shadow-[0_2px_8px_rgba(18,117,226,0.25)] hover:shadow-[0_4px_16px_rgba(18,117,226,0.35)] hover:brightness-110 dark:shadow-[0_2px_8px_rgba(164,201,255,0.15)] dark:hover:shadow-[0_4px_16px_rgba(164,201,255,0.25)]",
        outline:
          "rounded-xl border-border/50 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:text-foreground aria-expanded:bg-white/80 aria-expanded:text-foreground dark:border-white/[0.06] dark:bg-white/[0.06] dark:hover:bg-white/[0.1]",
        secondary:
          "rounded-xl bg-[#FDDBA7]/80 text-[#785F35] backdrop-blur-sm hover:bg-[#FDDBA7] aria-expanded:bg-[#FDDBA7] dark:bg-secondary/80 dark:text-secondary-foreground dark:hover:bg-secondary",
        ghost:
          "rounded-xl hover:bg-white/60 hover:text-foreground aria-expanded:bg-white/60 aria-expanded:text-foreground dark:hover:bg-white/[0.06]",
        destructive:
          "rounded-xl bg-destructive/10 text-destructive backdrop-blur-sm hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),12px)] px-3 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-9",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
