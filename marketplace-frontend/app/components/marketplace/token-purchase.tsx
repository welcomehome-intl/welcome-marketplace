"use client"

import { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { formatUnits, parseUnits } from 'viem'
import { useAccount } from 'wagmi'
import { useTokenSale, usePurchaseTokens } from '@/app/lib/web3/hooks/use-token-handler'
import { useTokenBalance } from '@/app/lib/web3/hooks/use-property-token'
import { useUserKYCStatus } from '@/app/lib/web3/hooks/use-kyc-registry'
import { Coins, TrendingUp, AlertCircle, CheckCircle, Building2, FileText } from 'lucide-react'
import { PropertyInfo } from '@/app/lib/web3/hooks/use-property-factory'
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

interface TokenPurchaseProps {
  selectedProperty?: PropertyInfo | null
}

export function TokenPurchase({ selectedProperty }: TokenPurchaseProps) {
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const { address, isConnected } = useAccount()
  const { sale } = useTokenSale()
  const { purchaseTokens, isPending, isConfirming, isConfirmed, error } = usePurchaseTokens()
  const { balance, refetch: refetchBalance } = useTokenBalance(address)
  const { status, isApproved, isAccredited, record, canPurchase } = useUserKYCStatus(address)

  const handlePurchase = () => {
    if (!purchaseAmount || !sale) return

    try {
      const amount = parseUnits(purchaseAmount, 18) // Assuming 18 decimals
      purchaseTokens(amount)
    } catch (err) {
      console.error('Error purchasing tokens:', err)
    }
  }

  const calculateCost = () => {
    if (!purchaseAmount || !sale) return '0'
    try {
      const amount = parseUnits(purchaseAmount, 18)
      const cost = (amount * sale.pricePerToken) / BigInt(10**18)
      return formatUnits(cost, 18)
    } catch {
      return '0'
    }
  }

  const isValidAmount = () => {
    if (!purchaseAmount || !sale) return false
    try {
      const amount = parseUnits(purchaseAmount, 18)
      return amount >= sale.minPurchase && amount <= sale.maxPurchase
    } catch {
      return false
    }
  }

  if (!selectedProperty) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Select a Property</h3>
          <p className="text-gray-600">Choose a property from the browse tab to purchase tokens</p>
        </div>
      </Card>
    )
  }

  if (!isConnected) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Coins className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Connect your wallet to purchase tokens</p>
        </div>
      </Card>
    )
  }

  if (!canPurchase) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
          <h3 className="text-lg font-semibold mb-2">KYC Verification Required</h3>
          <div className="space-y-3">
            {!isApproved && (
              <div className="text-gray-600">
                <p className="mb-2">Your KYC application status:</p>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                    {status === 0 ? 'Not Submitted' :
                     status === 1 ? 'Pending Review' :
                     status === 3 ? 'Denied' :
                     status === 4 ? 'Expired' : 'Unknown'}
                  </span>
                </div>
                {status === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Submit your KYC documents to start investing
                  </p>
                )}
                {status === 1 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Your application is being reviewed by our team
                  </p>
                )}
                {status === 3 && record?.rejectionReason && (
                  <p className="text-sm text-red-600 mt-2">
                    Reason: {record.rejectionReason}
                  </p>
                )}
              </div>
            )}
            {isApproved && !isAccredited && (
              <div className="text-gray-600">
                <p className="mb-2">KYC approved, but accredited investor status required</p>
                <p className="text-sm text-gray-500">
                  Contact administrators for accredited investor verification
                </p>
              </div>
            )}
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={() => window.location.href = '/kyc'}
              >
                <FileText className="h-4 w-4" />
                {status === 0 ? 'Submit KYC Application' : 'View KYC Status'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (!sale || !sale.isActive) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Active Sale</h3>
          <p className="text-gray-600">There is no token sale currently active.</p>
        </div>
      </Card>
    )
  }

  const propertyImage = PROPERTY_IMAGES[selectedProperty.id % PROPERTY_IMAGES.length]

  return (
    <Card className="p-0 overflow-hidden">
      {/* Property Image Header */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={propertyImage}
          alt={selectedProperty.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-2xl font-bold mb-1">{selectedProperty.name}</h3>
          <p className="text-white/90 mb-2">{selectedProperty.location}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              {selectedProperty.symbol}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              ${parseFloat(formatUnits(selectedProperty.totalValue, 18)).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Purchase Tokens</h3>
          <p className="text-gray-600">Buy property tokens directly from the primary sale</p>
        </div>

        {/* Sale Information */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-blue-900 mb-3">Sale Details</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-blue-700">Price per Token:</span>
              <span className="font-medium text-blue-900">
                ${parseFloat(formatUnits(sale.pricePerToken, 18)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Min Purchase:</span>
              <span className="font-medium text-blue-900">
                {parseFloat(formatUnits(sale.minPurchase, 18)).toLocaleString()} tokens
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Max Purchase:</span>
              <span className="font-medium text-blue-900">
                {parseFloat(formatUnits(sale.maxPurchase, 18)).toLocaleString()} tokens
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Available:</span>
              <span className="font-medium text-blue-900">
                {parseFloat(formatUnits(sale.maxSupply - sale.totalSold, 18)).toLocaleString()} tokens
              </span>
            </div>
          </div>
        </div>

        {/* Purchase Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Tokens
          </label>
          <Input
            type="number"
            value={purchaseAmount}
            onChange={(e) => setPurchaseAmount(e.target.value)}
            placeholder="Enter amount"
            min="0"
            step="0.000000000000000001"
          />
          {purchaseAmount && !isValidAmount() && (
            <p className="text-red-500 text-sm mt-1">
              Amount must be between {sale.minPurchase ? formatUnits(sale.minPurchase, 18) : '0'} and {sale.maxPurchase ? formatUnits(sale.maxPurchase, 18) : '0'} tokens
            </p>
          )}
        </div>

        {/* Cost Calculation */}
        {purchaseAmount && isValidAmount() && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Cost:</span>
              <span className="font-semibold text-lg">{calculateCost()} HBAR</span>
            </div>
          </div>
        )}

        {/* Current Balance */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Your Token Balance:</span>
          <span>{balance ? formatUnits(balance, 18) : '0'} tokens</span>
        </div>

        {/* Purchase Button */}
        <Button
          onClick={handlePurchase}
          disabled={!purchaseAmount || !isValidAmount() || isPending || isConfirming}
          className="w-full"
          size="lg"
        >
          {isPending ? 'Confirming...' :
           isConfirming ? 'Processing...' :
           'Purchase Tokens'}
        </Button>

        {/* Transaction Status */}
        {isConfirmed && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Purchase successful! Your tokens have been minted.</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Transaction failed. Please try again.</span>
          </div>
        )}
        </div>
      </div>
    </Card>
  )
}