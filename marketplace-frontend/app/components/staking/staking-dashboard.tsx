"use client"

import { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { formatUnits, parseUnits } from 'viem'
import { useAccount } from 'wagmi'
import {
  useStakingInfo,
  useStakingRewards,
  useStakeTokens,
  useUnstakeTokens
} from '@/app/lib/web3/hooks/use-token-handler'
import { useTokenBalance } from '@/app/lib/web3/hooks/use-property-token'
import { Lock, Unlock, TrendingUp, Clock, Coins, AlertCircle, CheckCircle } from 'lucide-react'

export function StakingDashboard() {
  const { address, isConnected } = useAccount()
  const { stakingInfo, refetch: refetchStakingInfo } = useStakingInfo(address)
  const { rewards } = useStakingRewards(address)
  const { balance } = useTokenBalance(address)

  if (!isConnected) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Connect your wallet to start staking</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Staking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Lock className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold">Staked Tokens</h3>
          </div>
          <p className="text-2xl font-bold">
            {stakingInfo?.stakedAmount ? formatUnits(stakingInfo.stakedAmount, 18) : '0'}
          </p>
          <p className="text-sm text-gray-600">Total Staked</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold">Pending Rewards</h3>
          </div>
          <p className="text-2xl font-bold">
            {rewards ? formatUnits(rewards, 18) : '0'}
          </p>
          <p className="text-sm text-gray-600">Claimable Now</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Coins className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold">Total Rewards</h3>
          </div>
          <p className="text-2xl font-bold">
            {stakingInfo?.totalRewards ? formatUnits(stakingInfo.totalRewards, 18) : '0'}
          </p>
          <p className="text-sm text-gray-600">Lifetime Earned</p>
        </Card>
      </div>

      {/* Staking Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StakeTokensCard balance={balance} onSuccess={() => refetchStakingInfo()} />
        <UnstakeTokensCard
          stakingInfo={stakingInfo}
          onSuccess={() => refetchStakingInfo()}
        />
      </div>

      {/* Staking Information */}
      <StakingInfoCard stakingInfo={stakingInfo} />
    </div>
  )
}

interface StakeTokensCardProps {
  balance?: bigint
  onSuccess: () => void
}

function StakeTokensCard({ balance, onSuccess }: StakeTokensCardProps) {
  const [stakeAmount, setStakeAmount] = useState('')
  const { stakeTokens, isPending, isConfirming, isConfirmed, error } = useStakeTokens()

  const handleStake = () => {
    if (!stakeAmount) return

    try {
      const amount = parseUnits(stakeAmount, 18)
      stakeTokens(amount)
    } catch (err) {
      console.error('Error staking tokens:', err)
    }
  }

  const setMaxAmount = () => {
    if (balance) {
      setStakeAmount(formatUnits(balance, 18))
    }
  }

  const isValidAmount = () => {
    if (!stakeAmount || !balance) return false
    try {
      const amount = parseUnits(stakeAmount, 18)
      return amount > 0n && amount <= balance
    } catch {
      return false
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Stake Tokens</h3>
        <p className="text-gray-600 text-sm">
          Stake your tokens to earn rewards. Current APY: 5.00%
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Amount to Stake
            </label>
            <button
              onClick={setMaxAmount}
              className="text-xs text-blue-600 hover:text-blue-800"
              type="button"
            >
              MAX
            </button>
          </div>
          <Input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="Enter amount"
            min="0"
            step="0.000000000000000001"
          />
          <p className="text-xs text-gray-500 mt-1">
            Available: {balance ? formatUnits(balance, 18) : '0'} tokens
          </p>
        </div>

        <Button
          onClick={handleStake}
          disabled={!stakeAmount || !isValidAmount() || isPending || isConfirming}
          className="w-full gap-2"
        >
          <Lock className="h-4 w-4" />
          {isPending ? 'Confirming...' :
           isConfirming ? 'Staking...' :
           'Stake Tokens'}
        </Button>

        {isConfirmed && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Tokens staked successfully!</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Staking failed. Please try again.</span>
          </div>
        )}
      </div>
    </Card>
  )
}

interface UnstakeTokensCardProps {
  stakingInfo?: {
    stakedAmount: bigint
    stakeTime: bigint
    lastRewardClaim: bigint
    totalRewards: bigint
  } | null
  onSuccess: () => void
}

