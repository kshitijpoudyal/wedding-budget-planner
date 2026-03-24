import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

export type IconName = string

type IconProps = ComponentProps<"span"> & {
  name: IconName
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  filled?: boolean
}

const sizeMap = {
  xs: "text-[12px]",
  sm: "text-[14px]",
  md: "text-[16px]",
  lg: "text-[20px]",
  xl: "text-[24px]",
} as const

export function Icon({ name, size = "md", filled = false, className, ...props }: IconProps) {
  return (
    <span
      className={cn(
        "material-symbols-outlined select-none shrink-0 leading-none inline-flex items-center justify-center",
        filled ? "material-symbols-filled" : "",
        sizeMap[size],
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  )
}
