"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '../client'
import { Notification, NotificationInsert } from '../types'

export interface NotificationWithActions extends Notification {
  markAsRead: () => Promise<void>
  delete: () => Promise<void>
}

export function useNotifications() {
  const { address } = useAccount()
  const [notifications, setNotifications] = useState<NotificationWithActions[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch notifications for the current user
  const fetchNotifications = useCallback(async () => {
    if (!address || !supabase) {
      setNotifications([])
      setUnreadCount(0)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_address', address.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) throw fetchError

      // Add action methods to each notification
      const notificationsWithActions: NotificationWithActions[] = (data || []).map(notification => ({
        ...notification,
        markAsRead: () => markNotificationAsRead(notification.id),
        delete: () => deleteNotification(notification.id),
      }))

      setNotifications(notificationsWithActions)
      setUnreadCount(notificationsWithActions.filter(n => !n.read).length)
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
    } finally {
      setIsLoading(false)
    }
  }, [address])

  // Create a new notification
  const createNotification = useCallback(async (
    userAddress: string,
    type: string,
    title: string,
    message: string,
    data?: any
  ): Promise<boolean> => {
    if (!supabase) return false

    try {
      const notification: NotificationInsert = {
        user_address: userAddress.toLowerCase(),
        type,
        title,
        message,
        data: data || null,
        read: false,
      }

      const { error } = await supabase
        .from('notifications')
        .insert(notification)

      if (error) throw error

      // If it's for the current user, refresh notifications
      if (userAddress.toLowerCase() === address?.toLowerCase()) {
        fetchNotifications()
      }

      return true
    } catch (err) {
      console.error('Error creating notification:', err)
      return false
    }
  }, [address, fetchNotifications])

  // Mark a specific notification as read
  const markNotificationAsRead = useCallback(async (notificationId: string): Promise<void> => {
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, read: true }
            : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (): Promise<void> => {
    if (!address || !supabase) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_address', address.toLowerCase())
        .eq('read', false)

      if (error) throw error

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }, [address])

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId: string): Promise<void> => {
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))

      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }, [notifications])

  // Delete all notifications
  const deleteAllNotifications = useCallback(async (): Promise<void> => {
    if (!address || !supabase) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_address', address.toLowerCase())

      if (error) throw error

      setNotifications([])
      setUnreadCount(0)
    } catch (err) {
      console.error('Error deleting all notifications:', err)
    }
  }, [address])

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!address || !supabase) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_address=eq.${address.toLowerCase()}`,
        },
        (payload) => {
          console.log('Notification change received:', payload)
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [address, fetchNotifications])

  // Initial load
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    createNotification,
    markNotificationAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refetch: fetchNotifications,
  }
}

// Hook for notification helpers (creating common notification types)
export function useNotificationHelpers() {
  const { createNotification } = useNotifications()

  const notifyTransactionSuccess = useCallback((
    userAddress: string,
    txHash: string,
    type: 'purchase' | 'sale' | 'stake' | 'unstake',
    amount: string
  ) => {
    const titles = {
      purchase: 'Token Purchase Successful',
      sale: 'Token Sale Successful',
      stake: 'Tokens Staked Successfully',
      unstake: 'Tokens Unstaked Successfully',
    }

    const messages = {
      purchase: `Successfully purchased ${amount} tokens`,
      sale: `Successfully sold ${amount} tokens`,
      stake: `Successfully staked ${amount} tokens`,
      unstake: `Successfully unstaked ${amount} tokens`,
    }

    return createNotification(
      userAddress,
      'transaction_success',
      titles[type],
      messages[type],
      { txHash, amount, transactionType: type }
    )
  }, [createNotification])

  const notifyTransactionFailed = useCallback((
    userAddress: string,
    txHash: string,
    type: 'purchase' | 'sale' | 'stake' | 'unstake',
    error: string
  ) => {
    return createNotification(
      userAddress,
      'transaction_failed',
      `${type.charAt(0).toUpperCase() + type.slice(1)} Failed`,
      `Transaction failed: ${error}`,
      { txHash, error, transactionType: type }
    )
  }, [createNotification])

  const notifyPropertyUpdate = useCallback((
    userAddress: string,
    propertyName: string,
    updateType: string
  ) => {
    return createNotification(
      userAddress,
      'property_update',
      'Property Update',
      `${propertyName} has been ${updateType}`,
      { propertyName, updateType }
    )
  }, [createNotification])

  const notifyGovernanceProposal = useCallback((
    userAddress: string,
    proposalTitle: string,
    proposalId: string
  ) => {
    return createNotification(
      userAddress,
      'governance_proposal',
      'New Governance Proposal',
      `New proposal: ${proposalTitle}`,
      { proposalTitle, proposalId }
    )
  }, [createNotification])

  const notifyRevenueDistribution = useCallback((
    userAddress: string,
    amount: string
  ) => {
    return createNotification(
      userAddress,
      'revenue_distribution',
      'Revenue Distributed',
      `You received ${amount} HBAR in revenue distribution`,
      { amount }
    )
  }, [createNotification])

  return {
    notifyTransactionSuccess,
    notifyTransactionFailed,
    notifyPropertyUpdate,
    notifyGovernanceProposal,
    notifyRevenueDistribution,
  }
}