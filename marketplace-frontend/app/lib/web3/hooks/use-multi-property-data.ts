"use client"

import { useEffect, useState, useCallback } from 'react'
import { usePublicClient, useAccount } from 'wagmi'
import { Address, formatUnits } from 'viem'
import { usePropertyFactory, PropertyInfo } from './use-property-factory'
import { MARKETPLACE_ABI, PROPERTY_TOKEN_ABI } from '../abi'
import { supabase } from '../../supabase/client'
import { logError } from '../error-utils'

export interface ExtendedPropertyData extends PropertyInfo {
  // Additional data from smart contracts
  currentPrice: bigint
  totalSupply: bigint
  saleInfo?: {
    pricePerToken: bigint
    minPurchase: bigint
    maxPurchase: bigint
    isActive: boolean
    totalSold: bigint
    maxSupply: bigint
  }

  // Data from Supabase
  metadata?: {
    description?: string
    images?: string[]
    documents?: string[]
    propertyDetails?: any
  }

  // Calculated fields
  tokensSold: bigint
  tokensAvailable: bigint
  marketCap: bigint
  isVerified: boolean
}

export interface PropertyStats {
  totalProperties: number
  totalMarketCap: bigint
  averagePrice: bigint
  activeProperties: number
  totalTokensIssued: bigint
  totalTokensSold: bigint
}

