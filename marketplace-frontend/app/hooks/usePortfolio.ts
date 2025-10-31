"use client"

import { useState, useEffect, useCallback } from 'react'
import { UserPortfolio, PropertyToken, Transaction } from '../types/web3'
import { useWallet } from './useWallet'

// Mock portfolio data
const mockPortfolio: UserPortfolio = {
  totalBalance: 24000,
  totalInvested: 22000,
  totalReturns: 2000,
  returnsPercentage: 9.09,
  totalSquareMeters: 243,
  properties: [
    {
      propertyId: '1',
      amount: 1000,
      currentValue: 5800,
      purchasePrice: 5400,
      purchaseDate: new Date('2024-01-20'),
      returns: 400,
      returnsPercentage: 7.41,
    },
    {
      propertyId: '2',
      amount: 800,
      currentValue: 4080,
      purchasePrice: 3840,
      purchaseDate: new Date('2024-02-10'),
      returns: 240,
      returnsPercentage: 6.25,
    },
  ],
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    hash: '0xabc123...',
    propertyId: '1',
    propertyName: 'Plot 15',
    type: 'buy',
    amount: 5400,
    tokenAmount: 1000,
    pricePerToken: 5.4,
    from: '0x0000000000000000000000000000000000000000',
    to: '0x742d35Cc6531C0532925a3b8D6431644E123456',
    status: 'confirmed',
    timestamp: new Date('2024-01-20T11:32:00'),
    blockNumber: 18123456,
  },
  {
    id: '2',
    hash: '0xdef456...',
    propertyId: '2',
    propertyName: 'Plot 16',
    type: 'buy',
    amount: 3840,
    tokenAmount: 800,
    pricePerToken: 4.8,
    from: '0x0000000000000000000000000000000000000000',
    to: '0x742d35Cc6531C0532925a3b8D6431644E123456',
    status: 'confirmed',
    timestamp: new Date('2024-02-10T09:42:00'),
    blockNumber: 18135678,
  },
]

export function usePortfolio() {
  const { address, isConnected } = useWallet()
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPortfolio = useCallback(async () => {
    if (!isConnected || !address) {
      setPortfolio(null)
      setTransactions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Mock API calls - replace with smart contract interactions
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In real implementation, these would be smart contract calls:
      // 1. Get user's token balances for each property
      // 2. Calculate current values based on latest property prices
      // 3. Fetch transaction history from blockchain events

      setPortfolio(mockPortfolio)
      setTransactions(mockTransactions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio')
    } finally {
      setLoading(false)
    }
  }, [address, isConnected])

  const getPropertyTokens = useCallback(async (propertyId: string): Promise<PropertyToken | null> => {
    if (!portfolio) return null
    return portfolio.properties.find(p => p.propertyId === propertyId) || null
  }, [portfolio])

  const getUserTransactions = useCallback(async (
    filter?: {
      propertyId?: string
      type?: 'buy' | 'sell' | 'transfer'
      status?: 'pending' | 'confirmed' | 'failed'
    }
  ): Promise<Transaction[]> => {
    let filtered = transactions

    if (filter?.propertyId) {
      filtered = filtered.filter(tx => tx.propertyId === filter.propertyId)
    }
    if (filter?.type) {
      filtered = filtered.filter(tx => tx.type === filter.type)
    }
    if (filter?.status) {
      filtered = filtered.filter(tx => tx.status === filter.status)
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [transactions])

  const refreshPortfolio = useCallback(() => {
    fetchPortfolio()
  }, [fetchPortfolio])

  // Fetch portfolio when wallet connects or address changes
  useEffect(() => {
    fetchPortfolio()
  }, [fetchPortfolio])

  // Subscribe to real-time updates (in real implementation)
  useEffect(() => {
    if (!isConnected || !address) return

    // In real implementation, set up event listeners for:
    // - New transactions
    // - Property price updates
    // - Token transfers

    const interval = setInterval(() => {
      // Periodically refresh portfolio data
      fetchPortfolio()
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [isConnected, address, fetchPortfolio])

  return {
    portfolio,
    transactions,
    loading,
    error,
    getPropertyTokens,
    getUserTransactions,
    refreshPortfolio,
  }
}