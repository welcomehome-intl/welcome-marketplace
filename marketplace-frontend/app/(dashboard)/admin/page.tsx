"use client"

import { useState } from "react"
import { Card } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Badge } from "@/app/components/ui/badge"
import { Textarea } from "@/app/components/ui/textarea"
import { Label } from "@/app/components/ui/label"
import { useAccount } from "wagmi"
import { formatUnits, parseUnits, Address } from "viem"
import {
  Shield,
  Users,
  Settings,
  Pause,
  Play,
  DollarSign,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  Coins,
  Building2,
  Plus
} from "lucide-react"

import { useUserRoles } from "@/app/lib/web3/hooks/use-roles"
import { usePropertyStatus, usePauseContract, useSetMaxTokens, useConnectProperty } from "@/app/lib/web3/hooks/use-property-token"
import { useMounted } from "@/app/lib/hooks/use-mounted"
import { usePropertyFactory } from "@/app/lib/web3/hooks/use-property-factory"
import { CONTRACT_ADDRESSES } from "@/app/lib/web3/config"
import { useReadContract } from "wagmi"
import { ACCESS_CONTROL_ABI } from "@/app/lib/web3/abi"
import { ImageUploader } from "@/app/components/admin/image-uploader"
import { AmenitiesSelector } from "@/app/components/admin/amenities-selector"
import { usePropertyManagement } from "@/app/lib/supabase/hooks/use-property-management"
import { PropertyType, SizeUnit, PropertyStatus, PropertyMetadata } from "@/app/lib/supabase/types"

// Disable static rendering for this page
export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const mounted = useMounted()
  const { address, isConnected } = useAccount()
  const roles = useUserRoles(address)

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
          <p className="text-gray-600">Please wait while we load the admin panel</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
          <p className="text-gray-600">Please connect your wallet to access admin features</p>
        </div>
      </div>
    )
  }

  if (!roles.hasAdminRole && !roles.isManager) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have administrator privileges to access this page.
          </p>
          <div className="text-sm text-gray-500">
            Required roles: Admin or Property Manager
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage smart contracts, users, and system settings</p>

        {/* Admin Role Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          {roles.hasAdminRole && (
            <Badge className="bg-red-50 text-red-700 border-red-200">
              <Shield className="h-3 w-3 mr-1" />
              Super Admin
            </Badge>
          )}
          {roles.hasPropertyManagerRole && (
            <Badge className="bg-blue-50 text-blue-700 border-blue-200">
              <Settings className="h-3 w-3 mr-1" />
              Property Manager
            </Badge>
          )}
          {roles.hasMinterRole && (
            <Badge className="bg-green-50 text-green-700 border-green-200">
              <Coins className="h-3 w-3 mr-1" />
              Token Minter
            </Badge>
          )}
          {roles.hasPauserRole && (
            <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Pause className="h-3 w-3 mr-1" />
              Contract Pauser
            </Badge>
          )}
        </div>
      </div>

      {/* Property Creation - Full Width */}
      <PropertyCreation />

      {/* Properties List - Full Width */}
      <PropertiesList />

      {/* Token Distribution - Full Width */}
      <TokenDistribution />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Management */}
        <ContractManagement />

        {/* User Management */}
        <UserManagement />

        {/* Property Management */}
        <PropertyManagement />

        {/* Revenue Management */}
        <RevenueManagement />
      </div>
    </div>
  )
}

