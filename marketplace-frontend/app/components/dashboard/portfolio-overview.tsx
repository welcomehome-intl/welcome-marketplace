"use client"

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { formatUnits, Address } from 'viem'
import { useAccount } from 'wagmi'
import { useUserPortfolio, useUserProperties, useUserBalance } from '@/app/lib/web3/hooks/use-ownership-registry'
import { useAutoFetchProperties } from '@/app/lib/web3/hooks/use-auto-fetch-properties'
import { usePropertyTokenBalance } from '@/app/lib/web3/hooks/use-property-token-balance'
import {
  DollarSign,
  TrendingUp,
  Building2,
  Coins,
  Wallet,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface PropertyHolding {
  propertyId: number
  propertyName: string
  propertyLocation: string
  symbol: string
  balance: string
  balanceFormatted: string
  pricePerToken: string
  value: string
  percentage: number
  lastUpdated: Date
  imageUrl: string
}

// Default placeholder image
const DEFAULT_PROPERTY_IMAGE = '/images/properties/placeholder.jpg'

export function PortfolioOverview() {
  const [holdings, setHoldings] = useState<PropertyHolding[]>([])
  const [totalValue, setTotalValue] = useState('0')
  const [dailyChange, setDailyChange] = useState({ amount: '0', percentage: '0', isPositive: true })
  const [isLoadingHoldings, setIsLoadingHoldings] = useState(false)

  const { address, isConnected } = useAccount()
  const { portfolio, refetch: refetchPortfolio } = useUserPortfolio(address)
  const { propertyIds } = useUserProperties(address)
  const { properties: allProperties, isLoading: propertiesLoading } = useAutoFetchProperties()

  // Component to fetch real balance for a single property
  function PropertyBalance({ propertyId, propertyInfo }: { propertyId: number, propertyInfo: any }) {
    const { balance, balanceFormatted } = usePropertyTokenBalance({
      tokenAddress: propertyInfo.tokenContract as Address,
      userAddress: address,
      enabled: !!propertyInfo.tokenContract && !!address
    })

    useEffect(() => {
      if (!balance || !propertyInfo) return

      const pricePerToken = propertyInfo.pricePerTokenFormatted || '0'
      const value = (parseFloat(balanceFormatted) * parseFloat(pricePerToken)).toFixed(2)

      // Only add to holdings if user has a balance > 0
      if (parseFloat(balanceFormatted) > 0) {
        setHoldings(prev => {
          const existing = prev.find(h => h.propertyId === propertyId)
          if (existing) {
            // Update existing
            return prev.map(h => h.propertyId === propertyId ? {
              ...h,
              balance: balance.toString(),
              balanceFormatted,
              value,
            } : h)
          } else {
            // Add new
            return [...prev, {
              propertyId,
              propertyName: propertyInfo.name,
              propertyLocation: propertyInfo.location,
              symbol: propertyInfo.symbol,
              balance: balance.toString(),
              balanceFormatted,
              pricePerToken,
              value,
              percentage: 0,
              lastUpdated: new Date(Number(propertyInfo.createdAt) * 1000),
              imageUrl: propertyInfo.images && propertyInfo.images.length > 0
                ? propertyInfo.images[0]
                : DEFAULT_PROPERTY_IMAGE
            }]
          }
        })
      }
    }, [balance, balanceFormatted, propertyInfo, propertyId])

    return null // This is a data-fetching component, no UI
  }

  // Calculate totals and percentages when holdings change
  useEffect(() => {
    if (holdings.length === 0) {
      setTotalValue('0')
      return
    }

    const total = holdings.reduce((sum, h) => sum + parseFloat(h.value), 0)
    setTotalValue(total.toFixed(2))

    // Calculate percentages
    setHoldings(prev => prev.map(h => ({
      ...h,
      percentage: total > 0 ? (parseFloat(h.value) / total) * 100 : 0
    })))

    // Calculate daily change (2% mock for now - would track historical prices)
    setDailyChange({
      amount: (total * 0.021).toFixed(2),
      percentage: "2.1",
      isPositive: true
    })
  }, [holdings.length])

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600">Connect your wallet to view your property portfolio</p>
        </CardContent>
      </Card>
    )
  }

  if (propertiesLoading || isLoadingHoldings) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-2xl" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasInvestments = holdings.length > 0

  return (
    <div className="space-y-6">
      {/* Hidden data-fetching components for real balances */}
      {allProperties && allProperties.map((property) => (
        <PropertyBalance
          key={property.id}
          propertyId={property.id}
          propertyInfo={property}
        />
      ))}

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">{totalValue} HBAR</p>
                <div className={`flex items-center gap-1 text-sm ${
                  dailyChange.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {dailyChange.isPositive ?
                    <ArrowUpRight className="h-3 w-3" /> :
                    <ArrowDownRight className="h-3 w-3" />
                  }
                  <span>+{dailyChange.amount} ({dailyChange.percentage}%)</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Properties</p>
                <p className="text-2xl font-bold">{portfolio?.totalProperties.toString() || '0'}</p>
                <p className="text-sm text-gray-500">Active investments</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tokens</p>
                <p className="text-2xl font-bold">
                  {portfolio ? formatUnits(portfolio.totalTokens, 18).split('.')[0] : '0'}
                </p>
                <p className="text-sm text-gray-500">Across all properties</p>
              </div>
              <Coins className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Ownership</p>
                <p className="text-2xl font-bold">
                  {hasInvestments ? (100 / holdings.length).toFixed(1) : '0'}%
                </p>
                <p className="text-sm text-gray-500">Per property</p>
              </div>
              <PieChart className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Holdings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              My Property Investments
            </div>
            {hasInvestments && (
              <Badge variant="outline">{holdings.length} {holdings.length === 1 ? 'property' : 'properties'}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasInvestments ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No Properties Yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't invested in any properties. Browse the marketplace to get started with fractional real estate ownership.
              </p>
              <Button onClick={() => window.location.href = '/marketplace'} size="lg">
                Browse Properties
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {holdings.map((holding) => {
                // Get full property info from allProperties
                const propertyInfo = allProperties?.find(p => p.id === holding.propertyId)

                return (
                  <Card key={holding.propertyId} className="group overflow-hidden rounded-2xl border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 hover:shadow-xl">
                    {/* Property Image */}
                    <div className="relative h-56 overflow-hidden cursor-pointer" onClick={() => window.location.href = `/property/${holding.propertyId}`}>
                      <Image
                        src={holding.imageUrl}
                        alt={holding.propertyName}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_PROPERTY_IMAGE
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                      {/* Badge on Image */}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-white/95 text-gray-900 backdrop-blur-sm font-bold">
                          {holding.symbol}
                        </Badge>
                      </div>

                      {/* Percentage Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-blue-600/90 text-white backdrop-blur-sm">
                          {holding.percentage.toFixed(1)}% of portfolio
                        </Badge>
                      </div>

                      {/* Value on Image */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white font-bold text-3xl mb-1">{holding.value} HBAR</p>
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                          <Coins className="h-4 w-4" />
                          <span>{holding.balanceFormatted} tokens @ {holding.pricePerToken} HBAR each</span>
                        </div>
                      </div>
                    </div>

                    {/* Property Details */}
                    <CardContent className="p-5 bg-white">
                      <h4 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors">
                        {holding.propertyName}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {holding.propertyLocation}
                      </p>

                      {/* Property Stats */}
                      {propertyInfo && (
                        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-gray-500">Your Ownership</p>
                            <p className="font-semibold text-gray-900">
                              {((parseFloat(holding.balanceFormatted) / parseFloat(propertyInfo.totalSupplyFormatted)) * 100).toFixed(2)}%
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-gray-500">Tokens Sold</p>
                            <p className="font-semibold text-gray-900">
                              {propertyInfo.tokensSoldFormatted || '0'} / {propertyInfo.totalSupplyFormatted}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.location.href = `/property/${holding.propertyId}`}
                        >
                          <TrendingUp className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => window.location.href = `/property/${holding.propertyId}`}
                        >
                          <Coins className="h-4 w-4 mr-1" />
                          Buy More
                        </Button>
                      </div>

                      {/* Last Updated */}
                      <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Updated {holding.lastUpdated.toLocaleDateString()}
                        </span>
                        {propertyInfo?.isActive && (
                          <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {hasInvestments && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-16"
            onClick={() => window.location.href = '/marketplace'}
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <span>Browse More Properties</span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-16"
            onClick={refetchPortfolio}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span>Refresh Portfolio</span>
            </div>
          </Button>
        </div>
      )}
    </div>
  )
}
