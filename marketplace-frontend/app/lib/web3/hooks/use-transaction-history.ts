"use client"

import { useEffect, useState } from 'react'
import { useWatchContractEvent, usePublicClient, useAccount } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../config'
import { PROPERTY_TOKEN_ABI, PROPERTY_FACTORY_ABI } from '../abi'
import { Address, formatUnits } from 'viem'
import { useTransactionCache, CachedTransaction } from '@/app/lib/supabase/hooks/use-transaction-cache'

export interface Transaction {
  id: string
  hash: string
  blockNumber: bigint
  timestamp: number
  type: 'Purchase' | 'Sale' | 'Mint' | 'Burn' | 'Stake' | 'Unstake' | 'Revenue' | 'Transfer'
  from: Address
  to: Address
  amount: bigint
  tokenAmount?: bigint
  pricePerToken?: bigint
  status: 'Completed' | 'Pending' | 'Failed'
  gasUsed?: bigint
  gasFee?: bigint
}

export function useTransactionHistory(userAddress?: Address, limit: number = 50) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useCache, setUseCache] = useState(true)
  const publicClient = usePublicClient()
  const { getCachedTransactions } = useTransactionCache()

  // Convert cached transactions to Transaction interface
  const convertCachedTransaction = (cached: CachedTransaction): Transaction => ({
    id: cached.tx_hash,
    hash: cached.tx_hash,
    blockNumber: BigInt(cached.block_number || 0),
    timestamp: cached.formatted.timestamp.getTime(),
    type: cached.transaction_type as Transaction['type'],
    from: '0x0000000000000000000000000000000000000000' as Address, // Would need to fetch from tx details
    to: (cached.contract_address || '0x0000000000000000000000000000000000000000') as Address,
    amount: BigInt(Math.floor(cached.formatted.amount * 1e18)),
    tokenAmount: cached.formatted.tokenAmount ? BigInt(Math.floor(cached.formatted.tokenAmount * 1e18)) : undefined,
    status: cached.status as Transaction['status'],
  })

  // Fetch transactions from cache
  const fetchCachedTransactions = async () => {
    try {
      const cached = await getCachedTransactions(userAddress, limit)
      const converted = cached.map(convertCachedTransaction)

      // Filter for user transactions
      const userTxs = userAddress
        ? converted.filter(tx => tx.hash && (
            // This is a simplified filter - in reality, you'd check from/to addresses
            cached.some(c => c.user_address === userAddress.toLowerCase() && c.tx_hash === tx.hash)
          ))
        : converted

      setTransactions(userTxs)
      setAllTransactions(converted)
      setIsLoading(false)
    } catch (err) {
      console.error('Error fetching cached transactions:', err)
      setError('Failed to fetch transactions')
      setIsLoading(false)
    }
  }

  // Initialize with cached data if available
  useEffect(() => {
    if (useCache) {
      fetchCachedTransactions()
    }
  }, [userAddress, limit, useCache])

  // Listen to Transfer events from Property Token
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
    abi: PROPERTY_TOKEN_ABI,
    eventName: 'Transfer',
    enabled: false, // Disabled - Hedera doesn't support event watching (exceeds 1000 block limit)
    onLogs: (logs) => {
      const newTransactions = logs.map((log) => ({
        id: `${log.transactionHash}-${log.logIndex}`,
        hash: log.transactionHash,
        blockNumber: log.blockNumber,
        timestamp: Date.now(), // Will be updated with block timestamp
        type: 'Transfer' as const,
        from: log.args.from!,
        to: log.args.to!,
        amount: log.args.value!,
        status: 'Completed' as const,
      }))

      setTransactions(prev => {
        const combined = [...newTransactions, ...prev]
        const unique = combined.filter((tx, index, self) =>
          index === self.findIndex(t => t.id === tx.id)
        )
        return unique.slice(0, limit)
      })
    }
  })

  // Listen to TokensPurchased events from PropertyFactory
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.PROPERTY_FACTORY as Address,
    abi: PROPERTY_FACTORY_ABI,
    eventName: 'TokensPurchased',
    enabled: false, // Disabled - Hedera doesn't support event watching (exceeds 1000 block limit)
    onLogs: (logs) => {
      const newTransactions = logs.map((log) => ({
        id: `${log.transactionHash}-${log.logIndex}`,
        hash: log.transactionHash,
        blockNumber: log.blockNumber,
        timestamp: Date.now(),
        type: 'Purchase' as const,
        from: '0x0000000000000000000000000000000000000000' as Address,
        to: log.args.buyer!,
        amount: log.args.totalCost!,
        tokenAmount: log.args.amount!,
        status: 'Completed' as const,
      }))

      setTransactions(prev => {
        const combined = [...newTransactions, ...prev]
        const unique = combined.filter((tx, index, self) =>
          index === self.findIndex(t => t.id === tx.id)
        )
        return unique.slice(0, limit)
      })
    }
  })

  // Listen to TokensStaked events
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.PROPERTY_FACTORY as Address,
    abi: PROPERTY_FACTORY_ABI,
    eventName: 'TokensStaked',
    enabled: false, // Disabled - Hedera doesn't support event watching (exceeds 1000 block limit)
    onLogs: (logs) => {
      const newTransactions = logs.map((log) => ({
        id: `${log.transactionHash}-${log.logIndex}`,
        hash: log.transactionHash,
        blockNumber: log.blockNumber,
        timestamp: Date.now(),
        type: 'Stake' as const,
        from: log.args.staker!,
        to: CONTRACT_ADDRESSES.PROPERTY_FACTORY as Address,
        amount: log.args.amount!,
        tokenAmount: log.args.amount!,
        status: 'Completed' as const,
      }))

      setTransactions(prev => {
        const combined = [...newTransactions, ...prev]
        const unique = combined.filter((tx, index, self) =>
          index === self.findIndex(t => t.id === tx.id)
        )
        return unique.slice(0, limit)
      })
    }
  })

  // Listen to RevenueDistributed events
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.PROPERTY_FACTORY as Address,
    abi: PROPERTY_FACTORY_ABI,
    eventName: 'RevenueDistributed',
    enabled: false, // Disabled - Hedera doesn't support event watching (exceeds 1000 block limit)
    onLogs: (logs) => {
      const newTransactions = logs.map((log) => ({
        id: `${log.transactionHash}-${log.logIndex}`,
        hash: log.transactionHash,
        blockNumber: log.blockNumber,
        timestamp: Date.now(),
        type: 'Revenue' as const,
        from: '0x0000000000000000000000000000000000000000' as Address,
        to: '0x0000000000000000000000000000000000000000' as Address,
        amount: log.args.totalRevenue!,
        status: 'Completed' as const,
      }))

      setTransactions(prev => {
        const combined = [...newTransactions, ...prev]
        const unique = combined.filter((tx, index, self) =>
          index === self.findIndex(t => t.id === tx.id)
        )
        return unique.slice(0, limit)
      })
    }
  })

  // Fetch historical events on mount (skip if using cache)
  useEffect(() => {
    if (!publicClient || useCache) return

    const fetchHistoricalEvents = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const currentBlock = await publicClient.getBlockNumber()
        const fromBlock = currentBlock - BigInt(100) // Look back 100 blocks (reduced for RPC limits)

        // Fetch Transfer events with error handling
        let transferLogs: any[] = []
        try {
          transferLogs = await publicClient.getLogs({
            address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
            events: [
              {
                type: 'event',
                name: 'Transfer',
                inputs: [
                  { name: 'from', type: 'address', indexed: true },
                  { name: 'to', type: 'address', indexed: true },
                  { name: 'value', type: 'uint256', indexed: false }
                ]
              }
            ],
            fromBlock,
            toBlock: currentBlock,
          })
        } catch (transferError) {
          console.warn('Failed to fetch Transfer events:', transferError)
        }

        // Fetch Purchase events with error handling
        let purchaseLogs: any[] = []
        try {
          purchaseLogs = await publicClient.getLogs({
            address: CONTRACT_ADDRESSES.PROPERTY_FACTORY as Address,
            events: [
              {
                type: 'event',
                name: 'TokensPurchased',
                inputs: [
                  { name: 'buyer', type: 'address', indexed: true },
                  { name: 'amount', type: 'uint256', indexed: false },
                  { name: 'totalCost', type: 'uint256', indexed: false }
                ]
              }
            ],
            fromBlock,
            toBlock: currentBlock,
          })
        } catch (purchaseError) {
          console.warn('Failed to fetch Purchase events:', purchaseError)
        }

        // Process and combine all events
        const allTransactions: Transaction[] = []

        // Process transfers
        for (const log of transferLogs) {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber })
          allTransactions.push({
            id: `${log.transactionHash}-${log.logIndex}`,
            hash: log.transactionHash,
            blockNumber: log.blockNumber,
            timestamp: Number(block.timestamp) * 1000,
            type: 'Transfer',
            from: (log as any).args.from,
            to: (log as any).args.to,
            amount: (log as any).args.value,
            status: 'Completed',
          })
        }

        // Process purchases
        for (const log of purchaseLogs) {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber })
          allTransactions.push({
            id: `${log.transactionHash}-${log.logIndex}`,
            hash: log.transactionHash,
            blockNumber: log.blockNumber,
            timestamp: Number(block.timestamp) * 1000,
            type: 'Purchase',
            from: '0x0000000000000000000000000000000000000000' as Address,
            to: (log as any).args.buyer,
            amount: (log as any).args.totalCost,
            tokenAmount: (log as any).args.amount,
            status: 'Completed',
          })
        }

        // Sort by block number and timestamp, then take latest
        allTransactions.sort((a, b) => {
          if (a.blockNumber !== b.blockNumber) {
            return Number(b.blockNumber - a.blockNumber)
          }
          return b.timestamp - a.timestamp
        })

        setTransactions(allTransactions.slice(0, limit))
      } catch (err) {
        console.error('Failed to fetch transaction history:', err)
        setError('Failed to load transaction history')
      } finally {
        setIsLoading(false)
      }
    }

    if (!useCache) {
      fetchHistoricalEvents()
    }
  }, [publicClient, limit, useCache])

  // Filter transactions for user if address provided
  const userTransactions = userAddress
    ? transactions.filter(tx =>
        tx.from.toLowerCase() === userAddress.toLowerCase() ||
        tx.to.toLowerCase() === userAddress.toLowerCase()
      )
    : transactions

  return {
    transactions: userTransactions,
    allTransactions,
    isLoading,
    error,
    useCache,
    setUseCache,
    refetch: () => {
      if (useCache) {
        fetchCachedTransactions()
      } else {
        setIsLoading(true)
      }
    }
  }
}

