"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import {
  MapPin, Building2, Calendar, Users, TrendingUp, FileText, ExternalLink,
  Home, Bath, Car, Maximize2, ChevronLeft, ChevronRight
} from 'lucide-react'
import { EnrichedPropertyDisplay } from '@/app/lib/supabase/hooks/use-enriched-properties'
import { Button } from '@/app/components/ui/button'
import Image from 'next/image'

interface PropertyDetailProps {
  property: EnrichedPropertyDisplay | null
}

export function PropertyDetail({ property }: PropertyDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!property) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Property Selected</h3>
          <p className="text-gray-600">Select a property from the marketplace to view details</p>
        </CardContent>
      </Card>
    )
  }

  const createdDate = new Date(property.created_at)
  const hasImages = property.images && property.images.length > 0
  const hasPropertyDetails = property.metadata?.details &&
    (property.property_type === 'residential' || property.property_type === 'commercial')

  const nextImage = () => {
    if (!hasImages) return
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
  }

  const prevImage = () => {
    if (!hasImages) return
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
  }

  return (
    <div className="space-y-6">
      {/* Image Gallery */}
      {hasImages ? (
        <Card>
          <CardContent className="p-0">
            {/* Main Image with Navigation */}
            <div className="relative h-96 bg-gray-900 group">
              <Image
                src={property.images[currentImageIndex]}
                alt={`${property.name} - Image ${currentImageIndex + 1}`}
                fill
                className="object-cover rounded-t-lg"
                priority
              />

              {/* Navigation Arrows */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Grid */}
            {property.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 p-4">
                {property.images.slice(0, 5).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      i === currentImageIndex ? 'border-blue-600 ring-2 ring-blue-200' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
                {property.images.length > 5 && (
                  <div className="relative h-20 rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center">
                    <span className="text-white text-sm">+{property.images.length - 5}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="relative h-96 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <div className="text-center text-white">
                <Building2 className="h-16 w-16 mx-auto mb-4 opacity-80" />
                <p className="text-lg font-medium">No images available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Information */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-3">{property.name}</CardTitle>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {property.property_type && (
                  <Badge variant="secondary" className="capitalize">
                    {property.property_type.replace('_', ' ')}
                  </Badge>
                )}
                {property.status && (
                  <Badge variant={property.status === 'available' ? 'default' : 'secondary'} className="capitalize">
                    {property.status.replace('_', ' ')}
                  </Badge>
                )}
                <Badge variant={property.isActive ? "default" : "secondary"}>
                  {property.isActive ? 'Trading Active' : 'Trading Paused'}
                </Badge>
              </div>

              {/* Location */}
              {property.metadata?.location && (
                <p className="text-gray-600 flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5" />
                  {property.metadata.location.address && `${property.metadata.location.address}, `}
                  {property.metadata.location.city}
                  {property.metadata.location.country && `, ${property.metadata.location.country}`}
                </p>
              )}

              {/* Size */}
              {property.size_value && property.size_unit && (
                <p className="text-gray-600 flex items-center gap-2 mt-2">
                  <Maximize2 className="h-4 w-4" />
                  {property.size_value} {property.size_unit}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          {property.description && (
            <div>
              <h4 className="font-semibold mb-2 text-lg">About This Property</h4>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Property Details (for residential/commercial) */}
          {hasPropertyDetails && (
            <div className="border-t pt-6">
              <h4 className="font-semibold mb-4 text-lg">Property Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.metadata.details?.bedrooms && (
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-2xl font-semibold">{property.metadata.details.bedrooms}</p>
                      <p className="text-sm text-gray-600">Bedrooms</p>
                    </div>
                  </div>
                )}
                {property.metadata.details?.bathrooms && (
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-2xl font-semibold">{property.metadata.details.bathrooms}</p>
                      <p className="text-sm text-gray-600">Bathrooms</p>
                    </div>
                  </div>
                )}
                {property.metadata.details?.parking && (
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-2xl font-semibold">{property.metadata.details.parking}</p>
                      <p className="text-sm text-gray-600">Parking</p>
                    </div>
                  </div>
                )}
                {property.metadata.details?.yearBuilt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-2xl font-semibold">{property.metadata.details.yearBuilt}</p>
                      <p className="text-sm text-gray-600">Year Built</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="font-semibold mb-4 text-lg">Amenities</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Projections */}
          {property.metadata?.financials && (
            <div className="border-t pt-6">
              <h4 className="font-semibold mb-4 text-lg">Financial Projections</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {property.metadata.financials.expectedROI !== undefined && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Expected ROI</p>
                    <p className="text-2xl font-bold text-blue-600">{property.metadata.financials.expectedROI}%</p>
                  </div>
                )}
                {property.metadata.financials.rentalYield !== undefined && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Rental Yield</p>
                    <p className="text-2xl font-bold text-green-600">{property.metadata.financials.rentalYield}%</p>
                  </div>
                )}
                {property.metadata.financials.appreciationRate !== undefined && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Appreciation Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{property.metadata.financials.appreciationRate}%</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tokenization Details */}
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4 text-lg">Tokenization Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Price per Token
                </p>
                <p className="text-xl font-semibold">{parseFloat(property.pricePerToken).toLocaleString()} HBAR</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Total Supply
                </p>
                <p className="text-xl font-semibold">{parseFloat(property.totalSupply).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Token Symbol
                </p>
                <p className="text-xl font-semibold">PROP{property.blockchainId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Listed
                </p>
                <p className="text-xl font-semibold">{createdDate.toLocaleDateString()}</p>
              </div>
            </div>

            {/* Total Value */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Property Value</p>
              <p className="text-3xl font-bold text-blue-600">
                {parseFloat(property.totalValue).toLocaleString()} HBAR
              </p>
            </div>
          </div>

          {/* Contract Info */}
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-3">Blockchain Information</h4>
            <div className="space-y-3">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <span className="text-sm text-gray-600">Token Contract</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {property.tokenContract}
                  </code>
                  <a
                    href={`https://hashscan.io/testnet/contract/${property.tokenContract}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <span className="text-sm text-gray-600">Property ID</span>
                <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  #{property.blockchainId}
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