export function useMultiPropertyData() {
  const [propertiesData, setPropertiesData] = useState<ExtendedPropertyData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const publicClient = usePublicClient()
  const { properties: rawProperties, isLoading: factoryLoading, error: factoryError } = usePropertyFactory()

  const enrichPropertiesData = useCallback(async (properties: PropertyInfo[]): Promise<ExtendedPropertyData[]> => {
    if (!publicClient || properties.length === 0) return []

    const enrichedProperties: ExtendedPropertyData[] = []

    for (const property of properties) {
      try {
        // Get token data from property token contract
        let totalSupply = BigInt(0)
        let currentPrice = BigInt(0)

        try {
          // Get total supply from token contract
          totalSupply = await publicClient.readContract({
            address: property.tokenContract,
            abi: PROPERTY_TOKEN_ABI,
            functionName: 'totalSupply',
          }) as bigint

          // Get current sale info from handler contract
          const saleInfo = await publicClient.readContract({
            address: property.handlerContract,
            abi: MARKETPLACE_ABI,
            functionName: 'currentSale',
          }) as [bigint, bigint, bigint, boolean, bigint, bigint]

          currentPrice = saleInfo[0] // pricePerToken

          // Get metadata from Supabase (if available)
          let dbProperty = null
          if (supabase) {
            const { data, error: dbError } = await supabase
              .from('properties')
              .select('*')
              .eq('contract_address', property.tokenContract.toLowerCase())
              .single()

            if (dbError && dbError.code !== 'PGRST116') {
              console.warn(`Database error for property ${property.id}:`, dbError)
            }
            dbProperty = data
          }

          const enrichedProperty: ExtendedPropertyData = {
            ...property,
            totalSupply,
            currentPrice,
            saleInfo: {
              pricePerToken: saleInfo[0],
              minPurchase: saleInfo[1],
              maxPurchase: saleInfo[2],
              isActive: saleInfo[3],
              totalSold: saleInfo[4],
              maxSupply: saleInfo[5],
            },
            metadata: dbProperty ? {
              description: dbProperty.description,
              images: dbProperty.images,
              documents: dbProperty.documents,
              propertyDetails: dbProperty.metadata,
            } : undefined,
            tokensSold: saleInfo[4],
            tokensAvailable: property.maxTokens - saleInfo[4],
            marketCap: totalSupply * currentPrice,
            isVerified: dbProperty?.is_verified || false,
          }

          enrichedProperties.push(enrichedProperty)

        } catch (contractError) {
          console.warn(`Failed to enrich property ${property.id} data:`, contractError)

          // Add property with minimal data if contract calls fail
          enrichedProperties.push({
            ...property,
            totalSupply: BigInt(0),
            currentPrice: BigInt(0),
            tokensSold: BigInt(0),
            tokensAvailable: property.maxTokens,
            marketCap: BigInt(0),
            isVerified: false,
          })
        }

      } catch (err) {
        logError(`Error enriching property ${property.id}`, err)
      }
    }

    return enrichedProperties
  }, [publicClient])

  // Fetch and enrich all properties data
  const fetchPropertiesData = useCallback(async () => {
    if (factoryLoading) return
    if (factoryError) {
      setError(factoryError)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const enrichedData = await enrichPropertiesData(rawProperties)
      setPropertiesData(enrichedData)
    } catch (err) {
      logError('Error fetching properties data', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch properties data')
    } finally {
      setIsLoading(false)
    }
  }, [rawProperties, factoryLoading, factoryError, enrichPropertiesData])

  // Get single property data
  const getPropertyData = useCallback((propertyId: number): ExtendedPropertyData | null => {
    return propertiesData.find(p => p.id === propertyId) || null
  }, [propertiesData])

  // Get active properties only
  const getActiveProperties = useCallback((): ExtendedPropertyData[] => {
    return propertiesData.filter(p => p.isActive)
  }, [propertiesData])

  // Get properties by type
  const getPropertiesByType = useCallback((propertyType: number): ExtendedPropertyData[] => {
    return propertiesData.filter(p => p.propertyType === propertyType)
  }, [propertiesData])

  // Get user's properties (where they are creators)
  const getUserProperties = useCallback((userAddress: Address): ExtendedPropertyData[] => {
    return propertiesData.filter(p => p.creator.toLowerCase() === userAddress.toLowerCase())
  }, [propertiesData])

  // Calculate overall statistics
  const calculateStats = useCallback((): PropertyStats => {
    const activeProps = propertiesData.filter(p => p.isActive)

    const totalMarketCap = propertiesData.reduce((sum, p) => sum + p.marketCap, BigInt(0))
    const averagePrice = propertiesData.length > 0
      ? propertiesData.reduce((sum, p) => sum + p.currentPrice, BigInt(0)) / BigInt(propertiesData.length)
      : BigInt(0)
    const totalTokensIssued = propertiesData.reduce((sum, p) => sum + p.totalSupply, BigInt(0))
    const totalTokensSold = propertiesData.reduce((sum, p) => sum + p.tokensSold, BigInt(0))

    return {
      totalProperties: propertiesData.length,
      totalMarketCap,
      averagePrice,
      activeProperties: activeProps.length,
      totalTokensIssued,
      totalTokensSold,
    }
  }, [propertiesData])

  // Search properties
  const searchProperties = useCallback((query: string): ExtendedPropertyData[] => {
    if (!query.trim()) return propertiesData

    const lowercaseQuery = query.toLowerCase()
    return propertiesData.filter(p =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.location.toLowerCase().includes(lowercaseQuery) ||
      p.symbol.toLowerCase().includes(lowercaseQuery) ||
      p.metadata?.description?.toLowerCase().includes(lowercaseQuery)
    )
  }, [propertiesData])

  // Sort properties
  const sortProperties = useCallback((
    sortBy: 'name' | 'price' | 'marketCap' | 'tokensAvailable' | 'createdAt',
    order: 'asc' | 'desc' = 'desc'
  ): ExtendedPropertyData[] => {
    return [...propertiesData].sort((a, b) => {
      let aVal: any, bVal: any

      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'price':
          aVal = Number(a.currentPrice)
          bVal = Number(b.currentPrice)
          break
        case 'marketCap':
          aVal = Number(a.marketCap)
          bVal = Number(b.marketCap)
          break
        case 'tokensAvailable':
          aVal = Number(a.tokensAvailable)
          bVal = Number(b.tokensAvailable)
          break
        case 'createdAt':
          aVal = Number(a.createdAt)
          bVal = Number(b.createdAt)
          break
        default:
          return 0
      }

      if (aVal < bVal) return order === 'asc' ? -1 : 1
      if (aVal > bVal) return order === 'asc' ? 1 : -1
      return 0
    })
  }, [propertiesData])

  // Sync property data with database (if available)
  const syncWithDatabase = useCallback(async (propertyData: ExtendedPropertyData) => {
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('properties')
        .upsert({
          property_id: propertyData.id,
          contract_address: propertyData.tokenContract.toLowerCase(),
          handler_address: propertyData.handlerContract.toLowerCase(),
          name: propertyData.name,
          symbol: propertyData.symbol,
          ipfs_hash: propertyData.ipfsHash,
          total_value: Number(formatUnits(propertyData.totalValue, 18)),
          max_tokens: Number(formatUnits(propertyData.maxTokens, 18)),
          property_type: ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'MIXED_USE', 'LAND'][propertyData.propertyType],
          creator_address: propertyData.creator.toLowerCase(),
          is_active: propertyData.isActive,
          location: JSON.parse(propertyData.location || '{}'),
          metadata: propertyData.metadata,
        }, {
          onConflict: 'property_id'
        })

      if (error) {
        console.warn('Failed to sync property with database:', error)
      }
    } catch (err) {
      logError('Error syncing property with database', err)
    }
  }, [])

  // Initialize and update data when raw properties change
  useEffect(() => {
    fetchPropertiesData()
  }, [fetchPropertiesData])

  // Sync new properties with database
  useEffect(() => {
    propertiesData.forEach(property => {
      syncWithDatabase(property)
    })
  }, [propertiesData, syncWithDatabase])

  return {
    properties: propertiesData,
    isLoading: isLoading || factoryLoading,
    error: error || factoryError,

    // Data access methods
    getPropertyData,
    getActiveProperties,
    getPropertiesByType,
    getUserProperties,

    // Utility methods
    searchProperties,
    sortProperties,
    calculateStats,

    // Data refresh
    refetch: fetchPropertiesData,
  }
}