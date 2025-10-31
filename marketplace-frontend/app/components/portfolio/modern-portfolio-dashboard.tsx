"use client"

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { useAccount } from 'wagmi'
import {
  useUserPortfolio,
  useUserProperties,
  usePropertyStats,
  useGlobalStats
} from '@/app/lib/web3/hooks/use-ownership-registry'
import { useUserKYCStatus } from '@/app/lib/web3/hooks/use-kyc-registry'
import { usePaymentTokenBalance } from '@/app/lib/web3/hooks/use-payment-token'
import { usePropertyFactory } from '@/app/lib/web3/hooks/use-property-factory'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  Coins,
  Wallet,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  AlertCircle,
  Info,
  Eye,
  Plus,
  Calendar,
  Percent,
  BarChart3,
  Clock,
  Users,
  ChevronRight,
  Star,
  Award
} from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { motion } from 'framer-motion'
import { formatUnits, formatEther, Address } from 'viem'

interface PropertyHolding {
  propertyId: number
  propertyInfo: any
  balance: bigint
  valueUSD: number
  percentageOfPortfolio: number
  percentageOfProperty: number
  annualYield: number
  monthlyRevenue: number
  totalReturns: number
  lastUpdated: bigint
}

interface PortfolioMetrics {
  totalValue: number
  totalProperties: number
  totalTokens: bigint
  avgReturn: number
  monthlyIncome: number
  totalReturns: number
  diversificationScore: number
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH'
  performanceChange24h: number
  performanceChange7d: number
  performanceChange30d: number
}

const RISK_COLORS = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800'
}

const PERFORMANCE_PERIODS = [
  { key: '24h', label: '24h', value: 'performanceChange24h' },
  { key: '7d', label: '7d', value: 'performanceChange7d' },
  { key: '30d', label: '30d', value: 'performanceChange30d' }
] as const

