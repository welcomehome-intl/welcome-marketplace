"use client"

import { useState, useEffect, useCallback } from 'react'
import { usePropertyFactory } from '@/app/lib/web3/hooks/use-property-factory'
import { usePropertyManagement } from './use-property-management'
import { EnrichedProperty, PropertyMetadata } from '../types'
import { formatUnits } from 'viem'

export interface BlockchainProperty {
  id: bigint
  name: string
  tokenContract: string
  totalSupply: bigint
  pricePerToken: bigint
  isActive: boolean
  createdAt: bigint
}

export interface EnrichedPropertyDisplay extends Omit<EnrichedProperty, 'metadata'> {
  // Blockchain data
  blockchainId: string
  tokenContract: string
  totalSupply: string // Formatted
  pricePerToken: string // Formatted in HBAR
  isActive: boolean
  availableTokens: string // Formatted
  totalValue: string // Calculated: totalSupply * pricePerToken

  // Supabase metadata
  metadata: PropertyMetadata | null

  // Helper fields
  hasSupabaseData: boolean
}

export function useEnrichedProperties() {
  const [enrichedProperties, setEnrichedProperties] = useState<EnrichedPropertyDisplay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { properties: blockchainProperties, isLoading: isLoadingBlockchain } = usePropertyFactory()
  const { listProperties: listSupabaseProperties } = usePropertyManagement()

  const enrichProperties = useCallback(async () => {
    if (isLoadingBlockchain || !blockchainProperties || blockchainProperties.length === 0) {
      setEnrichedProperties([])
      setIsLoading(isLoadingBlockchain)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch all Supabase properties
      const supabaseProperties = await listSupabaseProperties()

      // Create a map of contract address -> supabase data
      const supabaseMap = new Map(
        supabaseProperties.map(prop => [prop.contract_address.toLowerCase(), prop])
      )

      // Merge blockchain and Supabase data
      const enriched: EnrichedPropertyDisplay[] = blockchainProperties.map(blockchainProp => {
        const supabaseData = supabaseMap.get(blockchainProp.tokenContract.toLowerCase())

        // Calculate available tokens (for now, use total supply - in future, fetch from contract)
        const totalSupplyFormatted = formatUnits(blockchainProp.totalSupply, 18)
        const pricePerTokenFormatted = formatUnits(blockchainProp.pricePerToken, 18)
        const totalValue = (parseFloat(totalSupplyFormatted) * parseFloat(pricePerTokenFormatted)).toString()

        return {
          // Database fields (from Supabase or defaults)
          id: supabaseData?.id || '',
          contract_address: blockchainProp.tokenContract,
          name: supabaseData?.name || blockchainProp.name,
          description: supabaseData?.description || null,
          location: supabaseData?.location || null,
          images: supabaseData?.images || [],
          documents: supabaseData?.documents || null,
          metadata: (supabaseData?.metadata as PropertyMetadata) || null,
          property_type: supabaseData?.property_type || null,
          size_value: supabaseData?.size_value || null,
          size_unit: supabaseData?.size_unit || null,
          status: supabaseData?.status || null,
          amenities: supabaseData?.amenities || null,
          featured_image_index: supabaseData?.featured_image_index || null,
          created_at: supabaseData?.created_at || new Date(Number(blockchainProp.createdAt) * 1000).toISOString(),

          // Blockchain data
          blockchainId: blockchainProp.id.toString(),
          tokenContract: blockchainProp.tokenContract,
          totalSupply: totalSupplyFormatted,
          pricePerToken: pricePerTokenFormatted,
          isActive: blockchainProp.isActive,
          availableTokens: totalSupplyFormatted, // TODO: Fetch actual available from contract
          totalValue,

          // Helper
          hasSupabaseData: !!supabaseData,
        }
      })

      setEnrichedProperties(enriched)
    } catch (err) {
      console.error('Error enriching properties:', err)
      setError(err instanceof Error ? err.message : 'Failed to load properties')
      setEnrichedProperties([])
    } finally {
      setIsLoading(false)
    }
  }, [blockchainProperties, isLoadingBlockchain, listSupabaseProperties])

  // Enrich properties whenever blockchain properties change
  useEffect(() => {
    enrichProperties()
  }, [enrichProperties])

  const getPropertyByContract = useCallback(
    (contractAddress: string): EnrichedPropertyDisplay | undefined => {
      return enrichedProperties.find(
        prop => prop.contract_address.toLowerCase() === contractAddress.toLowerCase()
      )
    },
    [enrichedProperties]
  )

  const getPropertyById = useCallback(
    (blockchainId: string): EnrichedPropertyDisplay | undefined => {
      return enrichedProperties.find(prop => prop.blockchainId === blockchainId)
    },
    [enrichedProperties]
  )

  return {
    properties: enrichedProperties,
    isLoading,
    error,
    refetch: enrichProperties,
    getPropertyByContract,
    getPropertyById,
  }
}

// Hook for getting a single enriched property
export function useEnrichedProperty(contractAddress: string) {
  const [property, setProperty] = useState<EnrichedPropertyDisplay | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { getProperty: getSupabaseProperty } = usePropertyManagement()
  const { properties: blockchainProperties } = usePropertyFactory()

  const fetchProperty = useCallback(async () => {
    if (!contractAddress) {
      setProperty(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Find blockchain property
      const blockchainProp = blockchainProperties.find(
        p => p.tokenContract.toLowerCase() === contractAddress.toLowerCase()
      )

      if (!blockchainProp) {
        throw new Error('Property not found on blockchain')
      }

      // Fetch Supabase data
      const supabaseData = await getSupabaseProperty(contractAddress)

      // Merge data
      const totalSupplyFormatted = formatUnits(blockchainProp.totalSupply, 18)
      const pricePerTokenFormatted = formatUnits(blockchainProp.pricePerToken, 18)
      const totalValue = (parseFloat(totalSupplyFormatted) * parseFloat(pricePerTokenFormatted)).toString()

      const enriched: EnrichedPropertyDisplay = {
        // Database fields
        id: supabaseData?.id || '',
        contract_address: blockchainProp.tokenContract,
        name: supabaseData?.name || blockchainProp.name,
        description: supabaseData?.description || null,
        location: supabaseData?.location || null,
        images: supabaseData?.images || [],
        documents: supabaseData?.documents || null,
        metadata: (supabaseData?.metadata as PropertyMetadata) || null,
        property_type: supabaseData?.property_type || null,
        size_value: supabaseData?.size_value || null,
        size_unit: supabaseData?.size_unit || null,
        status: supabaseData?.status || null,
        amenities: supabaseData?.amenities || null,
        featured_image_index: supabaseData?.featured_image_index || null,
        created_at: supabaseData?.created_at || new Date(Number(blockchainProp.createdAt) * 1000).toISOString(),

        // Blockchain data
        blockchainId: blockchainProp.id.toString(),
        tokenContract: blockchainProp.tokenContract,
        totalSupply: totalSupplyFormatted,
        pricePerToken: pricePerTokenFormatted,
        isActive: blockchainProp.isActive,
        availableTokens: totalSupplyFormatted,
        totalValue,

        // Helper
        hasSupabaseData: !!supabaseData,
      }

      setProperty(enriched)
    } catch (err) {
      console.error('Error fetching enriched property:', err)
      setError(err instanceof Error ? err.message : 'Failed to load property')
      setProperty(null)
    } finally {
      setIsLoading(false)
    }
  }, [contractAddress, blockchainProperties, getSupabaseProperty])

  useEffect(() => {
    fetchProperty()
  }, [fetchProperty])

  return {
    property,
    isLoading,
    error,
    refetch: fetchProperty,
  }
}
