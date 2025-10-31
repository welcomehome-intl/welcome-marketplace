"use client"

import { useState, useEffect, useCallback } from 'react'
import { useWatchContractEvent, useAccount, usePublicClient } from 'wagmi'
import { supabase } from '../client'
import { TransactionCache, TransactionCacheInsert } from '../types'
import { CONTRACT_ADDRESSES } from '@/app/lib/web3/config'
import { PROPERTY_TOKEN_ABI, PROPERTY_FACTORY_ABI } from '@/app/lib/web3/abi'
import { Address, formatUnits, Log } from 'viem'

export interface CachedTransaction extends TransactionCache {
  formatted: {
    amount: number
    tokenAmount?: number
    timestamp: Date
  }
}

export function useTransactionCache() {
  const [isIndexing, setIsIndexing] = useState(false)
  const [lastIndexedBlock, setLastIndexedBlock] = useState<bigint>(BigInt(0))
  const { address } = useAccount()
  const publicClient = usePublicClient()

  // Cache a single transaction
  const cacheTransaction = useCallback(async (
    txHash: string,
    blockNumber: number,
    userAddress: string,
    transactionType: string,
    amount: string,
    tokenAmount?: string,
    contractAddress?: string,
    status: string = 'confirmed'
  ): Promise<boolean> => {
    try {
      const transaction: TransactionCacheInsert = {
        tx_hash: txHash,
        block_number: blockNumber,
        user_address: userAddress.toLowerCase(),
        transaction_type: transactionType,
        amount: amount,
        token_amount: tokenAmount || null,
        contract_address: contractAddress || null,
        timestamp: new Date().toISOString(),
        status,
      }

      const { error } = await supabase
        .from('transaction_cache')
        .upsert(transaction, { onConflict: 'tx_hash' })

      if (error) {
        console.error('Error caching transaction:', error)
        return false
      }

      return true
    } catch (err) {
      console.error('Error caching transaction:', err)
      return false
    }
  }, [])

  // Get cached transactions for a user
  const getCachedTransactions = useCallback(async (
    userAddr?: string,
    limit: number = 50
  ): Promise<CachedTransaction[]> => {
    try {
      let query = supabase
        .from('transaction_cache')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (userAddr) {
        query = query.eq('user_address', userAddr.toLowerCase())
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []).map(tx => ({
        ...tx,
        formatted: {
          amount: parseFloat(tx.amount || '0'),
          tokenAmount: tx.token_amount ? parseFloat(tx.token_amount) : undefined,
          timestamp: new Date(tx.timestamp || tx.indexed_at),
        }
      }))
    } catch (err) {
      console.error('Error fetching cached transactions:', err)
      return []
    }
  }, [])

  // Get transaction statistics from cache
  const getTransactionStats = useCallback(async (userAddr?: string) => {
    try {
      let baseQuery = supabase.from('transaction_cache')

      if (userAddr) {
        baseQuery = baseQuery.eq('user_address', userAddr.toLowerCase())
      }

      const [
        { count: totalCount },
        { data: typeStats },
        { data: dailyStats }
      ] = await Promise.all([
        baseQuery.select('*', { count: 'exact', head: true }),
        baseQuery
          .select('transaction_type')
          .then(({ data }) => {
            const counts: Record<string, number> = {}
            data?.forEach(tx => {
              counts[tx.transaction_type || 'unknown'] = (counts[tx.transaction_type || 'unknown'] || 0) + 1
            })
            return { data: counts }
          }),
        baseQuery
          .select('timestamp, amount')
          .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .then(({ data }) => {
            const dailyCounts: Record<string, { count: number, volume: number }> = {}
            data?.forEach(tx => {
              const date = new Date(tx.timestamp || '').toDateString()
              if (!dailyCounts[date]) {
                dailyCounts[date] = { count: 0, volume: 0 }
              }
              dailyCounts[date].count++
              dailyCounts[date].volume += parseFloat(tx.amount || '0')
            })
            return { data: dailyCounts }
          })
      ])

      return {
        totalTransactions: totalCount || 0,
        transactionsByType: typeStats || {},
        daily: dailyStats || {},
      }
    } catch (err) {
      console.error('Error fetching transaction stats:', err)
      return {
        totalTransactions: 0,
        transactionsByType: {},
        daily: {},
      }
    }
  }, [])

  // Index historical transactions (run once or periodically)
  const indexHistoricalTransactions = useCallback(async (
    fromBlock?: bigint,
    toBlock?: bigint
  ) => {
    if (!publicClient) return

    setIsIndexing(true)

    try {
      const currentBlock = await publicClient.getBlockNumber()
      const startBlock = fromBlock || (currentBlock - BigInt(10000)) // Last ~10k blocks
      const endBlock = toBlock || currentBlock

      console.log(`Indexing transactions from block ${startBlock} to ${endBlock}`)

      // Get Transfer events from PropertyToken
      const transferLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
        events: [
          {
            type: 'event',
            name: 'Transfer',
            inputs: [
              { indexed: true, name: 'from', type: 'address' },
              { indexed: true, name: 'to', type: 'address' },
              { indexed: false, name: 'value', type: 'uint256' }
            ]
          }
        ],
        fromBlock: startBlock,
        toBlock: endBlock,
      })

      // Get Purchase events from PropertyFactory
      const purchaseLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESSES.PROPERTY_FACTORY as Address,
        events: [
          {
            type: 'event',
            name: 'TokensPurchased',
            inputs: [
              { indexed: true, name: 'buyer', type: 'address' },
              { indexed: false, name: 'amount', type: 'uint256' },
              { indexed: false, name: 'totalCost', type: 'uint256' }
            ]
          }
        ],
        fromBlock: startBlock,
        toBlock: endBlock,
      })

      // Process and cache transactions
      const transactions: TransactionCacheInsert[] = []

      // Process transfer events
      transferLogs.forEach((log: any) => {
        transactions.push({
          tx_hash: log.transactionHash,
          block_number: Number(log.blockNumber),
          user_address: log.args.from,
          transaction_type: 'Transfer',
          amount: formatUnits(log.args.value, 18),
          token_amount: formatUnits(log.args.value, 18),
          contract_address: CONTRACT_ADDRESSES.PROPERTY_TOKEN,
          timestamp: new Date().toISOString(), // Would get actual block timestamp in full impl
          status: 'confirmed',
        })
      })

      // Process purchase events
      purchaseLogs.forEach((log: any) => {
        transactions.push({
          tx_hash: log.transactionHash,
          block_number: Number(log.blockNumber),
          user_address: log.args.buyer,
          transaction_type: 'Purchase',
          amount: formatUnits(log.args.totalCost, 18),
          token_amount: formatUnits(log.args.amount, 18),
          contract_address: CONTRACT_ADDRESSES.PROPERTY_FACTORY,
          timestamp: new Date().toISOString(),
          status: 'confirmed',
        })
      })

      // Batch insert transactions
      if (transactions.length > 0) {
        const { error } = await supabase
          .from('transaction_cache')
          .upsert(transactions, { onConflict: 'tx_hash' })

        if (error) {
          console.error('Error batch inserting transactions:', error)
        } else {
          console.log(`Successfully indexed ${transactions.length} transactions`)
          setLastIndexedBlock(endBlock)
        }
      }

    } catch (err) {
      console.error('Error indexing historical transactions:', err)
    } finally {
      setIsIndexing(false)
    }
  }, [publicClient])

  return {
    cacheTransaction,
    getCachedTransactions,
    getTransactionStats,
    indexHistoricalTransactions,
    isIndexing,
    lastIndexedBlock,
  }
}

