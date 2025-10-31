"use client"

import { useState, useEffect, useCallback } from 'react'
import { Property, Transaction } from '../types/web3'
import { usePropertyData } from '../lib/web3/hooks/use-property-data'
import { formatUnits } from 'viem'
import { usePurchaseTokens, useSellTokens } from '../lib/web3/hooks/use-token-handler'

export function useProperties() {
  const { properties: contractProperties, isLoading, error: contractError } = usePropertyData()
  const [properties, setProperties] = useState<Property[]>([])

  // Convert contract data to Property interface
  useEffect(() => {
    const convertedProperties: Property[] = contractProperties.map(contractProp => ({
      id: contractProp.id,
      name: contractProp.name,
      location: contractProp.location,
      description: contractProp.description,
      totalSupply: Number(formatUnits(contractProp.totalSupply, 18)),
      pricePerToken: Number(formatUnits(contractProp.currentPrice, 18)),
      currentPrice: Number(formatUnits(contractProp.currentPrice, 18)),
      imageUrl: contractProp.imageUrl,
      metadataUri: contractProp.metadataUri,
      contractAddress: contractProp.contractAddress,
      tokenStandard: 'ERC-20' as const,
      isActive: contractProp.isActive,
      createdAt: new Date(), // Would come from contract events in full implementation
    }))
    setProperties(convertedProperties)
  }, [contractProperties])

  const fetchProperties = useCallback(async () => {
    // This is now handled by the usePropertyData hook
    // Just a placeholder for backward compatibility
  }, [])

  const getProperty = useCallback(async (propertyId: string): Promise<Property | null> => {
    return properties.find(p => p.id === propertyId) || null
  }, [properties])

  const { purchaseTokens: contractPurchase, isPending: purchasePending } = usePurchaseTokens()

  const purchaseTokens = useCallback(async (
    propertyId: string,
    tokenAmount: number,
    paymentToken: string = 'HBAR'
  ): Promise<Transaction> => {
    const property = await getProperty(propertyId)
    if (!property) {
      throw new Error('Property not found')
    }

    try {
      // Use the actual smart contract function
      const hash = await contractPurchase(BigInt(Math.floor(tokenAmount * 1e18)))

      const transaction: Transaction = {
        id: Date.now().toString(),
        hash: hash || '0x0000000000000000000000000000000000000000000000000000000000000000',
        propertyId,
        propertyName: property.name,
        type: 'buy',
        amount: tokenAmount * property.pricePerToken,
        tokenAmount,
        pricePerToken: property.pricePerToken,
        from: '0x0000000000000000000000000000000000000000',
        to: property.contractAddress,
        status: 'pending',
        timestamp: new Date(),
      }

      return transaction
    } catch (err) {
      throw new Error(`Purchase failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [getProperty, contractPurchase])

  const { sellTokens: contractSell, isPending: sellPending } = useSellTokens()

  const sellTokens = useCallback(async (
    propertyId: string,
    tokenAmount: number
  ): Promise<Transaction> => {
    const property = await getProperty(propertyId)
    if (!property) {
      throw new Error('Property not found')
    }

    try {
      // Use the actual smart contract function
      const hash = await contractSell(BigInt(Math.floor(tokenAmount * 1e18)))

      const transaction: Transaction = {
        id: Date.now().toString(),
        hash: hash || '0x0000000000000000000000000000000000000000000000000000000000000000',
        propertyId,
        propertyName: property.name,
        type: 'sell',
        amount: tokenAmount * property.currentPrice,
        tokenAmount,
        pricePerToken: property.currentPrice,
        from: property.contractAddress,
        to: '0x0000000000000000000000000000000000000000',
        status: 'pending',
        timestamp: new Date(),
      }

      return transaction
    } catch (err) {
      throw new Error(`Sale failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [getProperty, contractSell])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  return {
    properties,
    loading: isLoading,
    error: contractError,
    fetchProperties,
    getProperty,
    purchaseTokens,
    sellTokens,
    purchasePending,
    sellPending,
  }
}