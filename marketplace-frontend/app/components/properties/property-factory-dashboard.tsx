"use client"

import { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import {
  Building2,
  Plus,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Eye,
  Settings
} from 'lucide-react'
import { useAccount } from 'wagmi'
import { formatUnits, parseEther, Address } from 'viem'
import { useMultiPropertyData } from '@/app/lib/web3/hooks/use-multi-property-data'
import { usePropertyFactory, PropertyType } from '@/app/lib/web3/hooks/use-property-factory'
import { useUserRoles } from '@/app/lib/web3/hooks/use-roles'
import { formatCurrency } from '@/app/lib/utils'

export function PropertyFactoryDashboard() {
  const { address, isConnected } = useAccount()
  const { properties, isLoading, calculateStats } = useMultiPropertyData()
  const { deployProperty, verifyProperty, propertyCount } = usePropertyFactory()
  const userRoles = useUserRoles(address)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<any>(null)

  const stats = calculateStats()

  if (!isConnected) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Factory</h1>
          <p className="text-gray-600">Connect your wallet to manage properties</p>
        </div>
      </div>
    )
  }

  if (!userRoles.isManager && !userRoles.isAdmin) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600">You need admin or manager privileges to access property management</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Property Factory</h1>
          <p className="text-gray-600">Create and manage tokenized properties</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Property
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between mb-4">
            <Building2 className="h-8 w-8" />
            <Badge variant="secondary" className="bg-white/20 text-white">
              Total
            </Badge>
          </div>
          <h3 className="text-2xl font-bold mb-1">{stats.totalProperties}</h3>
          <p className="text-blue-100 text-sm">Properties Created</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-600 to-green-700 text-white">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="h-8 w-8" />
            <Badge variant="secondary" className="bg-white/20 text-white">
              Active
            </Badge>
          </div>
          <h3 className="text-2xl font-bold mb-1">{stats.activeProperties}</h3>
          <p className="text-green-100 text-sm">Active Properties</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8" />
            <Badge variant="secondary" className="bg-white/20 text-white">
              Market
            </Badge>
          </div>
          <h3 className="text-2xl font-bold mb-1">
            {formatCurrency(Number(formatUnits(stats.totalMarketCap, 18)))}
          </h3>
          <p className="text-purple-100 text-sm">Total Market Cap</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8" />
            <Badge variant="secondary" className="bg-white/20 text-white">
              Tokens
            </Badge>
          </div>
          <h3 className="text-2xl font-bold mb-1">
            {Number(formatUnits(stats.totalTokensIssued, 18)).toLocaleString()}
          </h3>
          <p className="text-orange-100 text-sm">Tokens Issued</p>
        </Card>
      </div>

      {/* Properties List */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">All Properties</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Filter
            </Button>
            <Button variant="outline" size="sm">
              Sort
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Properties Yet</h4>
            <p className="text-gray-600 mb-4">Create your first tokenized property to get started</p>
            <Button onClick={() => setShowCreateForm(true)}>
              Create Property
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <PropertyListItem
                key={property.id}
                property={property}
                onView={() => setSelectedProperty(property)}
                onVerify={() => verifyProperty(property.id)}
                canVerify={userRoles.isAdmin}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Create Property Modal */}
      {showCreateForm && (
        <CreatePropertyModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={deployProperty}
        />
      )}

      {/* Property Details Modal */}
      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  )
}

