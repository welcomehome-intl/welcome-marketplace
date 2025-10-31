"use client"

import { useState } from "react"
import { Card } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { formatCurrency } from "@/app/lib/utils"
import { Search, Filter, TrendingUp, TrendingDown, Activity, ShoppingCart, ArrowRightLeft, Lock, DollarSign, ExternalLink } from "lucide-react"
import { useAccount } from "wagmi"
import { useTransactionHistory, formatTransactionType } from "@/app/lib/web3/hooks/use-transaction-history"
import { formatUnits } from "viem"
import { useMounted } from "@/app/lib/hooks/use-mounted"

// Disable static rendering for this page
export const dynamic = 'force-dynamic'

export default function TransactionsPage() {
  const mounted = useMounted()
  const [searchQuery, setSearchQuery] = useState("")
  const { address } = useAccount()
  const { transactions, allTransactions, isLoading, error } = useTransactionHistory(address)

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center">
          <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Transactions...</h1>
        </div>
      </div>
    )
  }

  // Filter out dummy/invalid transactions
  const validTransactions = transactions.filter(tx => {
    // Filter out transactions with zero addresses
    const hasValidFrom = tx.from && tx.from !== '0x0000000000000000000000000000000000000000'
    const hasValidTo = tx.to && tx.to !== '0x0000000000000000000000000000000000000000'

    // Filter out zero amount transactions (except for valid transfers with token amounts)
    const hasValidAmount = tx.amount > 0n || (tx.tokenAmount && tx.tokenAmount > 0n)

    // Must have a valid transaction hash
    const hasValidHash = tx.hash && tx.hash.length === 66 && tx.hash.startsWith('0x')

    // At least one valid address and valid hash
    return (hasValidFrom || hasValidTo) && hasValidAmount && hasValidHash
  })

  // Group valid transactions by date
  const groupedTransactions = validTransactions.reduce((acc, tx) => {
    const date = new Date(tx.timestamp).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(tx)
    return acc
  }, {} as Record<string, typeof validTransactions>)

  // Calculate stats from valid transactions only
  const totalTransactions = allTransactions.filter(tx => {
    const hasValidFrom = tx.from && tx.from !== '0x0000000000000000000000000000000000000000'
    const hasValidTo = tx.to && tx.to !== '0x0000000000000000000000000000000000000000'
    return hasValidFrom || hasValidTo
  }).length
  const userTransactions = validTransactions.length
  const totalInvested = validTransactions
    .filter(tx => tx.type === 'Purchase')
    .reduce((sum, tx) => sum + Number(formatUnits(tx.amount, 18)), 0)

  return (
    <div className="p-4 md:p-6 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
          <p className="text-gray-600">Track all your property transactions and investment activities</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search transactions by property, amount, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-12 text-base border-gray-200 focus:border-primary focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-12 px-6 border-gray-200 hover:bg-gray-50">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" className="h-12 px-6 border-gray-200 hover:bg-gray-50">
              Export
            </Button>
          </div>
        </div>

        {/* Transactions List */}
        <Card className="overflow-hidden border-0 shadow-sm">
          {isLoading ? (
            <div className="p-6">
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
                <p className="text-gray-600">Loading transactions...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-red-400" />
                <p className="text-red-600 mb-2">Failed to load transactions</p>
                <p className="text-gray-500 text-sm">{error}</p>
              </div>
            </div>
          ) : Object.keys(groupedTransactions).length === 0 ? (
            <div className="p-6">
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">No transactions found</p>
                <p className="text-gray-500 text-sm">Your transaction history will appear here</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {Object.entries(groupedTransactions)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([date, txs]) => (
                  <div key={date} className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {new Date(date).toDateString() === new Date().toDateString()
                            ? 'Today'
                            : new Date(date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric'
                              })
                          }
                        </h3>
                        <p className="text-sm text-gray-500">{date}</p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                        {txs.length} transaction{txs.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      {txs.map((tx) => (
                        <TransactionItem key={tx.id} transaction={tx} />
                      ))}
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </Card>
    </div>
  )
}

function TransactionItem({ transaction }: { transaction: any }) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Purchase':
        return <ShoppingCart className="h-4 w-4 text-green-600" />
      case 'Sale':
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      case 'Stake':
        return <Lock className="h-4 w-4 text-purple-600" />
      case 'Revenue':
        return <DollarSign className="h-4 w-4 text-emerald-600" />
      case 'Transfer':
        return <ArrowRightLeft className="h-4 w-4 text-orange-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getTransactionTitle = () => {
    switch (transaction.type) {
      case 'Purchase':
        return 'Token Purchase'
      case 'Sale':
        return 'Token Sale'
      case 'Transfer':
        return 'Token Transfer'
      case 'Stake':
        return 'Token Staking'
      case 'Revenue':
        return 'Revenue Distribution'
      default:
        return formatTransactionType(transaction.type)
    }
  }

  const getExplorerUrl = (hash: string) => {
    return `https://hashscan.io/testnet/transaction/${hash}`
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 hover:bg-gray-50/50 hover:border-gray-200 transition-all">
      {/* Transaction Type Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 shrink-0">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-white/80">
          {getTypeIcon(transaction.type)}
        </div>
      </div>

      {/* Transaction Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <h4 className="font-semibold text-gray-900 truncate pr-2">
            {getTransactionTitle()}
          </h4>
          <div className="text-right shrink-0">
            <p className="font-semibold text-lg text-gray-900">
              {transaction.type === 'Purchase' || transaction.type === 'Stake' ? '-' : ''}
              {formatCurrency(parseFloat(formatUnits(transaction.amount, 18)))}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 md:gap-3 text-sm text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="truncate max-w-32 md:max-w-none">
                {transaction.type === 'Transfer'
                  ? `${formatAddress(transaction.from)} → ${formatAddress(transaction.to)}`
                  : `Hash: ${formatAddress(transaction.hash)}`
                }
              </span>
            </span>
            {transaction.tokenAmount && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="whitespace-nowrap">
                  {parseFloat(formatUnits(transaction.tokenAmount, 18)).toLocaleString()} tokens
                </span>
              </>
            )}
            <span className="hidden sm:inline">•</span>
            <span className="whitespace-nowrap">
              {new Date(transaction.timestamp).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`text-xs font-medium shrink-0 ${getStatusColor(transaction.status)}`}>
              {transaction.status}
            </Badge>
            <button
              onClick={() => window.open(getExplorerUrl(transaction.hash), '_blank')}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="View on HashScan"
            >
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}