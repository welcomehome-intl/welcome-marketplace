"use client"

import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { formatUnits } from 'viem'
import { PropertyInfo, PropertyType } from '@/app/lib/web3/hooks/use-property-factory'
import Image from 'next/image'
import {
  MapPin,
  Building2,
  DollarSign,
  Coins,
  Calendar,
  User,
  FileText,
  TrendingUp,
  CheckCircle,
  Info
} from 'lucide-react'

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

const PROPERTY_TYPE_LABELS = {
  [PropertyType.RESIDENTIAL]: 'Residential',
  [PropertyType.COMMERCIAL]: 'Commercial',
  [PropertyType.INDUSTRIAL]: 'Industrial',
  [PropertyType.MIXED_USE]: 'Mixed Use',
  [PropertyType.LAND]: 'Land',
}

interface PropertyDetailsProps {
  selectedProperty?: PropertyInfo | null
}

export function PropertyDetails({ selectedProperty }: PropertyDetailsProps) {
  if (!selectedProperty) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Property Selected</h3>
          <p className="text-gray-600">
            Select a property from the Browse tab to view detailed information
          </p>
        </CardContent>
      </Card>
    )
  }

  const propertyImage = PROPERTY_IMAGES[selectedProperty.id % PROPERTY_IMAGES.length]
  const totalValueUSD = formatUnits(selectedProperty.totalValue, 18)
  const maxTokens = formatUnits(selectedProperty.maxTokens, 18)
  const pricePerToken = parseFloat(totalValueUSD) / parseFloat(maxTokens)
  const createdDate = new Date(Number(selectedProperty.createdAt) * 1000)

  return (
    <div className="space-y-6">
      {/* Property Overview Card */}
      <Card className="overflow-hidden">
        {/* Property Image */}
        <div className="relative h-64 overflow-hidden">
          <Image
            src={propertyImage}
            alt={selectedProperty.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Badges on Image */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm">
              {PROPERTY_TYPE_LABELS[selectedProperty.propertyType as PropertyType]}
            </Badge>
            <Badge
              variant={selectedProperty.isActive ? "default" : "secondary"}
              className="bg-white/90 text-gray-900 backdrop-blur-sm"
            >
              {selectedProperty.isActive ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Active
                </span>
              ) : (
                'Inactive'
              )}
            </Badge>
          </div>

          {/* Property Name and Location on Image */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-2xl font-bold mb-2">{selectedProperty.name}</h2>
            <p className="flex items-center gap-2 text-white/90">
              <MapPin className="h-4 w-4" />
              {selectedProperty.location}
            </p>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Key Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Key Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Total Value
                </p>
                <p className="text-xl font-bold">
                  ${parseFloat(totalValueUSD).toLocaleString()}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  Max Tokens
                </p>
                <p className="text-xl font-bold">
                  {parseFloat(maxTokens).toLocaleString()}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Price per Token
                </p>
                <p className="text-xl font-bold">
                  ${pricePerToken.toFixed(2)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created
                </p>
                <p className="text-xl font-bold">
                  {createdDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Property Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Token Symbol</span>
                <Badge variant="outline" className="font-mono">
                  {selectedProperty.symbol}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Property Type</span>
                <span className="font-medium">
                  {PROPERTY_TYPE_LABELS[selectedProperty.propertyType as PropertyType]}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Creator
                </span>
                <span className="font-mono text-xs text-right">
                  {selectedProperty.creator.slice(0, 6)}...{selectedProperty.creator.slice(-4)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  IPFS Hash
                </span>
                <span className="font-mono text-xs">
                  {selectedProperty.ipfsHash.slice(0, 10)}...
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <Badge variant={selectedProperty.isActive ? "default" : "secondary"}>
                  {selectedProperty.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Investment Summary */}
          <div className="pt-6 border-t bg-blue-50 -m-6 mt-6 p-6 rounded-b-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-900">
              Investment Opportunity
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Minimum Investment</span>
                <span className="font-medium text-blue-900">
                  ${(pricePerToken * 1).toFixed(2)} (1 token)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Total Supply</span>
                <span className="font-medium text-blue-900">
                  {parseFloat(maxTokens).toLocaleString()} tokens
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Property Valuation</span>
                <span className="font-medium text-blue-900">
                  ${parseFloat(totalValueUSD).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-xs text-blue-600">
                By purchasing tokens, you gain fractional ownership in this property and are entitled to proportional revenue distributions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          View Documents
        </Button>
        <Button variant="outline" className="w-full">
          <Info className="h-4 w-4 mr-2" />
          Full Details
        </Button>
      </div>
    </div>
  )
}
