import { type ComponentProps } from "react"
import { cn } from "@/lib/utils"

const buttonVariants = {
  default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
  outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
}

export function Button({
  className,
  variant = "default",
  size = "default",
  disabled,
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof buttonVariants; size?: "sm" | "default" | "lg" }) {
  const sizes = { sm: "h-8 px-3 text-xs", default: "h-9 px-4 py-2", lg: "h-10 px-4 py-3" }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        buttonVariants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    />
  )
}
