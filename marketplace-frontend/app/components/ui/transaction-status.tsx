"use client"

import { useEffect, useState } from "react"
import { Card } from "./card"
import { Button } from "./button"
import { Badge } from "./badge"
import { CheckCircle, Clock, XCircle, ExternalLink, Loader2 } from "lucide-react"
import { useTransactionStatus } from "@/app/lib/web3/hooks/use-real-time-updates"

interface TransactionToast {
  id: string
  hash: string
  type: 'purchase' | 'sale' | 'stake' | 'unstake' | 'claim'
  amount?: string
  timestamp: number
}

interface TransactionStatusProps {
  txHash: string
  type: 'purchase' | 'sale' | 'stake' | 'unstake' | 'claim'
  amount?: string
  onClose: () => void
}

export function TransactionStatusToast({ txHash, type, amount, onClose }: TransactionStatusProps) {
  const { status, confirmations } = useTransactionStatus(txHash)

  const getExplorerUrl = (hash: string) => {
    return `https://hashscan.io/testnet/transaction/${hash}`
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'border-yellow-200 bg-yellow-50'
      case 'confirmed':
        return 'border-green-200 bg-green-50'
      case 'failed':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getTypeLabel = () => {
    switch (type) {
      case 'purchase':
        return 'Token Purchase'
      case 'sale':
        return 'Token Sale'
      case 'stake':
        return 'Token Stake'
      case 'unstake':
        return 'Token Unstake'
      case 'claim':
        return 'Reward Claim'
      default:
        return 'Transaction'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Processing...'
      case 'confirmed':
        return `Confirmed (${confirmations} confirmations)`
      case 'failed':
        return 'Failed'
      default:
        return 'Pending'
    }
  }

  // Auto-close after successful confirmation
  useEffect(() => {
    if (status === 'confirmed') {
      const timer = setTimeout(onClose, 5000) // Close after 5 seconds
      return () => clearTimeout(timer)
    }
  }, [status, onClose])

  return (
    <Card className={`p-4 ${getStatusColor()} border-l-4 shadow-lg`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {getStatusIcon()}
          <div className="flex-1">
            <h4 className="font-medium text-sm text-gray-900">
              {getTypeLabel()}
            </h4>
            <p className="text-xs text-gray-600 mt-1">
              {getStatusText()}
            </p>
            {amount && (
              <p className="text-xs text-gray-500 mt-1">
                Amount: {amount}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(getExplorerUrl(txHash), '_blank')}
            className="h-6 w-6 p-0"
            title="View on Explorer"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
            title="Close"
          >
            ×
          </Button>
        </div>
      </div>
    </Card>
  )
}

// Toast container component
export function TransactionToastContainer() {
  const [toasts, setToasts] = useState<TransactionToast[]>([])

  const addToast = (toast: Omit<TransactionToast, 'id' | 'timestamp'>) => {
    const newToast: TransactionToast = {
      ...toast,
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  // Expose methods globally for use in hooks
  useEffect(() => {
    (window as any).addTransactionToast = addToast
    return () => {
      delete (window as any).addTransactionToast
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <TransactionStatusToast
          key={toast.id}
          txHash={toast.hash}
          type={toast.type}
          amount={toast.amount}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

// Hook to trigger transaction toasts
export function useTransactionToast() {
  const addToast = (toast: Omit<TransactionToast, 'id' | 'timestamp'>) => {
    if (typeof window !== 'undefined' && (window as any).addTransactionToast) {
      (window as any).addTransactionToast(toast)
    }
  }

  return { addToast }
}