"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Skeleton } from '@/app/components/ui/skeleton'
import { DashboardLayout } from '@/app/components/layout/dashboard-layout'
import { MapPin, Building2, TrendingUp, Users, Calendar, DollarSign, RefreshCw } from 'lucide-react'
import { useAutoFetchProperties } from '@/app/lib/web3/hooks/use-auto-fetch-properties'
import { useEnrichedProperties, EnrichedPropertyDisplay } from '@/app/lib/supabase/hooks/use-enriched-properties'
import Image from 'next/image'

// Property images mapping
const PROPERTY_IMAGES = [
  '/images/properties/house-1.jpg',
  '/images/properties/house-2.jpg',
  '/images/properties/house-3.jpg',
  '/images/properties/house-6.jpg',
  '/images/properties/house-7.jpg',
  '/images/properties/house-9.jpg',
  '/images/properties/house-10.jpg',
]

// Disable static rendering for this page
export const dynamic = 'force-dynamic'

interface PropertyCardProps {
  property: EnrichedPropertyDisplay
}

function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter()
  const pricePerToken = property.pricePerToken || '0'
  const maxTokens = property.totalSupply || '0'
  const createdDate = new Date(property.created_at)

  // Use image from Supabase or fallback to placeholder
  const propertyImage = (property.images && property.images.length > 0)
    ? property.images[property.featured_image_index || 0]
    : PROPERTY_IMAGES[Number(property.blockchainId) % PROPERTY_IMAGES.length]

  // Symbol is auto-generated as PROP{id}
  const symbol = `PROP${property.blockchainId}`

  // Location from metadata
  const locationText = property.metadata?.location?.city
    ? `${property.metadata.location.city}${property.metadata.location.country ? ', ' + property.metadata.location.country : ''}`
    : property.description?.substring(0, 50)

  const handleClick = () => {
    router.push(`/property/${property.contract_address}`)
  }

  return (
    <Card
      className="hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
      onClick={handleClick}
    >
      {/* Property Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={propertyImage}
          alt={property.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Badges on Image */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant={property.isActive ? "default" : "secondary"} className="bg-white/90 text-gray-900 backdrop-blur-sm">
            {property.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm">
            {symbol}
          </Badge>
        </div>

        {/* Title on Image */}
        <div className="absolute bottom-3 left-3 right-3">
          <CardTitle className="text-white text-xl mb-1 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {property.name}
          </CardTitle>
          {locationText && (
            <p className="text-white/90 text-sm flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {locationText}
            </p>
          )}
        </div>
      </div>

      <CardHeader className="pb-3">
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Price per Token
            </p>
            <p className="font-semibold">{pricePerToken} HBAR</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Users className="h-3 w-3" />
              Max Supply
            </p>
            <p className="font-semibold">{parseFloat(maxTokens).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created
            </p>
            <p className="font-semibold">{createdDate.toLocaleDateString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Total Value
            </p>
            <p className="font-semibold">{(parseFloat(pricePerToken) * parseFloat(maxTokens)).toLocaleString()} HBAR</p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Token Contract</p>
            <p className="text-sm font-medium font-mono text-xs">
              {property.tokenContract.slice(0, 6)}...{property.tokenContract.slice(-4)}
            </p>
          </div>
        </div>

        <Button
          className="w-full"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            handleClick()
          }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}

function PropertySkeleton() {
  return (
    <Card>
      <div className="relative h-48">
        <Skeleton className="w-full h-full" />
      </div>
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const { address, isConnected } = useAccount()
  const { properties, isLoading, error, refetch } = useEnrichedProperties()
  const [sortBy, setSortBy] = useState<'newest' | 'price' | 'supply'>('newest')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Refresh error:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  const sortedProperties = [...properties].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'price':
        const priceA = parseFloat(a.pricePerToken || '0')
        const priceB = parseFloat(b.pricePerToken || '0')
        return priceA - priceB
      case 'supply':
        return parseFloat(b.totalSupply) - parseFloat(a.totalSupply)
      default:
        return 0
    }
  })

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-3xl font-bold">Property Marketplace</h2>
            <p className="text-gray-600 mt-1">
              {isLoading ? 'Loading...' : `${properties.length} properties available`}
            </p>
            {lastRefresh && !isLoading && (
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex gap-2 items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'price' | 'supply')}
              className="border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="price">Price (Low to High)</option>
              <option value="supply">Supply (High to Low)</option>
            </select>

            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {error && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="space-y-2">
                <p className="text-red-600">Failed to load properties</p>
                <p className="text-sm text-gray-600">{error}</p>
                <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isRefreshing}>
                  {isRefreshing ? 'Refreshing...' : 'Try Again'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertySkeleton key={i} />
            ))}
          </div>
        ) : sortedProperties.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
              <p className="text-gray-600 mb-4">
                No properties have been listed yet. Check back soon!
              </p>
              <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedProperties.map((property) => (
              <PropertyCard
                key={property.contract_address}
                property={property}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