// Hook for getting transaction details
export function useTransactionDetails(hash: string) {
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const publicClient = usePublicClient()

  useEffect(() => {
    if (!publicClient || !hash) return

    const fetchTransactionDetails = async () => {
      setIsLoading(true)
      try {
        const tx = await publicClient.getTransaction({ hash: hash as `0x${string}` })
        const receipt = await publicClient.getTransactionReceipt({ hash: hash as `0x${string}` })
        const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber })

        setTransaction({
          id: hash,
          hash: hash as `0x${string}`,
          blockNumber: receipt.blockNumber,
          timestamp: Number(block.timestamp) * 1000,
          type: 'Transfer', // Default, would need to parse logs for exact type
          from: tx.from,
          to: tx.to || '0x0000000000000000000000000000000000000000' as Address,
          amount: tx.value,
          status: receipt.status === 'success' ? 'Completed' : 'Failed',
          gasUsed: receipt.gasUsed,
          gasFee: receipt.gasUsed * tx.gasPrice,
        })
      } catch (err) {
        console.error('Failed to fetch transaction details:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactionDetails()
  }, [publicClient, hash])

  return { transaction, isLoading }
}

// Helper functions
export function formatTransactionType(type: Transaction['type']): string {
  const typeMap = {
    Purchase: 'Token Purchase',
    Sale: 'Token Sale',
    Mint: 'Token Mint',
    Burn: 'Token Burn',
    Stake: 'Token Stake',
    Unstake: 'Token Unstake',
    Revenue: 'Revenue Distribution',
    Transfer: 'Token Transfer'
  }
  return typeMap[type] || type
}

export function getTransactionIcon(type: Transaction['type']) {
  // Returns the appropriate icon for transaction type
  // This can be used in components
  const iconMap = {
    Purchase: 'ShoppingCart',
    Sale: 'ArrowUpRight',
    Mint: 'Plus',
    Burn: 'Minus',
    Stake: 'Lock',
    Unstake: 'Unlock',
    Revenue: 'DollarSign',
    Transfer: 'ArrowRightLeft'
  }
  return iconMap[type] || 'Activity'
}