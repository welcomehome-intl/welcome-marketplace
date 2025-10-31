"use client"

import { useState } from 'react'
import { formatEther } from 'viem'
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Skeleton } from '@/app/components/ui/skeleton'
import { MapPin, Building2, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react'
import { useAutoFetchProperties, EnrichedPropertyInfo } from '@/app/lib/web3/hooks/use-auto-fetch-properties'
import Image from 'next/image'
import Link from 'next/link'

// Placeholder image for properties without images
const DEFAULT_PROPERTY_IMAGE = '/images/properties/placeholder.jpg'

interface PropertyCardProps {
  property: EnrichedPropertyInfo
  onViewDetails: (property: EnrichedPropertyInfo) => void
}

function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
  // Use formatted values from enriched property data
  const pricePerToken = property.pricePerTokenFormatted || formatEther(property.pricePerToken)
  const maxSupply = property.maxSupplyFormatted || formatEther(property.maxSupply)
  const createdDate = new Date(Number(property.createdAt) * 1000)

  // Get property image from Supabase or use placeholder
  const propertyImage = property.images && property.images.length > 0
    ? property.images[0]
    : DEFAULT_PROPERTY_IMAGE

  return (
    <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group">
      {/* Property Image */}
      <Link href={`/property/${property.id}`}>
        <div className="relative h-48 overflow-hidden">
          <Image
            src={propertyImage}
            alt={property.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.currentTarget.src = DEFAULT_PROPERTY_IMAGE
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Badges on Image */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge variant={property.isActive ? "default" : "secondary"} className="bg-white/90 text-gray-900 backdrop-blur-sm">
              {property.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Title on Image */}
          <div className="absolute bottom-3 left-3 right-3">
            <CardTitle className="text-white text-xl mb-1">
              {property.name}
            </CardTitle>
            <p className="text-white/90 text-sm flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {property.location}
            </p>
          </div>
        </div>
      </Link>

      <CardContent className="space-y-4 pt-4">
        {/* Description if available */}
        {property.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {property.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Price per Token
            </p>
            <p className="font-semibold">{parseFloat(pricePerToken).toFixed(2)} HBAR</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Users className="h-3 w-3" />
              Max Supply
            </p>
            <p className="font-semibold">{parseFloat(maxSupply).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created
            </p>
            <p className="font-semibold text-sm">{createdDate.toLocaleDateString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Token Symbol</p>
            <p className="font-semibold text-sm">{property.symbol}</p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500 mb-1">Contract Address</p>
          <p className="text-xs font-mono">
            {property.tokenContract.slice(0, 10)}...{property.tokenContract.slice(-8)}
          </p>
        </div>

        <div className="flex gap-2">
          <Link href={`/property/${property.id}`} className="flex-1">
            <Button className="w-full" variant="default">
              View Details
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails(property)
            }}
          >
            Quick Buy
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PropertySkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

interface PropertyBrowserProps {
  onSelectProperty?: (property: EnrichedPropertyInfo) => void
}

export function PropertyBrowser({ onSelectProperty }: PropertyBrowserProps) {
  const { properties, isLoading, error, refresh, propertyCount } = useAutoFetchProperties()
  const [sortBy, setSortBy] = useState<'newest' | 'price' | 'value'>('newest')

  const sortedProperties = [...properties].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return Number(b.createdAt) - Number(a.createdAt)
      case 'price':
        const priceA = parseFloat(a.pricePerTokenFormatted || '0')
        const priceB = parseFloat(b.pricePerTokenFormatted || '0')
        return priceA - priceB
      case 'value':
        return Number(b.maxSupply) - Number(a.maxSupply)
      default:
        return 0
    }
  })

  const handleViewDetails = (property: EnrichedPropertyInfo) => {
    if (onSelectProperty) {
      onSelectProperty(property)
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <p className="text-red-600">Failed to load properties</p>
            <p className="text-sm text-gray-600">{error}</p>
            <Button onClick={refresh} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Available Properties</h2>
          <p className="text-gray-600">
            {isLoading ? 'Loading properties...' : `${propertyCount} ${propertyCount === 1 ? 'property' : 'properties'} available for investment`}
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'price' | 'value')}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="price">Price (Low to High)</option>
            <option value="value">Supply (High to Low)</option>
          </select>

          <Button onClick={refresh} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

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
            <Button onClick={refresh} variant="outline">
              Refresh
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  )
}