function PropertyListItem({
  property,
  onView,
  onVerify,
  canVerify
}: {
  property: any
  onView: () => void
  onVerify: () => void
  canVerify: boolean
}) {
  const getPropertyTypeLabel = (type: number) => {
    const types = ['Residential', 'Commercial', 'Industrial', 'Mixed Use', 'Land']
    return types[type] || 'Unknown'
  }

  const getStatusColor = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'bg-gray-100 text-gray-700'
    if (isVerified) return 'bg-green-100 text-green-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-lg">{property.name}</h4>
            <Badge variant="secondary" className={getStatusColor(property.isActive, property.isVerified)}>
              {!property.isActive ? 'Inactive' : property.isVerified ? 'Verified' : 'Unverified'}
            </Badge>
            <Badge variant="outline">
              {property.symbol}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{getPropertyTypeLabel(property.propertyType)}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>{formatCurrency(Number(formatUnits(property.totalValue, 18)))}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{Number(formatUnits(property.maxTokens, 18)).toLocaleString()} tokens</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(Number(property.createdAt) * 1000).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span>
              <strong>Market Cap:</strong> {formatCurrency(Number(formatUnits(property.marketCap || BigInt(0), 18)))}
            </span>
            <span>
              <strong>Available:</strong> {Number(formatUnits(property.tokensAvailable || BigInt(0), 18)).toLocaleString()} tokens
            </span>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <Button variant="outline" size="sm" onClick={onView}>
            <Eye className="h-4 w-4" />
          </Button>
          {canVerify && !property.isVerified && (
            <Button variant="outline" size="sm" onClick={onVerify}>
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function CreatePropertyModal({
  onClose,
  onSubmit
}: {
  onClose: () => void
  onSubmit: (name: string, symbol: string, ipfsHash: string, totalValue: string, maxTokens: string, propertyType: PropertyType, location: string, paymentToken: Address, creationFee?: string) => Promise<any>
}) {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    ipfsHash: '',
    totalValue: '',
    maxTokens: '',
    propertyType: PropertyType.RESIDENTIAL,
    location: '',
    paymentToken: '0x0000000000000000000000000000000000000000' as Address,
    creationFee: '1'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit(
        formData.name,
        formData.symbol,
        formData.ipfsHash,
        formData.totalValue,
        formData.maxTokens,
        formData.propertyType,
        formData.location,
        formData.paymentToken,
        formData.creationFee
      )
      onClose()
    } catch (error) {
      console.error('Error creating property:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Property</h2>
          <Button variant="outline" size="sm" onClick={onClose}>×</Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Riverside Apartments"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Symbol *
              </label>
              <Input
                value={formData.symbol}
                onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                placeholder="e.g., RVRS"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Value (USD) *
              </label>
              <Input
                type="number"
                value={formData.totalValue}
                onChange={(e) => setFormData({...formData, totalValue: e.target.value})}
                placeholder="e.g., 1000000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Tokens *
              </label>
              <Input
                type="number"
                value={formData.maxTokens}
                onChange={(e) => setFormData({...formData, maxTokens: e.target.value})}
                placeholder="e.g., 1000000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({...formData, propertyType: Number(e.target.value) as PropertyType})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              >
                <option value={PropertyType.RESIDENTIAL}>Residential</option>
                <option value={PropertyType.COMMERCIAL}>Commercial</option>
                <option value={PropertyType.INDUSTRIAL}>Industrial</option>
                <option value={PropertyType.MIXED_USE}>Mixed Use</option>
                <option value={PropertyType.LAND}>Land</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Creation Fee (HBAR) *
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.creationFee}
                onChange={(e) => setFormData({...formData, creationFee: e.target.value})}
                placeholder="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="e.g., Nairobi, Kenya"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IPFS Hash (Optional)
            </label>
            <Input
              value={formData.ipfsHash}
              onChange={(e) => setFormData({...formData, ipfsHash: e.target.value})}
              placeholder="QmExample..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Creating...' : 'Create Property'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PropertyDetailsModal({
  property,
  onClose
}: {
  property: any
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{property.name}</h2>
          <Button variant="outline" size="sm" onClick={onClose}>×</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Basic Information</h3>
            <div className="space-y-3 text-sm">
              <div><strong>Symbol:</strong> {property.symbol}</div>
              <div><strong>Type:</strong> {['Residential', 'Commercial', 'Industrial', 'Mixed Use', 'Land'][property.propertyType]}</div>
              <div><strong>Location:</strong> {property.location}</div>
              <div><strong>Total Value:</strong> {formatCurrency(Number(formatUnits(property.totalValue, 18)))}</div>
              <div><strong>Max Tokens:</strong> {Number(formatUnits(property.maxTokens, 18)).toLocaleString()}</div>
            </div>
          </Card>

          {/* Contract Info */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Contract Information</h3>
            <div className="space-y-3 text-sm">
              <div><strong>Token Contract:</strong> <code className="text-xs">{property.tokenContract}</code></div>
              <div><strong>Handler Contract:</strong> <code className="text-xs">{property.handlerContract}</code></div>
              <div><strong>Creator:</strong> <code className="text-xs">{property.creator}</code></div>
              <div><strong>Created:</strong> {new Date(Number(property.createdAt) * 1000).toLocaleString()}</div>
            </div>
          </Card>

          {/* Market Data */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Market Data</h3>
            <div className="space-y-3 text-sm">
              <div><strong>Current Price:</strong> {formatCurrency(Number(formatUnits(property.currentPrice || BigInt(0), 18)))}</div>
              <div><strong>Market Cap:</strong> {formatCurrency(Number(formatUnits(property.marketCap || BigInt(0), 18)))}</div>
              <div><strong>Tokens Sold:</strong> {Number(formatUnits(property.tokensSold || BigInt(0), 18)).toLocaleString()}</div>
              <div><strong>Tokens Available:</strong> {Number(formatUnits(property.tokensAvailable || BigInt(0), 18)).toLocaleString()}</div>
            </div>
          </Card>

          {/* Status */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={property.isActive ? 'default' : 'secondary'}>
                  {property.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={property.isVerified ? 'default' : 'secondary'}>
                  {property.isVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}