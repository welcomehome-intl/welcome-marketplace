"use client"

import { useState, useEffect } from "react"
import { Card } from "./card"
import { Button } from "./button"
import { Badge } from "./badge"
import { Bell, X, ExternalLink, ShoppingCart, Lock, DollarSign, ArrowRightLeft, Loader2, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { RealtimeNotification, useRealtimeUpdates } from "@/app/lib/web3/hooks/use-real-time-updates"
import { useNotifications } from "@/app/lib/supabase/hooks/use-notifications"
import { formatUnits } from "viem"

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { notifications: realtimeNotifications, clearAllNotifications: clearRealtimeNotifications } = useRealtimeUpdates()
  const { notifications: supabaseNotifications, isLoading, markAllAsRead, deleteAllNotifications } = useNotifications()
  const [activeTab, setActiveTab] = useState<'recent' | 'all'>('recent')

  const displayNotifications = activeTab === 'recent' ? realtimeNotifications : supabaseNotifications

  if (!isOpen) return null

  const getNotificationIcon = (type: RealtimeNotification['type']) => {
    switch (type) {
      case 'purchase':
        return <ShoppingCart className="h-4 w-4 text-blue-600" />
      case 'stake':
        return <Lock className="h-4 w-4 text-orange-600" />
      case 'revenue':
        return <DollarSign className="h-4 w-4 text-green-600" />
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-purple-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getNotificationColor = (type: RealtimeNotification['type']) => {
    switch (type) {
      case 'purchase':
        return 'bg-blue-50 border-blue-200'
      case 'stake':
        return 'bg-orange-50 border-orange-200'
      case 'revenue':
        return 'bg-green-50 border-green-200'
      case 'transfer':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getSupabaseNotificationColor = (notification: any) => {
    if ('type' in notification && typeof notification.type === 'string') {
      // This is a realtime notification
      return getNotificationColor(notification.type)
    }

    // This is a Supabase notification
    switch (notification.type) {
      case 'transaction_success':
        return 'bg-green-50 border-green-200'
      case 'transaction_failed':
        return 'bg-red-50 border-red-200'
      case 'property_update':
        return 'bg-blue-50 border-blue-200'
      case 'governance_proposal':
        return 'bg-purple-50 border-purple-200'
      case 'revenue_distribution':
        return 'bg-emerald-50 border-emerald-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getSupabaseNotificationIcon = (notification: any) => {
    if ('type' in notification && typeof notification.type === 'string') {
      // This is a realtime notification
      return getNotificationIcon(notification.type)
    }

    // This is a Supabase notification
    switch (notification.type) {
      case 'transaction_success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'transaction_failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'property_update':
        return <ShoppingCart className="h-4 w-4 text-blue-600" />
      case 'governance_proposal':
        return <Bell className="h-4 w-4 text-purple-600" />
      case 'revenue_distribution':
        return <DollarSign className="h-4 w-4 text-emerald-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getExplorerUrl = (hash: string) => {
    return `https://hashscan.io/testnet/transaction/${hash}`
  }

  return (
    <div className="absolute right-0 top-16 w-96 max-h-96 overflow-hidden z-50 bg-white border rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md">
            <Button
              variant={activeTab === 'recent' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('recent')}
              className="text-xs rounded-r-none"
            >
              Recent
            </Button>
            <Button
              variant={activeTab === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('all')}
              className="text-xs rounded-l-none"
            >
              All
            </Button>
          </div>
          {displayNotifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={activeTab === 'recent' ? clearRealtimeNotifications : markAllAsRead}
              className="text-xs"
            >
              {activeTab === 'recent' ? 'Clear All' : 'Mark All Read'}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        ) : displayNotifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {displayNotifications.slice(0, 10).map((notification) => (
              <Card key={notification.id} className={`p-3 ${getSupabaseNotificationColor(notification)}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getSupabaseNotificationIcon(notification)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        {activeTab === 'all' && 'read' in notification && !notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(
                          'timestamp' in notification
                            ? notification.timestamp
                            : notification.created_at
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {'txHash' in notification && notification.txHash && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(getExplorerUrl(notification.txHash), '_blank')}
                        className="h-6 w-6 p-0"
                        title="View on Explorer"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if ('markAsRead' in notification && activeTab === 'all') {
                          notification.markAsRead()
                        }
                        // For realtime notifications, remove from list
                        if ('timestamp' in notification && activeTab === 'recent') {
                          // This would call the remove function from useRealtimeUpdates
                        }
                      }}
                      className="h-6 w-6 p-0"
                      title={activeTab === 'all' ? 'Mark as Read' : 'Remove'}
                    >
                      {activeTab === 'all' ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { newTransactionCount, clearNotificationCount } = useRealtimeUpdates()
  const { unreadCount } = useNotifications()

  const totalUnread = newTransactionCount + unreadCount

  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen && newTransactionCount > 0) {
      clearNotificationCount()
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {totalUnread > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {totalUnread > 9 ? '9+' : totalUnread}
          </Badge>
        )}
      </Button>

      <NotificationsPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  )
}