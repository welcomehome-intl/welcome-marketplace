// Utility functions for better error handling and logging

export function serializeError(error: any): string {
  if (!error) return 'No error object provided'

  try {
    // Handle Error instances
    if (error instanceof Error) {
      return JSON.stringify({
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
        data: (error as any).data,
        ...error // Spread any additional properties
      }, null, 2)
    }

    // Handle plain objects
    if (typeof error === 'object') {
      // Try to extract common error properties
      const errorInfo: any = {}

      // Common error properties
      const commonProps = ['code', 'message', 'data', 'reason', 'method', 'transaction', 'receipt']
      commonProps.forEach(prop => {
        if (error[prop] !== undefined) {
          errorInfo[prop] = error[prop]
        }
      })

      // Get all enumerable properties
      Object.keys(error).forEach(key => {
        errorInfo[key] = error[key]
      })

      // Get non-enumerable properties
      Object.getOwnPropertyNames(error).forEach(prop => {
        if (!(prop in errorInfo)) {
          try {
            errorInfo[prop] = error[prop]
          } catch (e) {
            errorInfo[prop] = '[Could not access property]'
          }
        }
      })

      return JSON.stringify(errorInfo, null, 2)
    }

    // Handle primitive types
    return String(error)
  } catch (stringifyError) {
    // Fallback if JSON.stringify fails
    return `Error serialization failed: ${String(error)} (${stringifyError})`
  }
}

export function logError(context: string, error: any, additionalInfo?: any) {
  console.error(`❌ ${context}:`)
  console.error('Error details:', serializeError(error))

  if (additionalInfo) {
    console.error('Additional info:', additionalInfo)
  }

  // Also log the raw error for debugging
  console.error('Raw error object:', error)
}