"use client"

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { useAccount } from 'wagmi'
import { usePropertyStats } from '@/app/lib/web3/hooks/use-ownership-registry'
import { usePropertyFactory, PropertyType } from '@/app/lib/web3/hooks/use-property-factory'
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Star,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap
} from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { motion } from 'framer-motion'
import { formatUnits, Address } from 'viem'

interface PropertyMetrics {
  propertyId: number
  name: string
  location: string
  symbol: string
  totalValue: bigint
  maxTokens: bigint
  currentPrice: number
  priceChange24h: number
  priceChange7d: number
  priceChange30d: number
  volume24h: number
  marketCap: number
  totalHolders: number
  averageHolding: bigint
  liquidityScore: number
  performanceScore: number
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH'
  occupancyRate: number
  annualYield: number
  monthlyRevenue: number
  totalRevenue: number
  propertyType: PropertyType
  isActive: boolean
  createdAt: Date
}

interface MarketData {
  timestamp: Date
  price: number
  volume: number
  holders: number
}

const PROPERTY_TYPES = {
  [PropertyType.RESIDENTIAL]: { label: 'Residential', color: 'bg-blue-100 text-blue-800' },
  [PropertyType.COMMERCIAL]: { label: 'Commercial', color: 'bg-purple-100 text-purple-800' },
  [PropertyType.INDUSTRIAL]: { label: 'Industrial', color: 'bg-orange-100 text-orange-800' },
  [PropertyType.MIXED_USE]: { label: 'Mixed Use', color: 'bg-green-100 text-green-800' },
  [PropertyType.LAND]: { label: 'Land', color: 'bg-yellow-100 text-yellow-800' },
}

const RISK_COLORS = {
  LOW: 'text-green-600 bg-green-50',
  MEDIUM: 'text-orange-600 bg-orange-50',
  HIGH: 'text-red-600 bg-red-50'
}

const TIME_PERIODS = [
  { key: '24h', label: '24H', days: 1 },
  { key: '7d', label: '7D', days: 7 },
  { key: '30d', label: '30D', days: 30 },
  { key: '90d', label: '90D', days: 90 }
] as const