// Hook for real-time transaction caching (listens to events and auto-caches)
export function useRealTimeTransactionCaching() {
  const { cacheTransaction } = useTransactionCache()
  const { address } = useAccount()

  // Auto-cache Purchase events
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.PROPERTY_FACTORY as Address,
    abi: PROPERTY_FACTORY_ABI,
    eventName: 'TokensPurchased',
    enabled: false, // Disabled - Hedera doesn't support event watching (exceeds 1000 block limit)
    onLogs: async (logs) => {
      for (const log of logs) {
        await cacheTransaction(
          log.transactionHash,
          Number(log.blockNumber),
          log.args.buyer as string,
          'Purchase',
          formatUnits(log.args.totalCost as bigint, 18),
          formatUnits(log.args.amount as bigint, 18),
          CONTRACT_ADDRESSES.PROPERTY_FACTORY
        )
      }
    }
  })

  // Auto-cache Staking events
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.PROPERTY_FACTORY as Address,
    abi: PROPERTY_FACTORY_ABI,
    eventName: 'TokensStaked',
    enabled: false, // Disabled - Hedera doesn't support event watching (exceeds 1000 block limit)
    onLogs: async (logs) => {
      for (const log of logs) {
        await cacheTransaction(
          log.transactionHash,
          Number(log.blockNumber),
          log.args.staker as string,
          'Stake',
          '0', // No HBAR cost for staking
          formatUnits(log.args.amount as bigint, 18),
          CONTRACT_ADDRESSES.PROPERTY_FACTORY
        )
      }
    }
  })

  // Auto-cache Transfer events
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
    abi: PROPERTY_TOKEN_ABI,
    eventName: 'Transfer',
    enabled: false, // Disabled - Hedera doesn't support event watching (exceeds 1000 block limit)
    onLogs: async (logs) => {
      for (const log of logs) {
        // Cache for both sender and receiver
        await Promise.all([
          cacheTransaction(
            log.transactionHash,
            Number(log.blockNumber),
            log.args.from as string,
            'Transfer',
            '0',
            formatUnits(log.args.value as bigint, 18),
            CONTRACT_ADDRESSES.PROPERTY_TOKEN
          ),
          cacheTransaction(
            log.transactionHash,
            Number(log.blockNumber),
            log.args.to as string,
            'Transfer',
            '0',
            formatUnits(log.args.value as bigint, 18),
            CONTRACT_ADDRESSES.PROPERTY_TOKEN
          ),
        ])
      }
    }
  })

  return {
    // This hook primarily provides automatic caching
    // The actual cache functions are available via useTransactionCache
  }
}