export function ModernPortfolioDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('24h')
  const [showDetailedView, setShowDetailedView] = useState(false)

  const { address, isConnected } = useAccount()

  // Blockchain data hooks
  const { portfolio, refetch: refetchPortfolio } = useUserPortfolio(address)
  const { propertyIds, refetch: refetchProperties } = useUserProperties(address)
  const { stats: globalStats } = useGlobalStats()
  const { isApproved: isKYCApproved, isAccredited, record: kycRecord } = useUserKYCStatus(address)
  const { balance: hbarBalance } = usePaymentTokenBalance(address)
  const { properties: allProperties } = usePropertyFactory()

  // Calculate portfolio metrics and holdings
  const { portfolioMetrics, holdings } = useMemo(() => {
    if (!portfolio || !propertyIds.length || !allProperties.length) {
      return {
        portfolioMetrics: null,
        holdings: []
      }
    }

    const calculatedHoldings: PropertyHolding[] = []
    let totalPortfolioValue = 0

    for (const propertyId of propertyIds) {
      const propertyIdNum = Number(propertyId)
      const propertyInfo = allProperties.find(p => p.id === propertyIdNum)

      if (propertyInfo) {
        // Mock calculations - in production these would come from real data
        const mockBalance = BigInt(Math.floor(Math.random() * 1000) + 100)
        const tokenValue = Number(formatUnits(propertyInfo.totalValue, 18)) / Number(formatUnits(propertyInfo.maxTokens, 18))
        const holdingValue = Number(formatUnits(mockBalance, 18)) * tokenValue
        const annualYield = 6.5 + Math.random() * 3 // 6.5-9.5%
        const monthlyRevenue = holdingValue * (annualYield / 100) / 12

        calculatedHoldings.push({
          propertyId: propertyIdNum,
          propertyInfo,
          balance: mockBalance,
          valueUSD: holdingValue,
          percentageOfPortfolio: 0, // Will be calculated after total
          percentageOfProperty: (Number(formatUnits(mockBalance, 18)) / Number(formatUnits(propertyInfo.maxTokens, 18))) * 100,
          annualYield,
          monthlyRevenue,
          totalReturns: holdingValue * (annualYield / 100) * 0.75, // Mock total returns
          lastUpdated: propertyInfo.createdAt
        })

        totalPortfolioValue += holdingValue
      }
    }

    // Calculate portfolio percentages
    calculatedHoldings.forEach(holding => {
      holding.percentageOfPortfolio = (holding.valueUSD / totalPortfolioValue) * 100
    })

    // Calculate portfolio metrics
    const metrics: PortfolioMetrics = {
      totalValue: totalPortfolioValue,
      totalProperties: calculatedHoldings.length,
      totalTokens: portfolio.totalTokens,
      avgReturn: calculatedHoldings.reduce((sum, h) => sum + h.annualYield, 0) / calculatedHoldings.length || 0,
      monthlyIncome: calculatedHoldings.reduce((sum, h) => sum + h.monthlyRevenue, 0),
      totalReturns: calculatedHoldings.reduce((sum, h) => sum + h.totalReturns, 0),
      diversificationScore: Math.min(100, calculatedHoldings.length * 20), // Simple diversification score
      riskScore: calculatedHoldings.length > 5 ? 'LOW' : calculatedHoldings.length > 2 ? 'MEDIUM' : 'HIGH',
      performanceChange24h: -0.5 + Math.random() * 3, // Mock performance data
      performanceChange7d: -2 + Math.random() * 8,
      performanceChange30d: -5 + Math.random() * 15
    }

    return {
      portfolioMetrics: metrics,
      holdings: calculatedHoldings
    }
  }, [portfolio, propertyIds, allProperties])

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <Card className="p-8">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Wallet className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-gray-600 mb-6">Connect your wallet to view your property investment portfolio</p>
            <Button className="bg-teal-600 hover:bg-teal-700">
              Connect Wallet
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!isKYCApproved) {
    return (
      <div className="space-y-6">
        <Card className="p-8">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Complete KYC Verification</h3>
            <p className="text-gray-600 mb-6">You need to complete KYC verification to view your investment portfolio</p>
            <Button className="bg-teal-600 hover:bg-teal-700">
              Start KYC Process
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const hasInvestments = holdings.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investment Portfolio</h1>
          <p className="text-gray-600">Track and manage your real estate investments</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className={cn(
              "h-4 w-4",
              isAccredited ? "text-green-500" : "text-orange-500"
            )} />
            <span className="text-sm text-gray-600">
              {isAccredited ? 'Accredited Investor' : 'Retail Investor'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetailedView(!showDetailedView)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showDetailedView ? 'Simple View' : 'Detailed View'}
          </Button>
        </div>
      </div>

      {!hasInvestments ? (
        // Empty State
        <Card className="p-12">
          <div className="text-center">
            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Start Your Investment Journey</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't invested in any properties yet. Browse our curated selection of tokenized real estate to get started.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Building2 className="h-4 w-4 mr-2" />
                Browse Properties
              </Button>
              <Button variant="outline">
                <Info className="h-4 w-4 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Portfolio Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Portfolio Value */}
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1 text-blue-100">
                    {portfolioMetrics && portfolioMetrics[PERFORMANCE_PERIODS.find(p => p.key === selectedPeriod)?.value || 'performanceChange24h'] > 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    <span className="text-sm">
                      {portfolioMetrics && portfolioMetrics[PERFORMANCE_PERIODS.find(p => p.key === selectedPeriod)?.value || 'performanceChange24h'].toFixed(2)}%
                    </span>
                  </div>
                </div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Portfolio Value</p>
                <h2 className="text-3xl font-bold mb-2">
                  ${portfolioMetrics?.totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '0'}
                </h2>
                <p className="text-blue-100 text-sm">
                  Across {portfolioMetrics?.totalProperties || 0} properties
                </p>
              </CardContent>
            </Card>

            {/* Monthly Income */}
            <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-500/20 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <Award className="h-4 w-4 text-green-200" />
                </div>
                <p className="text-green-100 text-sm font-medium mb-1">Monthly Income</p>
                <h2 className="text-3xl font-bold mb-2">
                  ${portfolioMetrics?.monthlyIncome.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '0'}
                </h2>
                <p className="text-green-100 text-sm">
                  {portfolioMetrics?.avgReturn.toFixed(1) || '0'}% avg. annual yield
                </p>
              </CardContent>
            </Card>

            {/* Total Tokens */}
            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-500/20 p-3 rounded-lg">
                    <Coins className="h-6 w-6" />
                  </div>
                  <BarChart3 className="h-4 w-4 text-purple-200" />
                </div>
                <p className="text-purple-100 text-sm font-medium mb-1">Total Tokens Owned</p>
                <h2 className="text-3xl font-bold mb-2">
                  {portfolioMetrics ? Number(formatUnits(portfolioMetrics.totalTokens, 18)).toLocaleString('en-US', { maximumFractionDigits: 0 }) : '0'}
                </h2>
                <p className="text-purple-100 text-sm">
                  Diversified across portfolio
                </p>
              </CardContent>
            </Card>

            {/* Risk Score */}
            <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-500/20 p-3 rounded-lg">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div className="text-right text-orange-100 text-sm">
                    {portfolioMetrics?.diversificationScore || 0}/100
                  </div>
                </div>
                <p className="text-orange-100 text-sm font-medium mb-1">Risk Profile</p>
                <h2 className="text-3xl font-bold mb-2">
                  {portfolioMetrics?.riskScore || 'N/A'}
                </h2>
                <p className="text-orange-100 text-sm">
                  Diversification score
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Period Selector */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Performance Analysis</h3>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {PERFORMANCE_PERIODS.map((period) => (
                <button
                  key={period.key}
                  onClick={() => setSelectedPeriod(period.key)}
                  className={cn(
                    "px-3 py-1 rounded text-sm font-medium transition-colors",
                    selectedPeriod === period.key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Property Holdings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Property Holdings
                </div>
                <Badge variant="outline">{holdings.length} properties</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {holdings.map((holding) => (
                  <motion.div
                    key={holding.propertyId}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-all bg-gradient-to-r from-white to-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      {/* Property Info */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-blue-100 rounded-xl flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-teal-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">{holding.propertyInfo.name}</h4>
                          <p className="text-sm text-gray-600">{holding.propertyInfo.location}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {holding.propertyInfo.symbol}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {holding.percentageOfProperty.toFixed(2)}% ownership
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="text-right">
                        <div className="flex items-center gap-4 mb-2">
                          <div>
                            <p className="text-2xl font-bold">${holding.valueUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                            <p className="text-sm text-gray-500">{holding.percentageOfPortfolio.toFixed(1)}% of portfolio</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              <Percent className="h-3 w-3 text-green-500" />
                              <span className="text-sm font-medium text-green-600">
                                {holding.annualYield.toFixed(1)}% APY
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              ${holding.monthlyRevenue.toFixed(0)}/month
                            </p>
                          </div>
                        </div>

                        {showDetailedView && (
                          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Tokens Owned</p>
                              <p className="font-semibold">{Number(formatUnits(holding.balance, 18)).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Total Returns</p>
                              <p className="font-semibold text-green-600">+${holding.totalReturns.toFixed(0)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar for Ownership Percentage */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Portfolio Allocation</span>
                        <span className="text-xs text-gray-500">{holding.percentageOfPortfolio.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, holding.percentageOfPortfolio)}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Insights */}
          {portfolioMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Diversification Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Diversification Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Diversification Score</span>
                      <Badge className={RISK_COLORS[portfolioMetrics.riskScore]}>
                        {portfolioMetrics.diversificationScore}/100
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Property Count</span>
                          <span className="font-medium">{portfolioMetrics.totalProperties}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, portfolioMetrics.totalProperties * 10)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Risk Level</span>
                          <span className={cn(
                            "font-medium text-xs px-2 py-1 rounded",
                            RISK_COLORS[portfolioMetrics.riskScore]
                          )}>
                            {portfolioMetrics.riskScore}
                          </span>
                        </div>
                      </div>
                    </div>

                    {portfolioMetrics.riskScore === 'HIGH' && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-orange-900">Consider Diversifying</p>
                            <p className="text-xs text-orange-800 mt-1">
                              Investing in more properties can help reduce portfolio risk.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Investment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Investment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Total Returns</p>
                        <p className="text-lg font-bold text-green-600">
                          +${portfolioMetrics.totalReturns.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </p>
                      </div>

                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Avg. Yield</p>
                        <p className="text-lg font-bold text-blue-600">
                          {portfolioMetrics.avgReturn.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">HBAR Balance</span>
                        <span className="font-medium">
                          {hbarBalance ? Number(formatUnits(hbarBalance, 18)).toFixed(2) : '0'} HBAR
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Available for Investment</span>
                        <Badge variant="outline" className="text-xs">
                          {isAccredited ? 'Accredited' : 'Retail'} Limits Apply
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 group hover:bg-teal-50 hover:border-teal-200">
              <div className="text-center">
                <Plus className="h-5 w-5 mx-auto mb-1 group-hover:text-teal-600" />
                <span className="text-sm">Invest More</span>
              </div>
            </Button>

            <Button variant="outline" className="h-16 group hover:bg-blue-50 hover:border-blue-200">
              <div className="text-center">
                <BarChart3 className="h-5 w-5 mx-auto mb-1 group-hover:text-blue-600" />
                <span className="text-sm">Analytics</span>
              </div>
            </Button>

            <Button variant="outline" className="h-16 group hover:bg-green-50 hover:border-green-200">
              <div className="text-center">
                <DollarSign className="h-5 w-5 mx-auto mb-1 group-hover:text-green-600" />
                <span className="text-sm">Claim Revenue</span>
              </div>
            </Button>

            <Button variant="outline" className="h-16 group hover:bg-purple-50 hover:border-purple-200">
              <div className="text-center">
                <Users className="h-5 w-5 mx-auto mb-1 group-hover:text-purple-600" />
                <span className="text-sm">Marketplace</span>
              </div>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}