import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    // Define base classes based on variant
    const baseClasses = {
      default: "bg-purple-600 text-white hover:bg-purple-700",
      destructive: "bg-red-500 text-white hover:bg-red-600",
      outline: "border border-white/30 hover:bg-white/10 text-white",
      secondary: "bg-white/20 text-white hover:bg-white/30",
      ghost: "hover:bg-white/10 text-white",
      link: "underline-offset-4 hover:underline text-white",
    }

    // Define size classes
    const sizeClasses = {
      default: "h-10 py-2 px-4 text-sm",
      sm: "h-9 px-3 text-sm",
      lg: "h-12 px-6 text-lg",
    }

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-white/50",
          "disabled:opacity-50 disabled:pointer-events-none",
          baseClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }