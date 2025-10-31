"use client"

import { useState, useEffect, useCallback } from 'react'
import { usePropertyFactory, PropertyInfo } from './use-property-factory'
import { supabase } from '@/app/lib/supabase/client'
import { Property as SupabaseProperty } from '@/app/lib/supabase/types'
import { formatEther } from 'viem'

/**
 * Auto Property Listing Fetch Hook
 *
 * Automatically fetches and merges property data from:
 * - Blockchain (PropertyFactory contract)
 * - Supabase (off-chain metadata, images, documents)
 *
 * Features:
 * - Auto-fetches on mount
 * - Merges on-chain + off-chain data
 * - Real-time updates via Supabase subscriptions
 * - Caching for fast access
 */

export interface EnrichedPropertyInfo extends PropertyInfo {
  // Supabase metadata
  description?: string | null
  images?: string[]
  documents?: { name: string; url: string }[]
  metadata?: Record<string, any>

  // Computed fields
  totalValueUSD?: string
  pricePerTokenFormatted?: string
  maxSupplyFormatted?: string
  availableTokens?: bigint
  soldPercentage?: number
}

export function useAutoFetchProperties() {
  const {
    properties: blockchainProperties,
    propertyCount,
    isLoading: isLoadingBlockchain,
    fetchProperties: refetchBlockchain,
    refetchPropertyCount,
  } = usePropertyFactory()

  const [enrichedProperties, setEnrichedProperties] = useState<EnrichedPropertyInfo[]>([])
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // -------------------------------------------------------------------------
  // Fetch Supabase Metadata
  // -------------------------------------------------------------------------
  const fetchSupabaseMetadata = useCallback(async () => {
    if (blockchainProperties.length === 0) {
      setEnrichedProperties([])
      return
    }

    setIsLoadingMetadata(true)
    setError(null)

    try {
      // Get contract addresses from blockchain properties
      const contractAddresses = blockchainProperties.map(p => p.tokenContract.toLowerCase())

      // Fetch metadata from Supabase
      const { data: supabaseProperties, error: supabaseError } = await supabase
        .from('properties')
        .select('*')
        .in('contract_address', contractAddresses)

      if (supabaseError) {
        throw supabaseError
      }

      // Create a map for quick lookup
      const metadataMap = new Map<string, SupabaseProperty>()
      supabaseProperties?.forEach(prop => {
        metadataMap.set(prop.contract_address.toLowerCase(), prop)
      })

      // Merge blockchain data with Supabase metadata
      const enriched: EnrichedPropertyInfo[] = blockchainProperties.map(blockchainProp => {
        const metadata = metadataMap.get(blockchainProp.tokenContract.toLowerCase())

        // Parse images and documents from JSONB
        const images = metadata?.images
          ? Array.isArray(metadata.images)
            ? (metadata.images as any[]).map(img => typeof img === 'string' ? img : img.url)
            : []
          : []

        const documents = metadata?.documents
          ? Array.isArray(metadata.documents)
            ? (metadata.documents as any[])
            : []
          : []

        // Format values for display
        const pricePerTokenFormatted = formatEther(blockchainProp.pricePerToken)
        const maxSupplyFormatted = formatEther(blockchainProp.totalSupply)

        // Calculate available tokens (this is simplified - in reality you'd fetch from contract)
        const availableTokens = blockchainProp.totalSupply
        const soldPercentage = 0 // TODO: Calculate from actual sales data

        return {
          ...blockchainProp,
          description: metadata?.description || null,
          images,
          documents,
          metadata: metadata?.metadata as Record<string, any> | undefined,
          pricePerTokenFormatted,
          maxSupplyFormatted,
          availableTokens,
          soldPercentage,
        }
      })

      setEnrichedProperties(enriched)

    } catch (err) {
      console.error('Error fetching property metadata:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch metadata')

      // Fallback to blockchain data only
      setEnrichedProperties(blockchainProperties as EnrichedPropertyInfo[])
    } finally {
      setIsLoadingMetadata(false)
    }
  }, [blockchainProperties])

  // -------------------------------------------------------------------------
  // Auto-Fetch on Blockchain Data Change
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isLoadingBlockchain && blockchainProperties.length > 0) {
      fetchSupabaseMetadata()
    } else if (!isLoadingBlockchain && blockchainProperties.length === 0) {
      setEnrichedProperties([])
    }
  }, [blockchainProperties, isLoadingBlockchain, fetchSupabaseMetadata])

  // -------------------------------------------------------------------------
  // Real-Time Updates via Supabase Subscriptions
  // -------------------------------------------------------------------------
  useEffect(() => {
    // Subscribe to property changes in Supabase
    const channel = supabase
      .channel('properties-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'properties',
        },
        (payload) => {
          console.log('Property metadata changed:', payload)

          // Refetch metadata when changes occur
          fetchSupabaseMetadata()
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSupabaseMetadata])

  // -------------------------------------------------------------------------
  // Filter Functions
  // -------------------------------------------------------------------------
  const getActiveProperties = useCallback((): EnrichedPropertyInfo[] => {
    return enrichedProperties.filter(p => p.isActive)
  }, [enrichedProperties])

  const getPropertyById = useCallback(
    (id: number): EnrichedPropertyInfo | null => {
      return enrichedProperties.find(p => p.id === id) || null
    },
    [enrichedProperties]
  )

  // Location filtering removed - location not stored on-chain
  // Use Supabase metadata description field for location info if needed

  const getPropertiesByPriceRange = useCallback(
    (minPrice: string, maxPrice: string): EnrichedPropertyInfo[] => {
      const min = parseFloat(minPrice)
      const max = parseFloat(maxPrice)

      return enrichedProperties.filter(p => {
        const price = parseFloat(p.pricePerTokenFormatted || '0')
        return price >= min && price <= max
      })
    },
    [enrichedProperties]
  )

  // -------------------------------------------------------------------------
  // Refresh Function
  // -------------------------------------------------------------------------
  const refresh = useCallback(async () => {
    // Call refetchPropertyCount to force a fresh blockchain read
    // This will trigger fetchProperties automatically via useEffect
    // fetchSupabaseMetadata will then be called automatically
    await refetchPropertyCount()
  }, [refetchPropertyCount])

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------
  return {
    // Data
    properties: enrichedProperties,
    activeProperties: getActiveProperties(),
    propertyCount,

    // Loading states
    isLoading: isLoadingBlockchain || isLoadingMetadata,
    isLoadingBlockchain,
    isLoadingMetadata,
    error,

    // Utilities
    getPropertyById,
    getActiveProperties,
    getPropertiesByPriceRange,
    refresh,
    refetchBlockchain,
    fetchSupabaseMetadata,
  }
}

/**
 * Hook for fetching a single property with enriched data
 */
export function useEnrichedProperty(propertyId: number) {
  const { properties, isLoading, error, refresh } = useAutoFetchProperties()

  const property = properties.find(p => p.id === propertyId) || null

  return {
    property,
    isLoading,
    error,
    refresh,
  }
}

/**
 * Hook for property search and filtering
 */
export function usePropertySearch() {
  const {
    properties,
    isLoading,
    getPropertiesByPriceRange,
  } = useAutoFetchProperties()

  const [searchQuery, setSearchQuery] = useState('')
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: '0',
    max: '1000000',
  })

  // Search and filter properties
  const filteredProperties = properties.filter(p => {
    // Text search (name and description only - no location on-chain)
    const matchesSearch = searchQuery
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true

    // Price range filter
    const price = parseFloat(p.pricePerTokenFormatted || '0')
    const matchesPrice =
      price >= parseFloat(priceRange.min) && price <= parseFloat(priceRange.max)

    return matchesSearch && matchesPrice
  })

  return {
    properties: filteredProperties,
    allProperties: properties,
    isLoading,
    searchQuery,
    setSearchQuery,
    priceRange,
    setPriceRange,
  }
}
