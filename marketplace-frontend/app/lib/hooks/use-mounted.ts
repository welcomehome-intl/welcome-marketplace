import { useState, useEffect } from 'react'

/**
 * Hook to check if component is mounted (client-side)
 * Useful for preventing SSR issues with browser-only features
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