function UnstakeTokensCard({ stakingInfo, onSuccess }: UnstakeTokensCardProps) {
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const { unstakeTokens, isPending, isConfirming, isConfirmed, error } = useUnstakeTokens()

  const handleUnstake = () => {
    if (!unstakeAmount) return

    try {
      const amount = parseUnits(unstakeAmount, 18)
      unstakeTokens(amount)
    } catch (err) {
      console.error('Error unstaking tokens:', err)
    }
  }

  const setMaxAmount = () => {
    if (stakingInfo?.stakedAmount) {
      setUnstakeAmount(formatUnits(stakingInfo.stakedAmount, 18))
    }
  }

  const isValidAmount = () => {
    if (!unstakeAmount || !stakingInfo?.stakedAmount) return false
    try {
      const amount = parseUnits(unstakeAmount, 18)
      return amount > 0n && amount <= stakingInfo.stakedAmount
    } catch {
      return false
    }
  }

  const canUnstake = () => {
    if (!stakingInfo) return false
    const now = BigInt(Math.floor(Date.now() / 1000))
    const minStakingPeriod = BigInt(30 * 24 * 60 * 60) // 30 days in seconds
    return now >= stakingInfo.stakeTime + minStakingPeriod
  }

  const timeUntilUnlock = () => {
    if (!stakingInfo) return 0
    const now = BigInt(Math.floor(Date.now() / 1000))
    const minStakingPeriod = BigInt(30 * 24 * 60 * 60) // 30 days
    const unlockTime = stakingInfo.stakeTime + minStakingPeriod
    return unlockTime > now ? Number(unlockTime - now) : 0
  }

  const formatTimeRemaining = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60))
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
    return `${days}d ${hours}h`
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Unstake Tokens</h3>
        <p className="text-gray-600 text-sm">
          Unstake your tokens and claim any pending rewards
        </p>
      </div>

      {!canUnstake() && stakingInfo?.stakedAmount && stakingInfo.stakedAmount > 0n && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-orange-800">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Minimum staking period: 30 days</span>
          </div>
          <p className="text-orange-700 text-xs mt-1">
            Time remaining: {formatTimeRemaining(timeUntilUnlock())}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Amount to Unstake
            </label>
            <button
              onClick={setMaxAmount}
              className="text-xs text-blue-600 hover:text-blue-800"
              type="button"
              disabled={!stakingInfo?.stakedAmount}
            >
              MAX
            </button>
          </div>
          <Input
            type="number"
            value={unstakeAmount}
            onChange={(e) => setUnstakeAmount(e.target.value)}
            placeholder="Enter amount"
            min="0"
            step="0.000000000000000001"
            disabled={!canUnstake()}
          />
          <p className="text-xs text-gray-500 mt-1">
            Staked: {stakingInfo?.stakedAmount ? formatUnits(stakingInfo.stakedAmount, 18) : '0'} tokens
          </p>
        </div>

        <Button
          onClick={handleUnstake}
          disabled={!unstakeAmount || !isValidAmount() || !canUnstake() || isPending || isConfirming}
          className="w-full gap-2"
        >
          <Unlock className="h-4 w-4" />
          {isPending ? 'Confirming...' :
           isConfirming ? 'Unstaking...' :
           'Unstake Tokens'}
        </Button>

        {isConfirmed && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Tokens unstaked successfully!</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Unstaking failed. Please try again.</span>
          </div>
        )}
      </div>
    </Card>
  )
}

interface StakingInfoCardProps {
  stakingInfo?: {
    stakedAmount: bigint
    stakeTime: bigint
    lastRewardClaim: bigint
    totalRewards: bigint
  } | null
}

function StakingInfoCard({ stakingInfo }: StakingInfoCardProps) {
  if (!stakingInfo || stakingInfo.stakedAmount === 0n) {
    return null
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Staking Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Stake Date</p>
          <p className="font-medium">
            {new Date(Number(stakingInfo.stakeTime) * 1000).toLocaleDateString()}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Last Reward Claim</p>
          <p className="font-medium">
            {new Date(Number(stakingInfo.lastRewardClaim) * 1000).toLocaleDateString()}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Staking Duration</p>
          <p className="font-medium">
            {Math.floor((Date.now() / 1000 - Number(stakingInfo.stakeTime)) / (24 * 60 * 60))} days
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Current APY</p>
          <div className="flex items-center gap-1">
            <p className="font-medium text-green-600">5.00%</p>
            <Badge variant="secondary" className="text-xs">
              Active
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  )
}