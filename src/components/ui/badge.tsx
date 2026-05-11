import { type ComponentProps } from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  default: "border-transparent bg-primary text-primary-foreground shadow",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  outline: "text-foreground",
}

export function Badge({ className, variant = "default", ...props }: ComponentProps<"span"> & { variant?: "default" | "secondary" | "outline" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
}
