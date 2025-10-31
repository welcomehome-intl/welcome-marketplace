"use client"

import { useState, useEffect, useCallback } from 'react'
import { usePublicClient, useAccount } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../config'
import { MARKETPLACE_ABI, PROPERTY_TOKEN_ABI } from '../abi'
import { Address, formatUnits } from 'viem'

export interface TokenMetrics {
  totalSupply: bigint
  circulatingSupply: bigint
  currentPrice: bigint
  marketCap: bigint
  totalStaked: bigint
  stakingAPY: number
  totalRevenue: bigint
  priceChange24h: number
  volumeChange24h: number
}

export interface PriceHistoryPoint {
  timestamp: number
  price: number
  volume: number
}

export interface TransactionVolume {
  period: string
  purchases: number
  sales: number
  stakes: number
  revenue: number
  totalVolume: number
}

export interface StakingMetrics {
  totalStaked: bigint
  totalStakers: number
  averageStake: bigint
  rewardsDistributed: bigint
  currentAPY: number
}

export function useTokenMetrics() {
  const [metrics, setMetrics] = useState<TokenMetrics>({
    totalSupply: BigInt(0),
    circulatingSupply: BigInt(0),
    currentPrice: BigInt(0),
    marketCap: BigInt(0),
    totalStaked: BigInt(0),
    stakingAPY: 5.0,
    totalRevenue: BigInt(0),
    priceChange24h: 0,
    volumeChange24h: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const publicClient = usePublicClient()

  const fetchMetrics = useCallback(async () => {
    if (!publicClient) return

    try {
      setIsLoading(true)
      setError(null)

      const [totalSupply, currentPrice, totalStaked] = await Promise.all([
        publicClient.readContract({
          address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
          abi: PROPERTY_TOKEN_ABI,
          functionName: 'totalSupply',
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESSES.PROPERTY_MANAGER as Address,
          abi: MARKETPLACE_ABI,
          functionName: 'getTokenPrice',
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESSES.PROPERTY_MANAGER as Address,
          abi: MARKETPLACE_ABI,
          functionName: 'totalStaked',
        }).catch(() => BigInt(0)), // Fallback if function doesn't exist
      ])

      const circulatingSupply = (totalSupply as bigint) - (totalStaked as bigint)
      const marketCap = (circulatingSupply * (currentPrice as bigint)) / BigInt(1e18)

      // Mock price changes (would be calculated from historical data)
      const priceChange24h = (Math.random() - 0.5) * 10 // Random between -5% and +5%
      const volumeChange24h = (Math.random() - 0.5) * 20 // Random between -10% and +10%

      setMetrics({
        totalSupply: totalSupply as bigint,
        circulatingSupply,
        currentPrice: currentPrice as bigint,
        marketCap,
        totalStaked: totalStaked as bigint,
        stakingAPY: 5.0, // Fixed APY
        totalRevenue: BigInt(0), // Would be fetched from revenue events
        priceChange24h,
        volumeChange24h,
      })
    } catch (err) {
      console.error('Error fetching token metrics:', err)
      setError('Failed to fetch token metrics')
    } finally {
      setIsLoading(false)
    }
  }, [publicClient])

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [fetchMetrics])

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchMetrics,
  }
}

export function usePriceHistory(timeframe: '24h' | '7d' | '30d' | '1y' = '7d') {
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Generate mock price history data
    // In a real implementation, this would fetch from on-chain events or external APIs
    const generateMockData = () => {
      const now = Date.now()
      const points: PriceHistoryPoint[] = []
      const basePrice = 5.4 // Starting price
      let currentPrice = basePrice

      const getTimePoints = () => {
        switch (timeframe) {
          case '24h':
            return { count: 24, interval: 60 * 60 * 1000 } // 1 hour intervals
          case '7d':
            return { count: 7, interval: 24 * 60 * 60 * 1000 } // 1 day intervals
          case '30d':
            return { count: 30, interval: 24 * 60 * 60 * 1000 } // 1 day intervals
          case '1y':
            return { count: 12, interval: 30 * 24 * 60 * 60 * 1000 } // 1 month intervals
          default:
            return { count: 7, interval: 24 * 60 * 60 * 1000 }
        }
      }

      const { count, interval } = getTimePoints()

      for (let i = count; i >= 0; i--) {
        const timestamp = now - (i * interval)
        // Add some realistic price movement
        const change = (Math.random() - 0.5) * 0.2 // Small price changes
        currentPrice = Math.max(0.1, currentPrice + change)

        points.push({
          timestamp,
          price: currentPrice,
          volume: Math.random() * 10000 + 1000, // Mock volume
        })
      }

      return points
    }

    setIsLoading(true)
    setTimeout(() => {
      setPriceHistory(generateMockData())
      setIsLoading(false)
    }, 500)
  }, [timeframe])

  return { priceHistory, isLoading }
}

export function useTransactionVolume(timeframe: '24h' | '7d' | '30d' = '7d') {
  const [volumeData, setVolumeData] = useState<TransactionVolume[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Generate mock volume data
    const generateVolumeData = () => {
      const data: TransactionVolume[] = []
      const periods = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : 30

      for (let i = 0; i < periods; i++) {
        const purchases = Math.floor(Math.random() * 100)
        const sales = Math.floor(Math.random() * 50)
        const stakes = Math.floor(Math.random() * 30)
        const revenue = Math.floor(Math.random() * 1000)

        data.push({
          period: timeframe === '24h' ? `${i}:00` : `Day ${i + 1}`,
          purchases,
          sales,
          stakes,
          revenue,
          totalVolume: purchases + sales + stakes,
        })
      }

      return data
    }

    setIsLoading(true)
    setTimeout(() => {
      setVolumeData(generateVolumeData())
      setIsLoading(false)
    }, 300)
  }, [timeframe])

  return { volumeData, isLoading }
}

export function useStakingMetrics() {
  const [stakingMetrics, setStakingMetrics] = useState<StakingMetrics>({
    totalStaked: BigInt(0),
    totalStakers: 0,
    averageStake: BigInt(0),
    rewardsDistributed: BigInt(0),
    currentAPY: 5.0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const publicClient = usePublicClient()

  const fetchStakingMetrics = useCallback(async () => {
    if (!publicClient) return

    try {
      setIsLoading(true)

      const totalStaked = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.PROPERTY_MANAGER as Address,
        abi: MARKETPLACE_ABI,
        functionName: 'totalStaked',
      }).catch(() => BigInt(0))

      // Mock data for other metrics (would be fetched from events in real implementation)
      const totalStakers = Math.floor(Math.random() * 100) + 10
      const averageStake = totalStakers > 0 ? (totalStaked as bigint) / BigInt(totalStakers) : BigInt(0)

      setStakingMetrics({
        totalStaked: totalStaked as bigint,
        totalStakers,
        averageStake,
        rewardsDistributed: BigInt(Math.floor(Math.random() * 10000) * 1e18),
        currentAPY: 5.0,
      })
    } catch (err) {
      console.error('Error fetching staking metrics:', err)
    } finally {
      setIsLoading(false)
    }
  }, [publicClient])

  useEffect(() => {
    fetchStakingMetrics()
    const interval = setInterval(fetchStakingMetrics, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [fetchStakingMetrics])

  return {
    stakingMetrics,
    isLoading,
    refetch: fetchStakingMetrics,
  }
}