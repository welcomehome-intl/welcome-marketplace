"use client"

import { ReactNode, useState, useEffect } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/app/lib/web3/config'
import { Building2 } from 'lucide-react'

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [mounted, setMounted] = useState(false)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  }))

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show loading screen during SSR - don't render children until client-side mount
  // This prevents all wagmi hook SSR errors
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-blue-600 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Home Property
          </h1>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    )
  }

  // Only render full app after client-side mount (WagmiProvider available)
  return (
    <WagmiProvider config={config} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}