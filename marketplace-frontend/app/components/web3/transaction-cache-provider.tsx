"use client"

import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRealTimeTransactionCaching, useTransactionCache } from '@/app/lib/supabase/hooks/use-transaction-cache'

interface TransactionCacheProviderProps {
  children: React.ReactNode
  enableAutoIndexing?: boolean
}

export function TransactionCacheProvider({
  children,
  enableAutoIndexing = true
}: TransactionCacheProviderProps) {
  const { isConnected } = useAccount()
  const { indexHistoricalTransactions, isIndexing } = useTransactionCache()

  // Enable real-time caching when connected
  useRealTimeTransactionCaching()

  // Auto-index historical transactions on first load
  useEffect(() => {
    if (isConnected && enableAutoIndexing && !isIndexing) {
      // Only run once per session
      const hasIndexed = sessionStorage.getItem('transaction-cache-indexed')
      if (!hasIndexed) {
        console.log('Starting historical transaction indexing...')
        indexHistoricalTransactions()
        sessionStorage.setItem('transaction-cache-indexed', 'true')
      }
    }
  }, [isConnected, enableAutoIndexing, indexHistoricalTransactions, isIndexing])

  return (
    <>
      {children}
      {/* Optionally show indexing status */}
      {isIndexing && (
        <div className="fixed bottom-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span className="text-sm">Indexing transactions...</span>
          </div>
        </div>
      )}
    </>
  )
}