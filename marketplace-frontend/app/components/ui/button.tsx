import * as React from "react"
import { cn } from "@/app/lib/utils"
import { Loader2 } from "lucide-react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient' | 'glow' | 'soft'
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon' | 'icon-sm'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'default',
    size = 'default',
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"

    const variants = {
      default: "bg-teal-600 text-white hover:bg-teal-700 shadow-soft hover:shadow-medium",
      destructive: "bg-error-600 text-white hover:bg-error-700 shadow-soft hover:shadow-medium",
      outline: "border-2 border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 text-neutral-700 hover:text-neutral-900",
      secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 shadow-soft",
      ghost: "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
      link: "text-teal-600 underline-offset-4 hover:underline p-0 h-auto",
      gradient: "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-glow hover:shadow-glow-lg",
      glow: "bg-teal-600 text-white hover:bg-teal-700 shadow-glow hover:shadow-glow-lg border border-teal-500/20",
      soft: "bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200/50 hover:border-teal-300/50",
    }

    const sizes = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-8 px-3 py-1 text-sm rounded-lg",
      lg: "h-12 px-6 py-3 text-base rounded-xl",
      xl: "h-14 px-8 py-4 text-lg rounded-2xl",
      icon: "h-10 w-10 p-0 rounded-xl",
      "icon-sm": "h-8 w-8 p-0 rounded-lg",
    }

    const isDisabled = disabled || loading

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}

        {!loading && leftIcon && (
          <span className="mr-2 flex-shrink-0">
            {leftIcon}
          </span>
        )}

        <span className="truncate">
          {children}
        </span>

        {!loading && rightIcon && (
          <span className="ml-2 flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }