"use client"

import { useState, useEffect, useCallback } from 'react'
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from '../ui/modern-card'
import { Button } from '../ui/button'
import { ModernInput } from '../ui/modern-input'
import { Textarea } from '../ui/textarea'
import { ModernBadge, PropertyTypeBadge } from '../ui/modern-badge'
import { useAccount } from 'wagmi'
import {
  usePropertyFactory,
  PropertyType,
  type PropertyInfo
} from '@/app/lib/web3/hooks/use-property-factory'
import { usePaymentTokenPurchaseFlow } from '@/app/lib/web3/hooks/use-payment-token'
import { useUserKYCStatus } from '@/app/lib/web3/hooks/use-kyc-registry'
import { CONTRACT_ADDRESSES } from '@/app/lib/web3/config'
import {
  Building,
  MapPin,
  DollarSign,
  Coins,
  Upload,
  CheckCircle,
  AlertCircle,
  Globe,
  Home,
  Factory,
  Building2,
  TreePine,
  ChevronRight,
  Loader2,
  Info,
  Shield,
  Clock,
  Users,
  TrendingUp,
  FileText
} from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { formatEther, parseEther, Address } from 'viem'

const PROPERTY_TYPES = [
  {
    type: PropertyType.RESIDENTIAL,
    title: 'Residential',
    description: 'Single-family homes, apartments, condos',
    icon: Home,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    features: ['Rental income potential', 'Stable appreciation', 'Lower barriers to entry']
  },
  {
    type: PropertyType.COMMERCIAL,
    title: 'Commercial',
    description: 'Office buildings, retail spaces, warehouses',
    icon: Building,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    features: ['Higher rental yields', 'Long-term leases', 'Business growth tied returns']
  },
  {
    type: PropertyType.INDUSTRIAL,
    title: 'Industrial',
    description: 'Manufacturing facilities, logistics centers',
    icon: Factory,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    features: ['Triple net leases', 'Stable cash flows', 'Inflation protection']
  },
  {
    type: PropertyType.MIXED_USE,
    title: 'Mixed Use',
    description: 'Properties combining residential and commercial',
    icon: Building2,
    color: 'bg-green-100 text-green-700 border-green-200',
    features: ['Diversified income', 'Reduced vacancy risk', 'Urban development']
  },
  {
    type: PropertyType.LAND,
    title: 'Land',
    description: 'Undeveloped land, agricultural properties',
    icon: TreePine,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    features: ['Development potential', 'Long-term appreciation', 'Tax advantages']
  }
]

const CREATION_FEE_HBAR = '1' // 1 HBAR creation fee

interface PropertyFormData {
  name: string
  symbol: string
  location: string
  description: string
  totalValue: string
  maxTokens: string
  propertyType: PropertyType
  images: File[]
  documents: File[]
  ipfsHash: string
}

const initialFormData: PropertyFormData = {
  name: '',
  symbol: '',
  location: '',
  description: '',
  totalValue: '',
  maxTokens: '',
  propertyType: PropertyType.RESIDENTIAL,
  images: [],
  documents: [],
  ipfsHash: ''
}

export function PropertyTokenization() {
  const [currentStep, setCurrentStep] = useState<'basic-info' | 'property-details' | 'tokenomics' | 'media' | 'review'>('basic-info')
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [estimatedGas, setEstimatedGas] = useState<string>('')

  const { address, isConnected } = useAccount()
  const { isApproved: isKYCApproved, isAccredited } = useUserKYCStatus(address)
  const { deployProperty, isLoading: isDeploying, error: deployError } = usePropertyFactory()
  const paymentFlow = usePaymentTokenPurchaseFlow(
    address,
    CONTRACT_ADDRESSES.PROPERTY_FACTORY as Address,
    parseEther(CREATION_FEE_HBAR)
  )

  const updateFormData = useCallback((updates: Partial<PropertyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  // Mock IPFS upload
  const mockIPFSUpload = useCallback((files: File[]) => {
    // In production, this would upload to IPFS
    const mockHash = `QmProperty${Math.random().toString(36).substring(2, 15)}`
    updateFormData({ ipfsHash: mockHash })
    return mockHash
  }, [updateFormData])

  const handleFileUpload = useCallback((files: File[], type: 'images' | 'documents') => {
    updateFormData({ [type]: [...formData[type], ...files] })

    if (files.length > 0) {
      mockIPFSUpload([...formData.images, ...formData.documents, ...files])
    }
  }, [formData, updateFormData, mockIPFSUpload])

  const handleDrop = useCallback((e: React.DragEvent, type: 'images' | 'documents') => {
    e.preventDefault()
    setDragOver(null)

    const files = Array.from(e.dataTransfer.files)
    handleFileUpload(files, type)
  }, [handleFileUpload])

  const validateStep = (step: string): boolean => {
    switch (step) {
      case 'basic-info':
        return formData.name.trim() !== '' &&
               formData.symbol.trim() !== '' &&
               formData.location.trim() !== ''
      case 'property-details':
        return formData.description.trim() !== '' &&
               formData.propertyType !== undefined
      case 'tokenomics':
        return formData.totalValue.trim() !== '' &&
               formData.maxTokens.trim() !== '' &&
               parseFloat(formData.totalValue) > 0 &&
               parseInt(formData.maxTokens) > 0
      case 'media':
        return formData.images.length > 0 || formData.ipfsHash.trim() !== ''
      case 'review':
        return true
      default:
        return false
    }
  }

  const handleDeployProperty = async () => {
    if (!address || !isConnected) return

    try {
      // Check if approval is needed
      if (paymentFlow.needsApproval(parseEther(CREATION_FEE_HBAR))) {
        await paymentFlow.approveAmount(parseEther(CREATION_FEE_HBAR))
        return
      }

      const tx = await deployProperty(
        formData.name,
        formData.symbol,
        formData.ipfsHash || 'QmDefaultHash',
        formData.totalValue,
        formData.maxTokens,
        formData.propertyType,
        formData.location,
        CONTRACT_ADDRESSES.PAYMENT_TOKEN as Address,
        CREATION_FEE_HBAR
      )

      console.log('Property deployed successfully:', tx)
    } catch (error) {
      console.error('Failed to deploy property:', error)
    }
  }

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'basic-info': return FileText
      case 'property-details': return Building
      case 'tokenomics': return Coins
      case 'media': return Upload
      case 'review': return Shield
      default: return FileText
    }
  }

  if (!isConnected) {
    return (
      <ModernCard variant="glass" className="p-8">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600 mb-6">Connect your wallet to start tokenizing your property</p>
          <Button variant="gradient">
            Connect Wallet
          </Button>
        </div>
      </ModernCard>
    )
  }

  if (!isKYCApproved || !isAccredited) {
    return (
      <ModernCard variant="soft" className="p-8">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">KYC Verification Required</h3>
          <p className="text-gray-600 mb-6">
            You need to complete KYC verification and be approved as an accredited investor to tokenize properties
          </p>
          <Button variant="gradient">
            Complete KYC Verification
          </Button>
        </div>
      </ModernCard>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
        {[
          { key: 'basic-info', label: 'Basic Info' },
          { key: 'property-details', label: 'Property Details' },
          { key: 'tokenomics', label: 'Tokenomics' },
          { key: 'media', label: 'Media & Documents' },
          { key: 'review', label: 'Review & Deploy' }
        ].map((step, index) => {
          const Icon = getStepIcon(step.key)
          const isActive = currentStep === step.key
          const isCompleted = validateStep(step.key) && !isActive
          const isAccessible = index === 0 || validateStep(
            [
              'basic-info', 'property-details', 'tokenomics', 'media', 'review'
            ][index - 1]
          )

          return (
            <div key={step.key} className="flex items-center min-w-0">
              <button
                onClick={() => isAccessible && setCurrentStep(step.key as any)}
                disabled={!isAccessible}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                  isCompleted ? "bg-teal-600 border-teal-600 text-white" :
                  isActive ? "border-teal-600 text-teal-600 bg-white" :
                  isAccessible ? "border-gray-300 text-gray-400 bg-white hover:border-gray-400" :
                  "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </button>

              <div className="ml-3 hidden sm:block min-w-0">
                <p className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  isActive ? "text-teal-600" :
                  isCompleted ? "text-gray-900" :
                  isAccessible ? "text-gray-500" :
                  "text-gray-400"
                )}>
                  {step.label}
                </p>
              </div>

              {index < 4 && (
                <ChevronRight className="w-5 h-5 text-gray-300 mx-4 hidden sm:block" />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 'basic-info' && (
          <motion.div
            key="basic-info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ModernCard variant="soft" hover>
              <ModernCardHeader>
                <ModernCardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Basic Property Information
                </ModernCardTitle>
                <p className="text-gray-600">
                  Provide the fundamental details about your property for tokenization.
                </p>
              </ModernCardHeader>
              <ModernCardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Property Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => updateFormData({ name: e.target.value })}
                      placeholder="e.g., Sunset Hills Residential Complex"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      Choose a descriptive name that investors will recognize
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Token Symbol *
                    </label>
                    <Input
                      value={formData.symbol}
                      onChange={(e) => updateFormData({
                        symbol: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
                      })}
                      placeholder="e.g., SHRC"
                      className="w-full uppercase"
                      maxLength={8}
                    />
                    <p className="text-xs text-gray-500">
                      3-8 characters, used to identify your property tokens
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Property Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.location}
                      onChange={(e) => updateFormData({ location: e.target.value })}
                      placeholder="e.g., 123 Main Street, San Francisco, CA, USA"
                      className="w-full pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Full address including city, state/region, and country
                  </p>
                </div>

                <div className="pt-6 border-t">
                  <Button
                    onClick={() => setCurrentStep('property-details')}
                    disabled={!validateStep('basic-info')}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    size="lg"
                  >
                    Continue to Property Details
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 'property-details' && (
          <motion.div
            key="property-details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Property Details
                </CardTitle>
                <p className="text-gray-600">
                  Describe your property and select its type to help investors understand the investment opportunity.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Property Description *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    placeholder="Describe your property, its features, location benefits, rental potential, and investment highlights..."
                    rows={4}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Provide detailed information that will help investors make informed decisions
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Property Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PROPERTY_TYPES.map((propertyType) => {
                      const Icon = propertyType.icon
                      const isSelected = formData.propertyType === propertyType.type

                      return (
                        <motion.button
                          key={propertyType.type}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updateFormData({ propertyType: propertyType.type })}
                          className={cn(
                            "p-4 rounded-lg border-2 text-left transition-all",
                            isSelected
                              ? "border-teal-500 bg-teal-50 ring-2 ring-teal-500/20"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              isSelected ? propertyType.color : "bg-gray-100 text-gray-600"
                            )}>
                              <Icon className="h-5 w-5" />
                            </div>

                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {propertyType.title}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {propertyType.description}
                              </p>

                              <ul className="space-y-1">
                                {propertyType.features.slice(0, 2).map((feature, idx) => (
                                  <li key={idx} className="flex items-center gap-1 text-xs text-gray-500">
                                    <CheckCircle className="h-3 w-3 text-teal-500" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {isSelected && (
                              <CheckCircle className="h-5 w-5 text-teal-600" />
                            )}
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('basic-info')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep('tokenomics')}
                    disabled={!validateStep('property-details')}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                  >
                    Continue to Tokenomics
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 'tokenomics' && (
          <motion.div
            key="tokenomics"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Tokenomics Configuration
                </CardTitle>
                <p className="text-gray-600">
                  Set the economic parameters for your property tokens, including total value and token supply.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Total Property Value (USD) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        value={formData.totalValue}
                        onChange={(e) => updateFormData({ totalValue: e.target.value })}
                        placeholder="1000000"
                        className="w-full pl-10"
                        min="1"
                        step="1000"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      The total valuation of your property in USD
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Maximum Token Supply *
                    </label>
                    <div className="relative">
                      <Coins className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        value={formData.maxTokens}
                        onChange={(e) => updateFormData({ maxTokens: e.target.value })}
                        placeholder="1000000"
                        className="w-full pl-10"
                        min="1"
                        step="1000"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Total number of tokens that can be issued
                    </p>
                  </div>
                </div>

                {formData.totalValue && formData.maxTokens && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">Token Economics Preview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Token Price:</span>
                        <p className="font-semibold text-blue-900">
                          ${(parseFloat(formData.totalValue) / parseInt(formData.maxTokens)).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-blue-700">Min Investment:</span>
                        <p className="font-semibold text-blue-900">
                          ${Math.max(1, Math.round(parseFloat(formData.totalValue) / parseInt(formData.maxTokens)))}
                        </p>
                      </div>
                      <div>
                        <span className="text-blue-700">Max Investment:</span>
                        <p className="font-semibold text-blue-900">
                          ${Math.round(parseFloat(formData.totalValue) * 0.1).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Important Considerations</h4>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start gap-3">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p>
                        <strong>Token Price:</strong> Each token represents a fractional ownership in your property.
                        The token price is calculated as Total Value ÷ Token Supply.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p>
                        <strong>Revenue Sharing:</strong> Token holders will receive proportional rental income
                        and appreciation based on their token ownership percentage.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <p>
                        <strong>Liquidity:</strong> Tokens can be traded on the secondary marketplace,
                        providing liquidity for investors.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('property-details')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep('media')}
                    disabled={!validateStep('tokenomics')}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                  >
                    Continue to Media Upload
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 'media' && (
          <motion.div
            key="media"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Media & Documents
                </CardTitle>
                <p className="text-gray-600">
                  Upload property images and supporting documents to build investor confidence.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Images Upload */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Property Images</h4>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                      dragOver === 'images'
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                    onDrop={(e) => handleDrop(e, 'images')}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOver('images')
                    }}
                    onDragLeave={() => setDragOver(null)}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Upload Property Images
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Drag and drop your images here, or{' '}
                      <label className="text-teal-600 hover:text-teal-700 cursor-pointer font-medium">
                        browse
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || [])
                            if (files.length > 0) handleFileUpload(files, 'images')
                          }}
                        />
                      </label>
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, or WebP up to 10MB each • Recommended: 1920x1080 or higher
                    </p>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Property ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => {
                              const newImages = formData.images.filter((_, i) => i !== index)
                              updateFormData({ images: newImages })
                            }}
                            className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Documents Upload */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Supporting Documents</h4>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                      dragOver === 'documents'
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                    onDrop={(e) => handleDrop(e, 'documents')}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOver('documents')
                    }}
                    onDragLeave={() => setDragOver(null)}
                  >
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Upload Documents
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Property deeds, inspection reports, financial statements, etc.
                    </p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg cursor-pointer hover:bg-teal-700 transition-colors">
                      <Upload className="h-4 w-4" />
                      Browse Files
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          if (files.length > 0) handleFileUpload(files, 'documents')
                        }}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      PDF, DOC, or DOCX up to 20MB each
                    </p>
                  </div>

                  {formData.documents.length > 0 && (
                    <div className="space-y-2">
                      {formData.documents.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <FileText className="h-5 w-5 text-gray-600" />
                          <span className="text-sm text-gray-700 flex-1">{file.name}</span>
                          <button
                            onClick={() => {
                              const newDocs = formData.documents.filter((_, i) => i !== index)
                              updateFormData({ documents: newDocs })
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* IPFS Hash Display */}
                {formData.ipfsHash && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <p className="font-medium text-blue-900">IPFS Hash Generated</p>
                    </div>
                    <p className="text-sm text-blue-800 font-mono break-all">{formData.ipfsHash}</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Your media and documents are stored on IPFS for decentralized access
                    </p>
                  </div>
                )}

                <div className="pt-6 border-t flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('tokenomics')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep('review')}
                    disabled={!validateStep('media')}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                  >
                    Review & Deploy
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Review & Deploy Property Token
                </CardTitle>
                <p className="text-gray-600">
                  Review all details before deploying your property token to the blockchain.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Property Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Property Information</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <p className="font-medium">{formData.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Symbol:</span>
                        <p className="font-medium">{formData.symbol}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Location:</span>
                        <p className="font-medium">{formData.location}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <p className="font-medium">
                          {PROPERTY_TYPES.find(t => t.type === formData.propertyType)?.title}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Token Economics</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-600">Total Value:</span>
                        <p className="font-medium">${parseInt(formData.totalValue).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Max Tokens:</span>
                        <p className="font-medium">{parseInt(formData.maxTokens).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Token Price:</span>
                        <p className="font-medium">
                          ${(parseFloat(formData.totalValue) / parseInt(formData.maxTokens)).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Creation Fee:</span>
                        <p className="font-medium">{CREATION_FEE_HBAR} HBAR</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Media Summary */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Media & Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Images:</span>
                      <p className="font-medium">{formData.images.length} file(s) uploaded</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Documents:</span>
                      <p className="font-medium">{formData.documents.length} file(s) uploaded</p>
                    </div>
                  </div>
                  {formData.ipfsHash && (
                    <div>
                      <span className="text-gray-600">IPFS Hash:</span>
                      <p className="font-mono text-xs break-all">{formData.ipfsHash}</p>
                    </div>
                  )}
                </div>

                {/* Payment Flow Status */}
                {paymentFlow.needsApproval(parseEther(CREATION_FEE_HBAR)) && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <p className="font-medium text-orange-900">Payment Approval Required</p>
                    </div>
                    <p className="text-sm text-orange-800 mb-3">
                      You need to approve spending of {CREATION_FEE_HBAR} HBAR for the property creation fee.
                    </p>
                    <Button
                      onClick={() => paymentFlow.approveAmount(parseEther(CREATION_FEE_HBAR))}
                      disabled={paymentFlow.isApproving || paymentFlow.isApprovingConfirming}
                      className="bg-orange-600 hover:bg-orange-700"
                      size="sm"
                    >
                      {paymentFlow.isApproving ? 'Preparing...' :
                       paymentFlow.isApprovingConfirming ? 'Confirming...' :
                       'Approve Payment'}
                    </Button>
                  </div>
                )}

                {/* Deployment Cost Estimate */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Deployment Costs</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Property Creation Fee:</span>
                      <span className="font-medium">{CREATION_FEE_HBAR} HBAR</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Gas Fee:</span>
                      <span className="font-medium">~0.1 HBAR</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total Cost:</span>
                      <span>~{parseFloat(CREATION_FEE_HBAR) + 0.1} HBAR</span>
                    </div>
                  </div>
                </div>

                {/* Deploy Button */}
                <div className="pt-6 border-t flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('media')}
                    className="flex-1"
                  >
                    Back to Media
                  </Button>
                  <Button
                    onClick={handleDeployProperty}
                    disabled={
                      isDeploying ||
                      !formData.name ||
                      !formData.symbol ||
                      !formData.totalValue ||
                      !formData.maxTokens ||
                      paymentFlow.needsApproval(parseEther(CREATION_FEE_HBAR))
                    }
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                    size="lg"
                  >
                    {isDeploying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deploying to Blockchain...
                      </>
                    ) : (
                      <>
                        <Building className="mr-2 h-4 w-4" />
                        Deploy Property Token
                      </>
                    )}
                  </Button>
                </div>

                {/* Success/Error Messages */}
                <AnimatePresence>
                  {deployError && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
                    >
                      <AlertCircle className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Deployment Failed</p>
                        <p className="text-sm">Please check your wallet connection and try again.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}