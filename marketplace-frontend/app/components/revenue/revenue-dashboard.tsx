"use client"

import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import {
  usePropertyRevenue,
  useClaimableRevenue,
  useClaimRevenue
} from '@/app/lib/web3/hooks/use-token-handler'
import { useTokenBalance } from '@/app/lib/web3/hooks/use-property-token'
import { DollarSign, TrendingUp, Calendar, Coins, CheckCircle, AlertCircle } from 'lucide-react'

export function RevenueDashboard() {
  const { address, isConnected } = useAccount()
  const { revenue, refetch: refetchRevenue } = usePropertyRevenue()
  const { claimableAmount, refetch: refetchClaimable } = useClaimableRevenue(address)
  const { balance } = useTokenBalance(address)

  if (!isConnected) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Connect your wallet to view revenue information</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold">Total Revenue</h3>
          </div>
          <p className="text-2xl font-bold">
            {revenue?.totalRevenue ? formatUnits(revenue.totalRevenue, 18) : '0'}
          </p>
          <p className="text-sm text-gray-600">HBAR Generated</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold">Revenue per Token</h3>
          </div>
          <p className="text-2xl font-bold">
            {revenue?.revenuePerToken ? formatUnits(revenue.revenuePerToken, 18) : '0'}
          </p>
          <p className="text-sm text-gray-600">HBAR per Token</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Coins className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold">Claimable</h3>
          </div>
          <p className="text-2xl font-bold">
            {claimableAmount ? formatUnits(claimableAmount, 18) : '0'}
          </p>
          <p className="text-sm text-gray-600">Your Share</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="font-semibold">Last Distribution</h3>
          </div>
          <p className="text-lg font-bold">
            {revenue?.lastDistribution ?
              new Date(Number(revenue.lastDistribution) * 1000).toLocaleDateString() :
              'No distributions yet'
            }
          </p>
          <Badge variant={revenue?.lastDistribution ? "default" : "secondary"} className="text-xs">
            {revenue?.lastDistribution ? "Distributed" : "Pending"}
          </Badge>
        </Card>
      </div>

      {/* Claim Revenue */}
      <ClaimRevenueCard
        claimableAmount={claimableAmount}
        balance={balance}
        onSuccess={() => {
          refetchClaimable()
          refetchRevenue()
        }}
      />

      {/* Revenue History */}
      <RevenueHistoryCard revenue={revenue} />
    </div>
  )
}

interface ClaimRevenueCardProps {
  claimableAmount?: bigint
  balance?: bigint
  onSuccess: () => void
}

function ClaimRevenueCard({ claimableAmount, balance, onSuccess }: ClaimRevenueCardProps) {
  const { claimRevenue, isPending, isConfirming, isConfirmed, error } = useClaimRevenue()

  const handleClaim = () => {
    claimRevenue()
  }

  const hasClaimableAmount = claimableAmount && claimableAmount > 0n
  const hasTokens = balance && balance > 0n

  if (!hasTokens) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
          <h3 className="text-lg font-semibold mb-2">No Tokens Owned</h3>
          <p className="text-gray-600">You need to own property tokens to receive revenue distributions.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">Claim Revenue</h3>
          <p className="text-gray-600">Claim your share of property revenue</p>
        </div>
        <Badge variant={hasClaimableAmount ? "default" : "secondary"}>
          {hasClaimableAmount ? "Available" : "Nothing to Claim"}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Token Holdings */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Your Token Holdings:</span>
            <span className="font-semibold">{balance ? formatUnits(balance, 18) : '0'} tokens</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Claimable Revenue:</span>
            <span className="font-bold text-green-600">
              {claimableAmount ? formatUnits(claimableAmount, 18) : '0'} HBAR
            </span>
          </div>
        </div>

        {/* Revenue Calculation */}
        {hasClaimableAmount && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Revenue Breakdown</h4>
            <div className="space-y-1 text-sm text-green-800">
              <div className="flex justify-between">
                <span>Revenue per token:</span>
                <span>{claimableAmount && balance ? formatUnits(claimableAmount * BigInt(10**18) / balance, 18) : '0'} HBAR</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Your total claim:</span>
                <span>{claimableAmount ? formatUnits(claimableAmount, 18) : '0'} HBAR</span>
              </div>
            </div>
          </div>
        )}

        {/* Claim Button */}
        <Button
          onClick={handleClaim}
          disabled={!hasClaimableAmount || isPending || isConfirming}
          className="w-full gap-2"
          size="lg"
        >
          <DollarSign className="h-4 w-4" />
          {isPending ? 'Confirming...' :
           isConfirming ? 'Claiming...' :
           hasClaimableAmount ? 'Claim Revenue' : 'No Revenue to Claim'}
        </Button>

        {/* Transaction Status */}
        {isConfirmed && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Revenue claimed successfully!</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Claim failed. Please try again.</span>
          </div>
        )}

        {/* Information */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Revenue is distributed proportionally based on token ownership</p>
          <p>• Claimed revenue is automatically transferred to your wallet</p>
          <p>• New revenue distributions update your claimable amount automatically</p>
        </div>
      </div>
    </Card>
  )
}

interface RevenueHistoryCardProps {
  revenue?: {
    totalRevenue: bigint
    distributedRevenue: bigint
    revenuePerToken: bigint
    lastDistribution: bigint
  } | null
}

function RevenueHistoryCard({ revenue }: RevenueHistoryCardProps) {
  if (!revenue || revenue.totalRevenue === 0n) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue History</h3>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No revenue distributions yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Revenue history will appear here once property starts generating income
          </p>
        </div>
      </Card>
    )
  }

  const distributionPercentage = revenue.totalRevenue > 0n
    ? Number((revenue.distributedRevenue * BigInt(100)) / revenue.totalRevenue)
    : 0

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Revenue Summary</h3>

      <div className="space-y-4">
        {/* Distribution Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Distribution Progress</span>
            <span className="text-sm text-gray-600">{distributionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${distributionPercentage}%` }}
            />
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Generated</p>
            <p className="font-semibold">{formatUnits(revenue.totalRevenue, 18)} HBAR</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Distributed</p>
            <p className="font-semibold">{formatUnits(revenue.distributedRevenue, 18)} HBAR</p>
          </div>
        </div>

        {/* Last Distribution Details */}
        {revenue.lastDistribution > 0n && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Latest Distribution</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{new Date(Number(revenue.lastDistribution) * 1000).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rate per Token:</span>
                <span>{formatUnits(revenue.revenuePerToken, 18)} HBAR</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}