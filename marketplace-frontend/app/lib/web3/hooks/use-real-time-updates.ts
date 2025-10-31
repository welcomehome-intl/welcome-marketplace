"use client"

import { useEffect, useState, useCallback } from 'react'
import { useWatchContractEvent, useAccount } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../config'
import { PROPERTY_TOKEN_ABI, PROPERTY_FACTORY_ABI } from '../abi'
import { Address, formatUnits } from 'viem'
import { Transaction } from './use-transaction-history'
import { useNotificationHelpers } from '@/app/lib/supabase/hooks/use-notifications'

export interface RealtimeNotification {
  id: string
  type: 'purchase' | 'sale' | 'stake' | 'revenue' | 'transfer'
  title: string
  message: string
  timestamp: number
  txHash: string
  amount?: bigint
  user?: Address
}

export function useRealtimeUpdates() {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])
  const [newTransactionCount, setNewTransactionCount] = useState(0)
  const { address } = useAccount()
  const { notifyTransactionSuccess, notifyRevenueDistribution } = useNotificationHelpers()

  // Clear notification count when user checks
  const clearNotificationCount = useCallback(() => {
    setNewTransactionCount(0)
  }, [])

  // Remove a specific notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([])
    setNewTransactionCount(0)
  }, [])

  // Listen to Purchase events (DISABLED - no PROPERTY_MANAGER contract exists)
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.PROPERTY_FACTORY as Address,
    abi: PROPERTY_FACTORY_ABI,
    eventName: 'TokensPurchased',
    enabled: false, // Disabled - Hedera doesn't support event watching (exceeds 1000 block limit)
    onLogs: (logs) => {
      logs.forEach(async (log) => {
        const notification: RealtimeNotification = {
          id: `purchase-${log.transactionHash}-${log.logIndex}`,
          type: 'purchase',
          title: 'Token Purchase',
          message: `${formatUnits(log.args.amount!, 18)} tokens purchased for ${formatUnits(log.args.totalCost!, 18)} HBAR`,
          timestamp: Date.now(),
          txHash: log.transactionHash,
          amount: log.args.amount!,
          user: log.args.buyer!,
        }

        setNotifications(prev => [notification, ...prev.slice(0, 9)]) // Keep latest 10
        setNewTransactionCount(prev => prev + 1)

        // Create persistent notification in Supabase
        if (log.args.buyer) {
          await notifyTransactionSuccess(
            log.args.buyer,
            log.transactionHash,
            'purchase',
            formatUnits(log.args.amount!, 18)
          )
        }
      })
    }
  })

  // Listen to Staking events (DISABLED - no PROPERTY_MANAGER contract exists)
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.PROPERTY_FACTORY as Address,
    abi: PROPERTY_FACTORY_ABI,
    eventName: 'TokensStaked',
    enabled: false, // Disabled - Hedera doesn't support event watching (exceeds 1000 block limit)
    onLogs: (logs) => {
      logs.forEach(async (log) => {
        const notification: RealtimeNotification = {
          id: `stake-${log.transactionHash}-${log.logIndex}`,
          type: 'stake',
          title: 'Tokens Staked',
          message: `${formatUnits(log.args.amount!, 18)} tokens staked for rewards`,
          timestamp: Date.now(),
          txHash: log.transactionHash,
          amount: log.args.amount!,
          user: log.args.staker!,
        }

        setNotifications(prev => [notification, ...prev.slice(0, 9)])
        setNewTransactionCount(prev => prev + 1)

        // Create persistent notification in Supabase
        if (log.args.staker) {
          await notifyTransactionSuccess(
            log.args.staker,
            log.transactionHash,
            'stake',
            formatUnits(log.args.amount!, 18)
          )
        }
      })
    }
  })

  // Listen to Revenue Distribution events (DISABLED - no PROPERTY_MANAGER contract exists)
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.PROPERTY_FACTORY as Address,
    abi: PROPERTY_FACTORY_ABI,
    eventName: 'RevenueDistributed',
    enabled: false, // Disabled - Hedera doesn't support event watching (exceeds 1000 block limit)
    onLogs: (logs) => {
      logs.forEach(async (log) => {
        const notification: RealtimeNotification = {
          id: `revenue-${log.transactionHash}-${log.logIndex}`,
          type: 'revenue',
          title: 'Revenue Distributed',
          message: `${formatUnits(log.args.totalRevenue!, 18)} HBAR distributed to token holders`,
          timestamp: Date.now(),
          txHash: log.transactionHash,
          amount: log.args.totalRevenue!,
        }

        setNotifications(prev => [notification, ...prev.slice(0, 9)])
        setNewTransactionCount(prev => prev + 1)

        // Note: Revenue distribution affects multiple users
        // This would need to be handled by a backend service that calculates
        // individual distributions and creates notifications for each user
        // For now, we just create the general notification
      })
    }
  })

  // Listen to Transfer events (for large transfers or specific user transfers)
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
    abi: PROPERTY_TOKEN_ABI,
    eventName: 'Transfer',
    enabled: false, // Disabled - Hedera doesn't support event watching (exceeds 1000 block limit)
    onLogs: (logs) => {
      logs.forEach((log) => {
        const amount = log.args.value!
        const isLargeTransfer = amount > BigInt(1000 * 1e18) // 1000+ tokens
        const isUserInvolved = address && (
          log.args.from?.toLowerCase() === address.toLowerCase() ||
          log.args.to?.toLowerCase() === address.toLowerCase()
        )

        // Only notify for large transfers or user-involved transfers
        if (isLargeTransfer || isUserInvolved) {
          const notification: RealtimeNotification = {
            id: `transfer-${log.transactionHash}-${log.logIndex}`,
            type: 'transfer',
            title: isUserInvolved ? 'Your Token Transfer' : 'Large Token Transfer',
            message: `${formatUnits(amount, 18)} tokens transferred`,
            timestamp: Date.now(),
            txHash: log.transactionHash,
            amount: amount,
            user: log.args.from!,
          }

          setNotifications(prev => [notification, ...prev.slice(0, 9)])
          if (isUserInvolved) {
            setNewTransactionCount(prev => prev + 1)
          }
        }
      })
    }
  })

  return {
    notifications,
    newTransactionCount,
    clearNotificationCount,
    removeNotification,
    clearAllNotifications,
  }
}

// Hook for transaction status updates
export function useTransactionStatus(txHash?: string) {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed' | null>(null)
  const [confirmations, setConfirmations] = useState(0)

  useEffect(() => {
    if (!txHash) {
      setStatus(null)
      setConfirmations(0)
      return
    }

    // In a real implementation, this would monitor the transaction
    // For now, simulate status updates
    setStatus('pending')

    const timer = setTimeout(() => {
      setStatus('confirmed')
      setConfirmations(1)
    }, 3000)

    return () => clearTimeout(timer)
  }, [txHash])

  return { status, confirmations }
}