export function PropertyAnalyticsDashboard({ propertyId }: { propertyId: number }) {
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d' | '90d'>('7d')
  const [activeTab, setActiveTab] = useState('overview')

  const { address } = useAccount()
  const { stats } = usePropertyStats(propertyId)
  const { properties } = usePropertyFactory()

  // Generate mock comprehensive property metrics
  const propertyMetrics = useMemo((): PropertyMetrics | null => {
    const property = properties.find(p => p.id === propertyId)
    if (!property) return null

    const basePrice = Number(formatUnits(property.totalValue, 18)) / Number(formatUnits(property.maxTokens, 18))
    const priceVariation = Math.random() * 0.1 - 0.05 // ±5%

    return {
      propertyId,
      name: property.name,
      location: property.location,
      symbol: property.symbol,
      totalValue: property.totalValue,
      maxTokens: property.maxTokens,
      currentPrice: basePrice * (1 + priceVariation),
      priceChange24h: -0.5 + Math.random() * 3,
      priceChange7d: -2 + Math.random() * 6,
      priceChange30d: -5 + Math.random() * 15,
      volume24h: Math.random() * 50000,
      marketCap: Number(formatUnits(property.totalValue, 18)),
      totalHolders: stats?.totalHolders ? Number(stats.totalHolders) : Math.floor(Math.random() * 500) + 50,
      averageHolding: stats?.averageHolding || BigInt(Math.floor(Math.random() * 10000) + 1000),
      liquidityScore: 65 + Math.random() * 30,
      performanceScore: 70 + Math.random() * 25,
      riskScore: Math.random() > 0.7 ? 'HIGH' : Math.random() > 0.3 ? 'MEDIUM' : 'LOW',
      occupancyRate: 85 + Math.random() * 12,
      annualYield: 6.5 + Math.random() * 3,
      monthlyRevenue: (Number(formatUnits(property.totalValue, 18)) * (6.5 + Math.random() * 3)) / 100 / 12,
      totalRevenue: (Number(formatUnits(property.totalValue, 18)) * (6.5 + Math.random() * 3)) / 100 * 0.75,
      propertyType: property.propertyType,
      isActive: property.isActive,
      createdAt: new Date(Number(property.createdAt) * 1000)
    }
  }, [propertyId, properties, stats])

  // Generate mock historical data
  const historicalData = useMemo((): MarketData[] => {
    if (!propertyMetrics) return []

    const days = TIME_PERIODS.find(p => p.key === selectedPeriod)?.days || 7
    const data: MarketData[] = []
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)

      data.push({
        timestamp: date,
        price: propertyMetrics.currentPrice * (0.95 + Math.random() * 0.1),
        volume: propertyMetrics.volume24h * (0.5 + Math.random()),
        holders: propertyMetrics.totalHolders + Math.floor(Math.random() * 10) - 5
      })
    }

    return data
  }, [propertyMetrics, selectedPeriod])

  if (!propertyMetrics) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Property Not Found</h3>
          <p className="text-gray-600">The requested property could not be found.</p>
        </div>
      </Card>
    )
  }

  const getPriceChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getPriceChangeIcon = (change: number) => {
    return change >= 0 ? ArrowUpRight : ArrowDownRight
  }

  return (
    <div className="space-y-6">
      {/* Property Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{propertyMetrics.name}</h1>
            <Badge className={PROPERTY_TYPES[propertyMetrics.propertyType].color}>
              {PROPERTY_TYPES[propertyMetrics.propertyType].label}
            </Badge>
            <Badge variant={propertyMetrics.isActive ? "default" : "secondary"}>
              {propertyMetrics.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{propertyMetrics.location}</span>
            <span className="text-gray-400">•</span>
            <span className="font-mono text-sm">{propertyMetrics.symbol}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl font-bold">${propertyMetrics.currentPrice.toFixed(2)}</span>
            <div className={cn("flex items-center gap-1", getPriceChangeColor(propertyMetrics[`priceChange${selectedPeriod}` as keyof PropertyMetrics] as number))}>
              {(() => {
                const Icon = getPriceChangeIcon(propertyMetrics[`priceChange${selectedPeriod}` as keyof PropertyMetrics] as number)
                return <Icon className="h-4 w-4" />
              })()}
              <span className="font-medium">
                {(propertyMetrics[`priceChange${selectedPeriod}` as keyof PropertyMetrics] as number).toFixed(2)}%
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600">per token • {selectedPeriod}</p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Market Cap</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${propertyMetrics.marketCap.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-sm text-blue-600">
                  {Number(formatUnits(propertyMetrics.maxTokens, 18)).toLocaleString()} tokens
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Holders</p>
                <p className="text-2xl font-bold text-green-900">{propertyMetrics.totalHolders}</p>
                <p className="text-sm text-green-600">
                  Avg: {Number(formatUnits(propertyMetrics.averageHolding, 18)).toLocaleString()} tokens
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">24h Volume</p>
                <p className="text-2xl font-bold text-purple-900">
                  ${propertyMetrics.volume24h.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-sm text-purple-600">Trading activity</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Annual Yield</p>
                <p className="text-2xl font-bold text-orange-900">{propertyMetrics.annualYield.toFixed(1)}%</p>
                <p className="text-sm text-orange-600">
                  ${propertyMetrics.monthlyRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}/month
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Detailed Analytics</h3>
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          {TIME_PERIODS.map((period) => (
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

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="holders">Holders</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Property Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Occupancy Rate</span>
                    </div>
                    <p className="text-xl font-bold">{propertyMetrics.occupancyRate.toFixed(1)}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${propertyMetrics.occupancyRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Performance Score</span>
                    </div>
                    <p className="text-xl font-bold">{propertyMetrics.performanceScore.toFixed(0)}/100</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${propertyMetrics.performanceScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Liquidity Score</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{propertyMetrics.liquidityScore.toFixed(0)}/100</span>
                      <Badge variant="outline" className="text-xs">
                        {propertyMetrics.liquidityScore > 80 ? 'High' :
                         propertyMetrics.liquidityScore > 60 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Risk Level</span>
                    <Badge className={RISK_COLORS[propertyMetrics.riskScore]}>
                      {propertyMetrics.riskScore}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Launch Date</span>
                    <span className="font-medium">{propertyMetrics.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      {propertyMetrics.priceChange7d >= 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">Price Trend</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {propertyMetrics.priceChange7d >= 0 ? 'Positive' : 'Negative'} momentum over the last 7 days
                          with {Math.abs(propertyMetrics.priceChange7d).toFixed(1)}% change.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Trading Activity</p>
                        <p className="text-sm text-gray-600 mt-1">
                          ${propertyMetrics.volume24h.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          in 24h volume with {propertyMetrics.totalHolders} unique holders.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Investment Attractiveness</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {propertyMetrics.annualYield.toFixed(1)}% annual yield with
                          {propertyMetrics.occupancyRate > 90 ? ' excellent' :
                           propertyMetrics.occupancyRate > 80 ? ' good' : ' fair'} occupancy rates.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Price Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Interactive price chart would go here</p>
                      <p className="text-sm">Showing {selectedPeriod} performance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: '24h Change', value: propertyMetrics.priceChange24h, format: 'percent' },
                    { label: '7d Change', value: propertyMetrics.priceChange7d, format: 'percent' },
                    { label: '30d Change', value: propertyMetrics.priceChange30d, format: 'percent' },
                  ].map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{metric.label}</span>
                      <div className={cn(
                        "flex items-center gap-1 font-medium",
                        metric.value >= 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {metric.value >= 0 ?
                          <ArrowUpRight className="h-3 w-3" /> :
                          <ArrowDownRight className="h-3 w-3" />
                        }
                        <span>{metric.value.toFixed(2)}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="holders" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Holder Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Holder distribution chart would go here</p>
                    <p className="text-sm">Distribution by token holdings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Holder Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Holders</p>
                    <p className="text-2xl font-bold">{propertyMetrics.totalHolders}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Avg. Holding</p>
                    <p className="text-2xl font-bold">
                      {Number(formatUnits(propertyMetrics.averageHolding, 18)).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Concentration Risk</span>
                    <Badge variant="outline">
                      {propertyMetrics.totalHolders > 100 ? 'Low' :
                       propertyMetrics.totalHolders > 50 ? 'Medium' : 'High'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Holder Growth (7d)</span>
                    <span className="text-sm font-medium text-green-600">+{Math.floor(Math.random() * 10)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financials" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-xl font-bold">
                      ${propertyMetrics.monthlyRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Percent className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-gray-600">Annual Yield</p>
                    <p className="text-xl font-bold">{propertyMetrics.annualYield.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Revenue Generated</span>
                    <span className="font-medium">
                      ${propertyMetrics.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Revenue per Token</span>
                    <span className="font-medium">
                      ${(propertyMetrics.totalRevenue / Number(formatUnits(propertyMetrics.maxTokens, 18))).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Occupancy Rate</span>
                    <span className="font-medium">{propertyMetrics.occupancyRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Revenue Stability</span>
                      <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Consistent monthly revenue with {propertyMetrics.occupancyRate.toFixed(0)}% occupancy rate
                    </p>
                  </div>

                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Market Position</span>
                      <Badge className="bg-blue-100 text-blue-800">Strong</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Above average yield of {propertyMetrics.annualYield.toFixed(1)}% in the {PROPERTY_TYPES[propertyMetrics.propertyType].label.toLowerCase()} sector
                    </p>
                  </div>

                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Growth Potential</span>
                      <Badge className={propertyMetrics.priceChange30d > 0 ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                        {propertyMetrics.priceChange30d > 0 ? 'Positive' : 'Monitoring'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {propertyMetrics.priceChange30d.toFixed(1)}% price change over 30 days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}