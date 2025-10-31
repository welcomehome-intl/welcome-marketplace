"use client"

import { useEffect, useState, useCallback } from 'react'
import { usePublicClient, useAccount } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../config'
import { MARKETPLACE_ABI, PROPERTY_TOKEN_ABI } from '../abi'
import { Address, formatUnits } from 'viem'
import { Property } from '@/app/types/web3'

export interface PropertyData {
  id: string
  name: string
  location: string
  description: string
  totalSupply: bigint
  currentPrice: bigint
  contractAddress: Address
  isActive: boolean
  imageUrl: string
  metadataUri: string
}

export function usePropertyData() {
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const publicClient = usePublicClient()

  const fetchPropertyData = useCallback(async () => {
    if (!publicClient) return

    setIsLoading(true)
    setError(null)

    try {
      // Verify contract addresses exist
      if (CONTRACT_ADDRESSES.PROPERTY_TOKEN === '0x0000000000000000000000000000000000000000') {
        throw new Error('Property token address not configured')
      }

      // Get basic token info from the PropertyToken contract with error handling
      let name = 'Unknown Property'
      let symbol = 'UNK'
      let totalSupply = BigInt(0)
      let decimals = 18

      try {
        const tokenInfo = await Promise.allSettled([
          publicClient.readContract({
            address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
            abi: PROPERTY_TOKEN_ABI,
            functionName: 'name',
          }),
          publicClient.readContract({
            address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
            abi: PROPERTY_TOKEN_ABI,
            functionName: 'symbol',
          }),
          publicClient.readContract({
            address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
            abi: PROPERTY_TOKEN_ABI,
            functionName: 'totalSupply',
          }),
          publicClient.readContract({
            address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
            abi: PROPERTY_TOKEN_ABI,
            functionName: 'decimals',
          }),
        ])

        if (tokenInfo[0].status === 'fulfilled') name = tokenInfo[0].value as string
        if (tokenInfo[1].status === 'fulfilled') symbol = tokenInfo[1].value as string
        if (tokenInfo[2].status === 'fulfilled') totalSupply = tokenInfo[2].value as bigint
        if (tokenInfo[3].status === 'fulfilled') decimals = tokenInfo[3].value as number
      } catch (tokenError) {
        console.warn('Failed to fetch token info, using defaults:', tokenError)
      }

      // Get sale info from PropertyTokenHandler (replaces getTokenPrice)
      let currentPrice = BigInt(0)
      try {
        const saleInfo = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.PROPERTY_MANAGER as Address,
          abi: MARKETPLACE_ABI,
          functionName: 'currentSale',
        })

        // currentSale returns: [pricePerToken, minPurchase, maxPurchase, isActive, totalSold, maxSupply]
        if (saleInfo && Array.isArray(saleInfo)) {
          currentPrice = saleInfo[0] as bigint
        }
      } catch (saleError) {
        console.warn('Failed to fetch sale info, using default price:', saleError)
        currentPrice = BigInt('1000000000000000000') // Default 1 ETH
      }

      // Check if property is initialized
      let isInitialized = false
      try {
        isInitialized = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
          abi: PROPERTY_TOKEN_ABI,
          functionName: 'propertyInitialized',
        }) as boolean
      } catch (initError) {
        console.warn('Failed to check property initialization:', initError)
      }

      // For now, we have one main property from the contract
      // In a multi-property system, this would be an array
      const propertyData: PropertyData = {
        id: '1',
        name: name || 'Welcome Home Property',
        location: 'Nairobi, Kenya', // This would come from metadata/off-chain data
        description: 'Tokenized real estate property managed by Welcome Home Property platform',
        totalSupply: totalSupply,
        currentPrice: currentPrice,
        contractAddress: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
        isActive: isInitialized,
        imageUrl: '/property1.jpg', // This would come from IPFS metadata
        metadataUri: 'ipfs://QmExample...', // This would be stored in contract or off-chain
      }

      setProperties([propertyData])
    } catch (err) {
      console.error('Error fetching property data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch property data from contracts')
    } finally {
      setIsLoading(false)
    }
  }, [publicClient])

  useEffect(() => {
    fetchPropertyData()
  }, [fetchPropertyData])

  return {
    properties,
    isLoading,
    error,
    refetch: fetchPropertyData,
  }
}

// Hook to get individual property details
export function usePropertyDetails(propertyId?: string) {
  const [property, setProperty] = useState<PropertyData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { properties } = usePropertyData()

  useEffect(() => {
    if (!propertyId || properties.length === 0) {
      setProperty(null)
      return
    }

    setIsLoading(true)
    const foundProperty = properties.find(p => p.id === propertyId)
    setProperty(foundProperty || null)
    setError(foundProperty ? null : 'Property not found')
    setIsLoading(false)
  }, [propertyId, properties])

  return {
    property,
    isLoading,
    error,
  }
}

// Hook for property statistics
export function usePropertyStats() {
  const { properties, isLoading, error } = usePropertyData()
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalSupply: BigInt(0),
    averagePrice: BigInt(0),
    activeProperties: 0,
  })

  useEffect(() => {
    if (properties.length === 0) return

    const totalProperties = properties.length
    const totalSupply = properties.reduce((sum, prop) => sum + prop.totalSupply, BigInt(0))
    const averagePrice = properties.length > 0
      ? properties.reduce((sum, prop) => sum + prop.currentPrice, BigInt(0)) / BigInt(properties.length)
      : BigInt(0)
    const activeProperties = properties.filter(prop => prop.isActive).length

    setStats({
      totalProperties,
      totalSupply,
      averagePrice,
      activeProperties,
    })
  }, [properties])

  return {
    stats,
    isLoading,
    error,
  }
}