"use client"

import * as React from "react"
import { cn } from "@/app/lib/utils"
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"

export interface ModernInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'ghost' | 'soft' | 'bordered'
  inputSize?: 'sm' | 'default' | 'lg'
  label?: string
  helperText?: string
  error?: string
  success?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
}

const ModernInput = React.forwardRef<HTMLInputElement, ModernInputProps>(
  ({
    className,
    type = 'text',
    variant = 'default',
    inputSize = 'default',
    label,
    helperText,
    error,
    success,
    leftIcon,
    rightIcon,
    showPasswordToggle = false,
    disabled,
    id,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const inputId = id || React.useId()

    const actualType = showPasswordToggle && type === 'password'
      ? (showPassword ? 'text' : 'password')
      : type

    const hasError = !!error
    const hasSuccess = !!success
    const hasLeftIcon = !!leftIcon
    const hasRightIcon = !!rightIcon || showPasswordToggle

    const baseInputStyles = "w-full font-medium transition-all duration-200 placeholder:text-neutral-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"

    const variants = {
      default: cn(
        "bg-white border-2 border-neutral-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10",
        hasError && "border-error-500 focus:border-error-500 focus:ring-error-500/10",
        hasSuccess && "border-success-500 focus:border-success-500 focus:ring-success-500/10"
      ),
      ghost: cn(
        "bg-transparent border-b-2 border-neutral-200 rounded-none focus:border-teal-500 px-0",
        hasError && "border-error-500 focus:border-error-500",
        hasSuccess && "border-success-500 focus:border-success-500"
      ),
      soft: cn(
        "bg-neutral-50 border-2 border-neutral-200/50 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10",
        hasError && "border-error-500/50 focus:border-error-500 focus:ring-error-500/10",
        hasSuccess && "border-success-500/50 focus:border-success-500 focus:ring-success-500/10"
      ),
      bordered: cn(
        "bg-white border-2 border-neutral-300 focus:border-teal-500 shadow-soft focus:shadow-medium",
        hasError && "border-error-500 focus:border-error-500",
        hasSuccess && "border-success-500 focus:border-success-500"
      ),
    }

    const sizes = {
      sm: "h-9 text-sm rounded-lg",
      default: "h-11 text-sm rounded-xl",
      lg: "h-12 text-base rounded-xl",
    }

    const paddingStyles = cn(
      hasLeftIcon ? "pl-10" : "pl-4",
      hasRightIcon ? "pr-10" : "pr-4",
      variant === 'ghost' && "px-0"
    )

    const iconSizes = {
      sm: "h-4 w-4",
      default: "h-4 w-4",
      lg: "h-5 w-5"
    }

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              <div className={iconSizes[inputSize]}>
                {leftIcon}
              </div>
            </div>
          )}

          {/* Input */}
          <input
            id={inputId}
            ref={ref}
            type={actualType}
            className={cn(
              baseInputStyles,
              variants[variant],
              sizes[inputSize],
              paddingStyles,
              className
            )}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Right Icon/Password Toggle */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Status Icons */}
            {hasError && !rightIcon && !showPasswordToggle && (
              <AlertCircle className={cn(iconSizes[inputSize], "text-error-500")} />
            )}
            {hasSuccess && !rightIcon && !showPasswordToggle && (
              <CheckCircle className={cn(iconSizes[inputSize], "text-success-500")} />
            )}

            {/* Custom Right Icon */}
            {rightIcon && !showPasswordToggle && (
              <div className={cn(iconSizes[inputSize], "text-neutral-400")}>
                {rightIcon}
              </div>
            )}

            {/* Password Toggle */}
            {showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  iconSizes[inputSize],
                  "text-neutral-400 hover:text-neutral-600 transition-colors"
                )}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            )}
          </div>
        </div>

        {/* Helper Text/Error/Success */}
        {(helperText || error || success) && (
          <div className="flex items-start gap-2">
            {error && <AlertCircle className="h-4 w-4 text-error-500 mt-0.5 flex-shrink-0" />}
            {success && <CheckCircle className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />}
            <p className={cn(
              "text-sm",
              error && "text-error-600",
              success && "text-success-600",
              !error && !success && "text-neutral-500"
            )}>
              {error || success || helperText}
            </p>
          </div>
        )}
      </div>
    )
  }
)

ModernInput.displayName = "ModernInput"

// Floating Label Input
const FloatingLabelInput = React.forwardRef<HTMLInputElement, ModernInputProps>(
  ({
    className,
    label,
    placeholder,
    value,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const hasValue = value && value.toString().length > 0

    return (
      <div className="relative">
        <ModernInput
          ref={ref}
          value={value}
          className={cn("peer placeholder:opacity-0", className)}
          placeholder={placeholder || label}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />

        {label && (
          <label className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500 transition-all duration-200 pointer-events-none",
            "peer-focus:-translate-y-6 peer-focus:scale-90 peer-focus:text-teal-600",
            (isFocused || hasValue) && "-translate-y-6 scale-90 text-teal-600"
          )}>
            {label}
          </label>
        )}
      </div>
    )
  }
)

FloatingLabelInput.displayName = "FloatingLabelInput"

// Search Input
interface SearchInputProps extends ModernInputProps {
  onClear?: () => void
  showClearButton?: boolean
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({
    onClear,
    showClearButton = true,
    value,
    leftIcon,
    ...props
  }, ref) => {
    const handleClear = () => {
      onClear?.()
    }

    return (
      <ModernInput
        ref={ref}
        type="search"
        value={value}
        leftIcon={leftIcon || (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
        rightIcon={showClearButton && value && (
          <button
            type="button"
            onClick={handleClear}
            className="h-4 w-4 text-neutral-400 hover:text-neutral-600"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {...props}
      />
    )
  }
)

SearchInput.displayName = "SearchInput"

export { ModernInput, FloatingLabelInput, SearchInput }