"use client"

import * as React from "react"
import { cn } from "@/app/lib/utils"

export interface ModernBadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'gradient'
    | 'outline'
    | 'soft'
    | 'glow'
  size?: 'xs' | 'sm' | 'default' | 'lg'
  dot?: boolean
  icon?: React.ReactNode
  removable?: boolean
  onRemove?: () => void
}

const ModernBadge = React.forwardRef<HTMLDivElement, ModernBadgeProps>(
  ({
    className,
    variant = 'default',
    size = 'default',
    dot = false,
    icon,
    removable = false,
    onRemove,
    children,
    ...props
  }, ref) => {
    const baseStyles = "inline-flex items-center gap-1.5 font-medium transition-all duration-200 whitespace-nowrap"

    const variants = {
      default: "bg-teal-100 text-teal-800 border border-teal-200",
      secondary: "bg-neutral-100 text-neutral-700 border border-neutral-200",
      success: "bg-success-100 text-success-800 border border-success-200",
      warning: "bg-warning-100 text-warning-800 border border-warning-200",
      error: "bg-error-100 text-error-800 border border-error-200",
      info: "bg-blue-100 text-blue-800 border border-blue-200",
      gradient: "bg-gradient-to-r from-teal-500 to-teal-600 text-white border border-teal-400/20 shadow-soft",
      outline: "bg-transparent text-teal-700 border-2 border-teal-300 hover:bg-teal-50",
      soft: "bg-teal-50/80 text-teal-700 border border-teal-200/50 backdrop-blur-sm",
      glow: "bg-teal-100 text-teal-800 border border-teal-200 shadow-glow",
    }

    const sizes = {
      xs: "h-5 px-2 text-2xs rounded-md",
      sm: "h-6 px-2.5 text-xs rounded-lg",
      default: "h-7 px-3 text-sm rounded-xl",
      lg: "h-8 px-4 text-sm rounded-xl",
    }

    const dotSizes = {
      xs: "h-1.5 w-1.5",
      sm: "h-2 w-2",
      default: "h-2 w-2",
      lg: "h-2.5 w-2.5",
    }

    const iconSizes = {
      xs: "h-3 w-3",
      sm: "h-3.5 w-3.5",
      default: "h-4 w-4",
      lg: "h-4 w-4",
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          removable && "pr-1.5",
          className
        )}
        {...props}
      >
        {/* Status Dot */}
        {dot && (
          <div className={cn(
            "rounded-full",
            dotSizes[size],
            variant === 'success' && "bg-success-500",
            variant === 'warning' && "bg-warning-500",
            variant === 'error' && "bg-error-500",
            variant === 'info' && "bg-blue-500",
            variant === 'default' && "bg-teal-500",
            variant === 'secondary' && "bg-neutral-500"
          )} />
        )}

        {/* Icon */}
        {icon && (
          <span className={iconSizes[size]}>
            {icon}
          </span>
        )}

        {/* Content */}
        <span className="truncate">{children}</span>

        {/* Remove Button */}
        {removable && onRemove && (
          <button
            onClick={onRemove}
            className={cn(
              "flex-shrink-0 rounded-full hover:bg-black/10 transition-colors",
              size === 'xs' && "h-3 w-3",
              size === 'sm' && "h-3.5 w-3.5",
              size === 'default' && "h-4 w-4",
              size === 'lg' && "h-5 w-5"
            )}
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="h-full w-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    )
  }
)

ModernBadge.displayName = "ModernBadge"

// Status Badge - specialized badge for status display
const StatusBadge = React.forwardRef<
  HTMLDivElement,
  Omit<ModernBadgeProps, 'variant' | 'dot'> & {
    status: 'active' | 'inactive' | 'pending' | 'approved' | 'denied' | 'expired'
  }
>(({ status, ...props }, ref) => {
  const statusConfig = {
    active: { variant: 'success' as const, dot: true, children: 'Active' },
    inactive: { variant: 'secondary' as const, dot: true, children: 'Inactive' },
    pending: { variant: 'warning' as const, dot: true, children: 'Pending' },
    approved: { variant: 'success' as const, dot: true, children: 'Approved' },
    denied: { variant: 'error' as const, dot: true, children: 'Denied' },
    expired: { variant: 'warning' as const, dot: true, children: 'Expired' },
  }

  const config = statusConfig[status]

  return (
    <ModernBadge
      ref={ref}
      variant={config.variant}
      dot={config.dot}
      {...props}
    >
      {config.children}
    </ModernBadge>
  )
})

StatusBadge.displayName = "StatusBadge"

// Notification Badge - badge with count
const NotificationBadge = React.forwardRef<
  HTMLDivElement,
  Omit<ModernBadgeProps, 'children'> & {
    count: number
    max?: number
    showZero?: boolean
  }
>(({ count, max = 99, showZero = false, variant = 'error', ...props }, ref) => {
  if (count === 0 && !showZero) return null

  const displayCount = count > max ? `${max}+` : count.toString()

  return (
    <ModernBadge
      ref={ref}
      variant={variant}
      size="xs"
      className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 justify-center"
      {...props}
    >
      {displayCount}
    </ModernBadge>
  )
})

NotificationBadge.displayName = "NotificationBadge"

// Property Type Badge - specialized for property types
const PropertyTypeBadge = React.forwardRef<
  HTMLDivElement,
  Omit<ModernBadgeProps, 'variant' | 'children'> & {
    propertyType: 'residential' | 'commercial' | 'industrial' | 'mixed-use' | 'land'
  }
>(({ propertyType, ...props }, ref) => {
  const typeConfig = {
    residential: {
      variant: 'info' as const,
      children: 'Residential',
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      )
    },
    commercial: {
      variant: 'default' as const,
      children: 'Commercial',
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
        </svg>
      )
    },
    industrial: {
      variant: 'warning' as const,
      children: 'Industrial',
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 22H2V10l7-7 3 3 3-3 7 7v12zm-2-2V11.5L17 8.5l-3 3-3-3L8 11.5V20h12z"/>
        </svg>
      )
    },
    'mixed-use': {
      variant: 'success' as const,
      children: 'Mixed Use',
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v2H7zm0 4h2v2H7zm4-4h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z"/>
        </svg>
      )
    },
    land: {
      variant: 'soft' as const,
      children: 'Land',
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22l-9-12z"/>
        </svg>
      )
    },
  }

  const config = typeConfig[propertyType]

  return (
    <ModernBadge
      ref={ref}
      variant={config.variant}
      icon={config.icon}
      {...props}
    >
      {config.children}
    </ModernBadge>
  )
})

PropertyTypeBadge.displayName = "PropertyTypeBadge"

export {
  ModernBadge,
  StatusBadge,
  NotificationBadge,
  PropertyTypeBadge
}