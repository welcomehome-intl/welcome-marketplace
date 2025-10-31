"use client"

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Badge } from '@/app/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { AlertTriangle, CheckCircle, Loader2, ShoppingCart, Shield } from 'lucide-react'
import { EnrichedPropertyDisplay } from '@/app/lib/supabase/hooks/use-enriched-properties'
import { usePropertyFactory } from '@/app/lib/web3/hooks/use-property-factory'
import { useUserRoles } from '@/app/lib/web3/hooks/use-roles'
import { CONTRACT_ADDRESSES } from '@/app/lib/web3/addresses'

interface PurchaseFormProps {
  property: EnrichedPropertyDisplay | null
}

export function PurchaseForm({ property }: PurchaseFormProps) {
  const { address, isConnected } = useAccount()
  const { hasPropertyManagerRole } = useUserRoles(address)

  // Purchase state (for regular users)
  const [purchaseQuantity, setPurchaseQuantity] = useState('')
  const [purchaseStep, setPurchaseStep] = useState<'idle' | 'purchasing' | 'success' | 'error'>('idle')
  const [purchaseErrorMessage, setPurchaseErrorMessage] = useState('')

  // Distribution state (for property managers)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [distributeQuantity, setDistributeQuantity] = useState('')
  const [distributeStep, setDistributeStep] = useState<'idle' | 'distributing' | 'success' | 'error'>('idle')
  const [distributeErrorMessage, setDistributeErrorMessage] = useState('')

  const {
    purchaseTokens,
    isPurchasing,
    isConfirmingPurchase,
    isPurchaseSuccess,
    purchaseError,
    purchaseHash,
    distributeTokens,
    isDistributing,
    isConfirmingDistribute,
    isDistributeSuccess,
    distributeError,
    distributeHash,
  } = usePropertyFactory()

  // Calculate total cost for purchase
  const pricePerToken = property?.pricePerToken || '0'
  const purchaseTotalCost = purchaseQuantity && !isNaN(parseFloat(purchaseQuantity))
    ? (parseFloat(purchaseQuantity) * parseFloat(pricePerToken)).toFixed(4)
    : '0'

  // Calculate total cost for distribution
  const distributeTotalCost = distributeQuantity && !isNaN(parseFloat(distributeQuantity))
    ? (parseFloat(distributeQuantity) * parseFloat(pricePerToken)).toFixed(4)
    : '0'

  // Handle user token purchase
  const handlePurchase = async () => {
    if (!property || !address || !isConnected) {
      setPurchaseErrorMessage('Please connect your wallet first')
      return
    }

    if (!purchaseQuantity || parseFloat(purchaseQuantity) <= 0) {
      setPurchaseErrorMessage('Please enter a valid token quantity')
      return
    }

    if (parseFloat(purchaseQuantity) > parseFloat(property.availableTokens || '0')) {
      setPurchaseErrorMessage('Quantity exceeds available supply')
      return
    }

    try {
      setPurchaseErrorMessage('')
      setPurchaseStep('purchasing')

      await purchaseTokens({
        propertyId: Number(property.blockchainId),
        tokenAmount: purchaseQuantity,
        paymentAmount: purchaseTotalCost,
      })

    } catch (err: any) {
      console.error('Purchase error:', err)
      setPurchaseStep('error')
      setPurchaseErrorMessage(err.message || 'Token purchase failed')
    }
  }

  // Handle admin token distribution
  const handleDistribute = async () => {
    if (!property || !address || !isConnected) {
      setDistributeErrorMessage('Please connect your wallet first')
      return
    }

    if (!hasPropertyManagerRole) {
      setDistributeErrorMessage('Only property managers can distribute tokens')
      return
    }

    if (!recipientAddress || recipientAddress.trim() === '') {
      setDistributeErrorMessage('Please enter recipient address')
      return
    }

    if (!distributeQuantity || parseFloat(distributeQuantity) <= 0) {
      setDistributeErrorMessage('Please enter a valid token quantity')
      return
    }

    if (parseFloat(distributeQuantity) > parseFloat(property.availableTokens || '0')) {
      setDistributeErrorMessage('Quantity exceeds available supply')
      return
    }

    try {
      setDistributeErrorMessage('')
      setDistributeStep('distributing')

      await distributeTokens({
        propertyId: Number(property.blockchainId),
        to: recipientAddress as `0x${string}`,
        amount: distributeQuantity,
      })

    } catch (err: any) {
      console.error('Distribution error:', err)
      setDistributeStep('error')
      setDistributeErrorMessage(err.message || 'Token distribution failed')
    }
  }

  // Watch for purchase success
  useEffect(() => {
    if (isPurchaseSuccess && purchaseStep === 'purchasing') {
      setPurchaseStep('success')
      setPurchaseQuantity('')
    }
  }, [isPurchaseSuccess, purchaseStep])

  // Watch for purchase errors
  useEffect(() => {
    if (purchaseError) {
      setPurchaseStep('error')
      setPurchaseErrorMessage(purchaseError.message || 'Purchase failed')
    }
  }, [purchaseError])

  // Watch for distribute success
  useEffect(() => {
    if (isDistributeSuccess && distributeStep === 'distributing') {
      setDistributeStep('success')
      setDistributeQuantity('')
      setRecipientAddress('')
    }
  }, [isDistributeSuccess, distributeStep])

  // Watch for distribute errors
  useEffect(() => {
    if (distributeError) {
      setDistributeStep('error')
      setDistributeErrorMessage(distributeError.message || 'Distribution failed')
    }
  }, [distributeError])

  if (!property) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Property Selected</h3>
          <p className="text-gray-600">Select a property to purchase tokens</p>
        </CardContent>
      </Card>
    )
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Purchase Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 bg-yellow-50 rounded-lg">
            <p className="text-yellow-800">Please connect your wallet to purchase tokens</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Property managers see both tabs
  if (hasPropertyManagerRole) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Token Management
          </CardTitle>
          <p className="text-sm text-gray-600">
            Purchase tokens or distribute to investors
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="purchase" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="purchase">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Purchase
              </TabsTrigger>
              <TabsTrigger value="distribute">
                <Shield className="h-4 w-4 mr-2" />
                Distribute
              </TabsTrigger>
            </TabsList>

            {/* Purchase Tab */}
            <TabsContent value="purchase" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purchase-quantity">Number of Tokens</Label>
                <Input
                  id="purchase-quantity"
                  type="number"
                  min="1"
                  max={property.availableTokens}
                  step="1"
                  placeholder="Enter quantity"
                  value={purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(e.target.value)}
                  disabled={purchaseStep !== 'idle' && purchaseStep !== 'error'}
                />
                <p className="text-xs text-gray-500">
                  Max available: {parseFloat(property.availableTokens).toLocaleString()} tokens
                </p>
              </div>

              {/* Price Calculation */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Price per Token</span>
                  <span className="font-semibold">{pricePerToken} HBAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Quantity</span>
                  <span className="font-semibold">{purchaseQuantity || 0}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Cost</span>
                    <span className="text-lg font-bold text-blue-600">{purchaseTotalCost} HBAR</span>
                  </div>
                </div>
              </div>

              {/* Purchase Status */}
              {purchaseStep === 'purchasing' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <div>
                      <p className="font-medium">Processing Purchase</p>
                      <p className="text-sm">Please confirm the transaction in your wallet</p>
                    </div>
                  </div>
                </div>
              )}

              {purchaseStep === 'success' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Purchase Successful!</p>
                      <p className="text-sm">{purchaseQuantity} tokens purchased</p>
                      {purchaseHash && (
                        <p className="text-xs mt-1 font-mono">
                          Tx: {purchaseHash.slice(0, 10)}...{purchaseHash.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {purchaseStep === 'error' && purchaseErrorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Purchase Failed</p>
                      <p className="text-sm">{purchaseErrorMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Purchase Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handlePurchase}
                disabled={
                  !purchaseQuantity ||
                  parseFloat(purchaseQuantity) <= 0 ||
                  purchaseStep === 'purchasing'
                }
              >
                {purchaseStep === 'purchasing' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Purchasing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Purchase Tokens
                  </>
                )}
              </Button>

              {purchaseStep === 'success' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setPurchaseStep('idle')
                    setPurchaseErrorMessage('')
                  }}
                >
                  Purchase More
                </Button>
              )}
            </TabsContent>

            {/* Distribution Tab */}
            <TabsContent value="distribute" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  type="text"
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  disabled={distributeStep !== 'idle' && distributeStep !== 'error'}
                />
                <p className="text-xs text-gray-500">
                  Recipient must be KYC-verified
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="distribute-quantity">Number of Tokens</Label>
                <Input
                  id="distribute-quantity"
                  type="number"
                  min="1"
                  max={property.availableTokens}
                  step="1"
                  placeholder="Enter quantity"
                  value={distributeQuantity}
                  onChange={(e) => setDistributeQuantity(e.target.value)}
                  disabled={distributeStep !== 'idle' && distributeStep !== 'error'}
                />
                <p className="text-xs text-gray-500">
                  Max available: {parseFloat(property.availableTokens).toLocaleString()} tokens
                </p>
              </div>

              {/* Price Info */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Price per Token</span>
                  <span className="font-semibold">{pricePerToken} HBAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Quantity</span>
                  <span className="font-semibold">{distributeQuantity || 0}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Value</span>
                    <span className="text-lg font-bold">{distributeTotalCost} HBAR</span>
                  </div>
                </div>
              </div>

              {/* Distribution Status */}
              {distributeStep === 'distributing' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <div>
                      <p className="font-medium">Distributing Tokens</p>
                      <p className="text-sm">Please confirm the transaction in your wallet</p>
                    </div>
                  </div>
                </div>
              )}

              {distributeStep === 'success' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Distribution Successful!</p>
                      <p className="text-sm">Tokens distributed to {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}</p>
                      {distributeHash && (
                        <p className="text-xs mt-1 font-mono">
                          Tx: {distributeHash.slice(0, 10)}...{distributeHash.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {distributeStep === 'error' && distributeErrorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Distribution Failed</p>
                      <p className="text-sm">{distributeErrorMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Distribute Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleDistribute}
                disabled={
                  !recipientAddress ||
                  !distributeQuantity ||
                  parseFloat(distributeQuantity) <= 0 ||
                  distributeStep === 'distributing'
                }
              >
                {distributeStep === 'distributing' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Distributing...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Distribute Tokens
                  </>
                )}
              </Button>

              {distributeStep === 'success' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setDistributeStep('idle')
                    setDistributeErrorMessage('')
                  }}
                >
                  Distribute More
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    )
  }

  // Regular users see purchase-only interface
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          Purchase Tokens
        </CardTitle>
        <p className="text-sm text-gray-600">
          Buy property tokens with HBAR
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Token Quantity Input */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Number of Tokens</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            max={property.availableTokens}
            step="1"
            placeholder="Enter quantity"
            value={purchaseQuantity}
            onChange={(e) => setPurchaseQuantity(e.target.value)}
            disabled={purchaseStep !== 'idle' && purchaseStep !== 'error'}
          />
          <p className="text-xs text-gray-500">
            Max available: {parseFloat(property.availableTokens).toLocaleString()} tokens
          </p>
        </div>

        {/* Price Calculation */}
        <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Price per Token</span>
            <span className="font-semibold">{pricePerToken} HBAR</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Quantity</span>
            <span className="font-semibold">{purchaseQuantity || 0}</span>
          </div>
          <div className="border-t border-blue-200 pt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Total Cost</span>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{purchaseTotalCost} HBAR</p>
                <p className="text-xs text-gray-500">Includes exact payment required</p>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Status */}
        {purchaseStep === 'purchasing' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <Loader2 className="h-5 w-5 animate-spin" />
              <div>
                <p className="font-medium">Processing Purchase</p>
                <p className="text-sm">Please confirm the transaction in your wallet</p>
              </div>
            </div>
          </div>
        )}

        {purchaseStep === 'success' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Purchase Successful!</p>
                <p className="text-sm">You now own {purchaseQuantity} tokens</p>
                {purchaseHash && (
                  <a
                    href={`https://hashscan.io/testnet/transaction/${purchaseHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs mt-1 font-mono text-blue-600 hover:underline block"
                  >
                    View on HashScan →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {purchaseStep === 'error' && purchaseErrorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Purchase Failed</p>
                <p className="text-sm">{purchaseErrorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handlePurchase}
          disabled={
            !purchaseQuantity ||
            parseFloat(purchaseQuantity) <= 0 ||
            purchaseStep === 'purchasing'
          }
        >
          {purchaseStep === 'purchasing' ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Purchasing...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Purchase Tokens for {purchaseTotalCost} HBAR
            </>
          )}
        </Button>

        {purchaseStep === 'success' && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setPurchaseStep('idle')
              setPurchaseErrorMessage('')
            }}
          >
            Purchase More Tokens
          </Button>
        )}

        {/* Info */}
        <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium text-gray-700 mb-2">How it works:</p>
          <p>• You must be KYC-verified to purchase tokens</p>
          <p>• Payment sent directly to property creator</p>
          <p>• Tokens transferred instantly to your wallet</p>
          <p>• Transaction confirms on Hedera in ~3 seconds</p>
        </div>
      </CardContent>
    </Card>
  )
}
