"use client"

import * as React from "react"
import { cn } from "@/app/lib/utils"

export interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'elevated' | 'bordered' | 'soft' | 'glow'
  size?: 'sm' | 'default' | 'lg' | 'xl'
  hover?: boolean
  interactive?: boolean
}

const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({
    className,
    variant = 'default',
    size = 'default',
    hover = false,
    interactive = false,
    children,
    ...props
  }, ref) => {
    const baseStyles = "rounded-2xl transition-all duration-300"

    const variants = {
      default: "bg-white border border-neutral-200 shadow-soft",
      glass: "bg-white/80 backdrop-blur-xl border border-white/20 shadow-large",
      gradient: "bg-gradient-to-br from-teal-50 via-white to-blue-50 border border-teal-100/50 shadow-soft",
      elevated: "bg-white shadow-large border border-neutral-100",
      bordered: "bg-white border-2 border-neutral-200 hover:border-teal-300 shadow-soft",
      soft: "bg-neutral-50/80 border border-neutral-200/50 shadow-sm backdrop-blur-sm",
      glow: "bg-white border border-teal-200/50 shadow-glow",
    }

    const sizes = {
      sm: "p-4",
      default: "p-6",
      lg: "p-8",
      xl: "p-10"
    }

    const hoverEffects = hover ? {
      default: "hover:shadow-medium hover:border-neutral-300 hover:-translate-y-0.5",
      glass: "hover:bg-white/90 hover:shadow-glow hover:-translate-y-0.5",
      gradient: "hover:shadow-medium hover:-translate-y-0.5",
      elevated: "hover:shadow-glow hover:-translate-y-1",
      bordered: "hover:border-teal-400 hover:shadow-medium hover:-translate-y-0.5",
      soft: "hover:bg-neutral-100/80 hover:shadow-medium hover:-translate-y-0.5",
      glow: "hover:shadow-glow-lg hover:-translate-y-0.5",
    } : {}

    const interactiveStyles = interactive ? "cursor-pointer active:scale-[0.99]" : ""

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          hover && hoverEffects[variant],
          interactiveStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ModernCard.displayName = "ModernCard"

const ModernCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { withBorder?: boolean }
>(({ className, withBorder = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 pb-4",
      withBorder && "border-b border-neutral-200 mb-4",
      className
    )}
    {...props}
  />
))
ModernCardHeader.displayName = "ModernCardHeader"

const ModernCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    size?: 'sm' | 'default' | 'lg' | 'xl'
    gradient?: boolean
  }
>(({ className, size = 'default', gradient = false, ...props }, ref) => {
  const sizes = {
    sm: "text-base",
    default: "text-lg",
    lg: "text-xl",
    xl: "text-2xl"
  }

  const gradientStyles = gradient ? "bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent" : ""

  return (
    <h3
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight text-neutral-900",
        sizes[size],
        gradientStyles,
        className
      )}
      {...props}
    />
  )
})
ModernCardTitle.displayName = "ModernCardTitle"

const ModernCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { muted?: boolean }
>(({ className, muted = false, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm leading-relaxed",
      muted ? "text-neutral-500" : "text-neutral-600",
      className
    )}
    {...props}
  />
))
ModernCardDescription.displayName = "ModernCardDescription"

const ModernCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-4", className)}
    {...props}
  />
))
ModernCardContent.displayName = "ModernCardContent"

const ModernCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { withBorder?: boolean }
>(({ className, withBorder = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center pt-4",
      withBorder && "border-t border-neutral-200 mt-4",
      className
    )}
    {...props}
  />
))
ModernCardFooter.displayName = "ModernCardFooter"

// Metric Card - specialized card for displaying metrics
const MetricCard = React.forwardRef<
  HTMLDivElement,
  ModernCardProps & {
    title: string
    value: string | number
    change?: {
      value: number
      period: string
      isPositive?: boolean
    }
    icon?: React.ReactNode
    trend?: 'up' | 'down' | 'neutral'
  }
>(({
  className,
  title,
  value,
  change,
  icon,
  trend,
  variant = 'default',
  ...props
}, ref) => {
  const trendColors = {
    up: 'text-success-600',
    down: 'text-error-600',
    neutral: 'text-neutral-500'
  }

  return (
    <ModernCard
      ref={ref}
      variant={variant}
      hover
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-teal-100/50 to-transparent" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-neutral-600">{title}</h3>
          {icon && (
            <div className="p-2 bg-teal-100 rounded-lg">
              <div className="text-teal-600">
                {icon}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-3xl font-bold text-neutral-900">{value}</p>

          {change && (
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-medium",
                change.isPositive ? 'text-success-600' : 'text-error-600'
              )}>
                {change.isPositive ? '+' : ''}{change.value.toFixed(1)}%
              </span>
              <span className="text-xs text-neutral-500">{change.period}</span>
            </div>
          )}
        </div>
      </div>
    </ModernCard>
  )
})
MetricCard.displayName = "MetricCard"

export {
  ModernCard,
  ModernCardHeader,
  ModernCardTitle,
  ModernCardDescription,
  ModernCardContent,
  ModernCardFooter,
  MetricCard
}