function ContractManagement() {
  const propertyStatus = usePropertyStatus()
  const { pause, unpause, isPending: pausePending } = usePauseContract()

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Settings className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold">Contract Management</h3>
      </div>

      <div className="space-y-4">
        {/* Contract Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Contract Status</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Property Initialized:</span>
              <Badge variant={propertyStatus.isInitialized ? "default" : "secondary"}>
                {propertyStatus.isInitialized ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Contract Status:</span>
              <Badge variant={propertyStatus.isPaused ? "destructive" : "default"}>
                {propertyStatus.isPaused ? 'Paused' : 'Active'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Emergency Controls */}
        <div>
          <h4 className="font-medium mb-3">Emergency Controls</h4>
          <div className="flex gap-2">
            {propertyStatus.isPaused ? (
              <Button
                onClick={() => unpause()}
                disabled={pausePending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                {pausePending ? 'Activating...' : 'Resume Contract'}
              </Button>
            ) : (
              <Button
                onClick={() => pause()}
                disabled={pausePending}
                variant="destructive"
                className="flex-1"
              >
                <Pause className="h-4 w-4 mr-2" />
                {pausePending ? 'Pausing...' : 'Pause Contract'}
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Pausing will halt all token transfers and operations
          </p>
        </div>
      </div>
    </Card>
  )
}

function UserManagement() {
  const [userAddress, setUserAddress] = useState('')
  const [checkAddress, setCheckAddress] = useState<Address>()

  // Check KYC status from AccessControl contract
  const { data: isKYCVerified } = useReadContract({
    address: CONTRACT_ADDRESSES.ACCESS_CONTROL as Address,
    abi: ACCESS_CONTROL_ABI,
    functionName: 'isUserKYCed',
    args: checkAddress ? [checkAddress] : undefined,
    query: {
      enabled: !!checkAddress,
    },
  })

  const handleCheckUser = () => {
    if (userAddress && userAddress.startsWith('0x') && userAddress.length === 42) {
      setCheckAddress(userAddress as Address)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-green-100 p-2 rounded-lg">
          <Users className="h-5 w-5 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold">User Management</h3>
      </div>

      <div className="space-y-4">
        {/* User Lookup */}
        <div>
          <h4 className="font-medium mb-3">Check User Status</h4>
          <div className="flex gap-2">
            <Input
              placeholder="0x... user address"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleCheckUser} variant="outline">
              Check
            </Button>
          </div>

          {checkAddress && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">KYC Status:</span>
                <Badge variant={isKYCVerified ? "default" : "secondary"}>
                  {isKYCVerified ? (
                    <>
                      <UserCheck className="h-3 w-3 mr-1" />
                      KYC Verified
                    </>
                  ) : (
                    <>
                      <UserX className="h-3 w-3 mr-1" />
                      Not Verified
                    </>
                  )}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="font-medium mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="justify-start">
              <UserCheck className="h-4 w-4 mr-2" />
              Grant Access
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <UserX className="h-4 w-4 mr-2" />
              Revoke Access
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

function PropertyManagement() {
  const [newMaxSupply, setNewMaxSupply] = useState('')
  const [propertyAddress, setPropertyAddress] = useState('')
  const [transactionId, setTransactionId] = useState('')

  const { setMaxTokens, isPending: setMaxPending } = useSetMaxTokens()
  const { connectProperty, isPending: connectPending } = useConnectProperty()

  const handleSetMaxSupply = () => {
    if (!newMaxSupply) return
    try {
      const amount = parseUnits(newMaxSupply, 18)
      setMaxTokens(amount)
      setNewMaxSupply('')
    } catch (err) {
      console.error('Error setting max supply:', err)
    }
  }

  const handleConnectProperty = () => {
    if (!propertyAddress || !transactionId) return
    connectProperty(propertyAddress as Address, transactionId)
    setPropertyAddress('')
    setTransactionId('')
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-purple-100 p-2 rounded-lg">
          <Settings className="h-5 w-5 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold">Property Management</h3>
      </div>

      <div className="space-y-4">
        {/* Max Supply Management */}
        <div>
          <h4 className="font-medium mb-3">Token Supply Control</h4>
          <div className="flex gap-2">
            <Input
              placeholder="New max supply"
              value={newMaxSupply}
              onChange={(e) => setNewMaxSupply(e.target.value)}
              type="number"
              className="flex-1"
            />
            <Button
              onClick={handleSetMaxSupply}
              disabled={!newMaxSupply || setMaxPending}
            >
              {setMaxPending ? 'Setting...' : 'Set Max'}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Set maximum number of tokens that can be minted
          </p>
        </div>

        {/* Property Connection */}
        <div>
          <h4 className="font-medium mb-3">Connect Property</h4>
          <div className="space-y-2">
            <Input
              placeholder="Property contract address"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
            />
            <Input
              placeholder="Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
            <Button
              onClick={handleConnectProperty}
              disabled={!propertyAddress || !transactionId || connectPending}
              className="w-full"
            >
              {connectPending ? 'Connecting...' : 'Connect Property'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

function RevenueManagement() {
  const [revenueAmount, setRevenueAmount] = useState('')

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-emerald-100 p-2 rounded-lg">
          <DollarSign className="h-5 w-5 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold">Revenue Management</h3>
      </div>

      <div className="space-y-4">
        {/* Revenue Distribution */}
        <div>
          <h4 className="font-medium mb-3">Distribute Revenue</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Revenue amount (HBAR)"
              value={revenueAmount}
              onChange={(e) => setRevenueAmount(e.target.value)}
              type="number"
              step="0.01"
              className="flex-1"
            />
            <Button disabled>
              Distribute
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Distribute property revenue to all token holders
          </p>
        </div>

        {/* Revenue Stats */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Revenue Statistics</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Distributed:</span>
              <span className="font-medium">0 HBAR</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Distribution:</span>
              <span className="text-sm text-gray-500">Never</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

function PropertiesList() {
  const { properties, isLoading, propertyCount, refetchPropertyCount } = usePropertyFactory()

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Created Properties</h3>
          <Badge>Loading...</Badge>
        </div>
        <div className="space-y-2">
          <div className="h-16 bg-gray-100 rounded animate-pulse" />
          <div className="h-16 bg-gray-100 rounded animate-pulse" />
        </div>
      </Card>
    )
  }

  if (properties.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Created Properties</h3>
          <Badge variant="secondary">0 Properties</Badge>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Building2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>No properties created yet</p>
          <p className="text-sm">Create your first property above</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Created Properties</h3>
          <p className="text-sm text-gray-600">{propertyCount} {propertyCount === 1 ? 'property' : 'properties'} total</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetchPropertyCount()}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {properties.map((property) => (
          <div key={property.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <h4 className="font-medium">{property.name}</h4>
                  <Badge variant={property.isActive ? "default" : "secondary"} className="text-xs">
                    {property.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">ID:</span>
                    <span className="ml-1 font-medium">#{property.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Supply:</span>
                    <span className="ml-1 font-medium">{formatUnits(property.totalSupply, 18)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Price:</span>
                    <span className="ml-1 font-medium">{formatUnits(property.pricePerToken, 18)} HBAR</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-1 font-medium">
                      {new Date(Number(property.createdAt) * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <span>Token Contract: </span>
                  <span className="font-mono">{property.tokenContract.slice(0, 10)}...{property.tokenContract.slice(-8)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function TokenDistribution() {
  const { properties, isLoading, distributeTokens, isDistributing, isConfirmingDistribute, isDistributeSuccess, distributeError, distributeHash } = usePropertyFactory()
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [tokenAmount, setTokenAmount] = useState('')

  const selectedProperty = properties.find(p => p.id.toString() === selectedPropertyId)

  const handleDistribute = async () => {
    if (!selectedPropertyId || !recipientAddress || !tokenAmount) {
      alert('Please fill in all fields')
      return
    }

    if (!recipientAddress.startsWith('0x') || recipientAddress.length !== 42) {
      alert('Invalid recipient address')
      return
    }

    try {
      await distributeTokens({
        propertyId: parseInt(selectedPropertyId),
        to: recipientAddress as `0x${string}`,
        amount: tokenAmount,
      })
    } catch (err: any) {
      console.error('Distribution error:', err)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-green-100 p-2 rounded-lg">
          <Coins className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Distribute Tokens</h3>
          <p className="text-sm text-gray-600">Distribute property tokens to KYC-verified investors</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-pulse">Loading properties...</div>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Building2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>No properties available</p>
          <p className="text-sm">Create a property first to distribute tokens</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="property">Select Property *</Label>
              <select
                id="property"
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white"
                disabled={isDistributing || isConfirmingDistribute}
              >
                <option value="">Choose a property...</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    #{property.id} - {property.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address *</Label>
              <Input
                id="recipient"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                disabled={isDistributing || isConfirmingDistribute}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Token Amount *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g., 100"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                disabled={isDistributing || isConfirmingDistribute}
              />
            </div>
          </div>

          {selectedProperty && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Total Supply:</span>
                  <span className="ml-1 font-medium">{formatUnits(selectedProperty.totalSupply, 18)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Price per Token:</span>
                  <span className="ml-1 font-medium">{formatUnits(selectedProperty.pricePerToken, 18)} HBAR</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={selectedProperty.isActive ? "default" : "secondary"} className="ml-1 text-xs">
                    {selectedProperty.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Token Contract:</span>
                  <span className="ml-1 font-mono text-xs">{selectedProperty.tokenContract.slice(0, 6)}...{selectedProperty.tokenContract.slice(-4)}</span>
                </div>
              </div>
            </div>
          )}

          {isDistributeSuccess && distributeHash && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Distribution Successful!</p>
                  <p className="text-sm">
                    Distributed {tokenAmount} tokens to {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
                  </p>
                  <p className="text-xs mt-1 font-mono">
                    Tx: {distributeHash.slice(0, 10)}...{distributeHash.slice(-8)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {distributeError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Distribution Failed</p>
                  <p className="text-sm">{distributeError.message || 'Unknown error occurred'}</p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleDistribute}
            disabled={!selectedPropertyId || !recipientAddress || !tokenAmount || isDistributing || isConfirmingDistribute}
            className="w-full"
          >
            {isDistributing || isConfirmingDistribute ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isConfirmingDistribute ? 'Confirming...' : 'Distributing...'}
              </>
            ) : (
              <>
                <Coins className="h-4 w-4 mr-2" />
                Distribute Tokens
              </>
            )}
          </Button>

          <div className="mt-3 text-xs text-gray-500 space-y-1">
            <p>• Recipient must be KYC-verified to receive tokens</p>
            <p>• Tokens are distributed from the PropertyFactory contract</p>
            <p>• Transaction may take a few seconds to confirm on Hedera</p>
          </div>
        </>
      )}
    </Card>
  )
}

function PropertyCreation() {
  // Basic property info
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxSupply: '',
    pricePerToken: '',
    propertyType: 'residential' as PropertyType,
    sizeValue: '',
    sizeUnit: 'sqm' as SizeUnit,
    status: 'available' as PropertyStatus,
  })

  // Property details (conditional)
  const [propertyDetails, setPropertyDetails] = useState({
    bedrooms: '',
    bathrooms: '',
    yearBuilt: '',
    floors: '',
    parking: '',
  })

  // Location
  const [location, setLocation] = useState({
    address: '',
    city: '',
    country: '',
    lat: '',
    lng: '',
  })

  // Financials
  const [financials, setFinancials] = useState({
    expectedROI: '',
    rentalYield: '',
    appreciationRate: '',
  })

  const [images, setImages] = useState<string[]>([])
  const [amenities, setAmenities] = useState<string[]>([])

  const {
    createProperty: createBlockchainProperty,
    isCreatingProperty,
    isConfirmingCreate,
    isCreateSuccess,
    createPropertyError,
    createPropertyHash,
  } = usePropertyFactory()

  const { createProperty: createSupabaseProperty } = usePropertyManagement()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPropertyDetails(prev => ({ ...prev, [name]: value }))
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLocation(prev => ({ ...prev, [name]: value }))
  }

  const handleFinancialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFinancials(prev => ({ ...prev, [name]: value }))
  }

  const handleCreateProperty = async () => {
    // Validation
    if (!formData.name || !formData.maxSupply || !formData.pricePerToken) {
      alert('Please fill in all required fields (Name, Max Supply, Price Per Token)')
      return
    }

    try {
      // Step 1: Create property on blockchain
      const metadataURI = JSON.stringify({
        name: formData.name,
        description: formData.description || '',
        type: formData.propertyType,
        createdAt: Date.now(),
      })

      const result = await createBlockchainProperty({
        name: formData.name,
        symbol: '',
        maxSupply: formData.maxSupply,
        pricePerToken: formData.pricePerToken,
        location: '',
        ipfsURI: metadataURI,
      })

      // Step 2: Wait for blockchain confirmation and get contract address
      // The contract address will be available in the transaction receipt
      // For now, we'll use a placeholder and update this in the next phase
      // TODO: Extract contract address from transaction result

      // Clear form on success
      setFormData({
        name: '',
        description: '',
        maxSupply: '',
        pricePerToken: '',
        propertyType: 'residential',
        sizeValue: '',
        sizeUnit: 'sqm',
        status: 'available',
      })
      setPropertyDetails({
        bedrooms: '',
        bathrooms: '',
        yearBuilt: '',
        floors: '',
        parking: '',
      })
      setLocation({
        address: '',
        city: '',
        country: '',
        lat: '',
        lng: '',
      })
      setFinancials({
        expectedROI: '',
        rentalYield: '',
        appreciationRate: '',
      })
      setImages([])
      setAmenities([])

    } catch (err: any) {
      console.error('Create property error:', err)
    }
  }

  const showPropertyDetails = formData.propertyType === 'residential' || formData.propertyType === 'commercial'

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 p-2 rounded-lg">
          <Building2 className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Create New Property</h3>
          <p className="text-sm text-gray-600">Add a new tokenized property to the marketplace</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="border-b pb-4">
          <h4 className="font-semibold mb-4">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Property Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Luxury Villa in Karen"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isCreatingProperty || isConfirmingCreate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type *</Label>
              <select
                id="propertyType"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md bg-white"
                disabled={isCreatingProperty || isConfirmingCreate}
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
                <option value="industrial">Industrial</option>
                <option value="mixed_use">Mixed Use</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md bg-white"
                disabled={isCreatingProperty || isConfirmingCreate}
              >
                <option value="available">Available</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="sold_out">Sold Out</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sizeValue">Property Size *</Label>
              <Input
                id="sizeValue"
                name="sizeValue"
                type="number"
                step="0.01"
                placeholder="e.g., 10"
                value={formData.sizeValue}
                onChange={handleInputChange}
                disabled={isCreatingProperty || isConfirmingCreate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sizeUnit">Size Unit *</Label>
              <select
                id="sizeUnit"
                name="sizeUnit"
                value={formData.sizeUnit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md bg-white"
                disabled={isCreatingProperty || isConfirmingCreate}
              >
                <option value="acres">Acres</option>
                <option value="sqm">Square Meters (sqm)</option>
                <option value="sqft">Square Feet (sqft)</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Property description..."
                value={formData.description}
                onChange={handleInputChange}
                disabled={isCreatingProperty || isConfirmingCreate}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Property Details (Conditional) */}
        {showPropertyDetails && (
          <div className="border-b pb-4">
            <h4 className="font-semibold mb-4">Property Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  placeholder="e.g., 3"
                  value={propertyDetails.bedrooms}
                  onChange={handleDetailsChange}
                  disabled={isCreatingProperty || isConfirmingCreate}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  placeholder="e.g., 2"
                  value={propertyDetails.bathrooms}
                  onChange={handleDetailsChange}
                  disabled={isCreatingProperty || isConfirmingCreate}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearBuilt">Year Built</Label>
                <Input
                  id="yearBuilt"
                  name="yearBuilt"
                  type="number"
                  placeholder="e.g., 2020"
                  value={propertyDetails.yearBuilt}
                  onChange={handleDetailsChange}
                  disabled={isCreatingProperty || isConfirmingCreate}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floors">Floors</Label>
                <Input
                  id="floors"
                  name="floors"
                  type="number"
                  placeholder="e.g., 2"
                  value={propertyDetails.floors}
                  onChange={handleDetailsChange}
                  disabled={isCreatingProperty || isConfirmingCreate}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parking">Parking Spaces</Label>
                <Input
                  id="parking"
                  name="parking"
                  type="number"
                  placeholder="e.g., 2"
                  value={propertyDetails.parking}
                  onChange={handleDetailsChange}
                  disabled={isCreatingProperty || isConfirmingCreate}
                />
              </div>
            </div>
          </div>
        )}

        {/* Location */}
        <div className="border-b pb-4">
          <h4 className="font-semibold mb-4">Location</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="Street address"
                value={location.address}
                onChange={handleLocationChange}
                disabled={isCreatingProperty || isConfirmingCreate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                placeholder="e.g., Nairobi"
                value={location.city}
                onChange={handleLocationChange}
                disabled={isCreatingProperty || isConfirmingCreate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                placeholder="e.g., Kenya"
                value={location.country}
                onChange={handleLocationChange}
                disabled={isCreatingProperty || isConfirmingCreate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lat">Latitude (optional)</Label>
              <Input
                id="lat"
                name="lat"
                type="number"
                step="0.000001"
                placeholder="e.g., -1.286389"
                value={location.lat}
                onChange={handleLocationChange}
                disabled={isCreatingProperty || isConfirmingCreate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lng">Longitude (optional)</Label>
              <Input
                id="lng"
                name="lng"
                type="number"
                step="0.000001"
                placeholder="e.g., 36.817223"
                value={location.lng}
                onChange={handleLocationChange}
                disabled={isCreatingProperty || isConfirmingCreate}
              />
            </div>
          </div>
        </div>

        {/* Tokenization Details */}
        <div className="border-b pb-4">
          <h4 className="font-semibold mb-4">Tokenization Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxSupply">Max Token Supply *</Label>
              <Input
                id="maxSupply"
                name="maxSupply"
                type="number"
                placeholder="e.g., 1000"
                value={formData.maxSupply}
                onChange={handleInputChange}
                disabled={isCreatingProperty || isConfirmingCreate}
              />
              <p className="text-xs text-gray-500">Total tokens representing 100% ownership</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerToken">Price Per Token (HBAR) *</Label>
              <Input
                id="pricePerToken"
                name="pricePerToken"
                type="number"
                step="0.01"
                placeholder="e.g., 100"
                value={formData.pricePerToken}
                onChange={handleInputChange}
                disabled={isCreatingProperty || isConfirmingCreate}
              />
              <p className="text-xs text-gray-500">Price per token in HBAR</p>
            </div>
          </div>
        </div>

        {/* Financial Projections */}
        <div className="border-b pb-4">
          <h4 className="font-semibold mb-4">Financial Projections (Optional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedROI">Expected ROI (%)</Label>
              <Input
                id="expectedROI"
                name="expectedROI"
                type="number"
                step="0.1"
                placeholder="e.g., 8.5"
                value={financials.expectedROI}
                onChange={handleFinancialsChange}
                disabled={isCreatingProperty || isConfirmingCreate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rentalYield">Rental Yield (%)</Label>
              <Input
                id="rentalYield"
                name="rentalYield"
                type="number"
                step="0.1"
                placeholder="e.g., 5.2"
                value={financials.rentalYield}
                onChange={handleFinancialsChange}
                disabled={isCreatingProperty || isConfirmingCreate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appreciationRate">Appreciation Rate (%)</Label>
              <Input
                id="appreciationRate"
                name="appreciationRate"
                type="number"
                step="0.1"
                placeholder="e.g., 3.0"
                value={financials.appreciationRate}
                onChange={handleFinancialsChange}
                disabled={isCreatingProperty || isConfirmingCreate}
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="border-b pb-4">
          <h4 className="font-semibold mb-4">Amenities</h4>
          <AmenitiesSelector
            selectedAmenities={amenities}
            onChange={setAmenities}
            disabled={isCreatingProperty || isConfirmingCreate}
          />
        </div>

        {/* Images */}
        <div className="border-b pb-4">
          <h4 className="font-semibold mb-4">Property Images</h4>
          <ImageUploader
            maxFiles={10}
            onImagesChange={setImages}
            initialImages={images}
            disabled={isCreatingProperty || isConfirmingCreate}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <Button
          onClick={handleCreateProperty}
          disabled={isCreatingProperty || isConfirmingCreate}
          className="w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isCreatingProperty ? 'Signing Transaction...' : isConfirmingCreate ? 'Confirming...' : 'Create Property'}
        </Button>
      </div>

      {/* Status Messages */}
      {isConfirmingCreate && !isCreateSuccess && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="font-medium">Transaction confirming...</p>
              <p className="text-sm mt-1">Waiting for Hedera network confirmation</p>
            </div>
          </div>
        </div>
      )}

      {isCreateSuccess && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Property created successfully!</p>
              <p className="text-sm mt-1">Property list will update in a moment...</p>
              {createPropertyHash && (
                <p className="text-xs mt-1 font-mono">
                  Tx: {createPropertyHash.slice(0, 10)}...{createPropertyHash.slice(-8)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {createPropertyError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            <p className="font-medium">{createPropertyError.message || 'Failed to create property'}</p>
          </div>
        </div>
      )}
    </Card>
  )
}