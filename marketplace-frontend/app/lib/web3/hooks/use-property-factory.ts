"use client"

import { useState, useEffect, useCallback } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import { Address, parseEther, formatEther } from 'viem'
import { CONTRACT_ADDRESSES } from '../addresses'
import { PROPERTY_FACTORY_ABI } from '../abi'
import { logError } from '../error-utils'

// =============================================================================
// TYPES
// =============================================================================

export enum PropertyType {
  RESIDENTIAL = 0,
  COMMERCIAL = 1,
  INDUSTRIAL = 2,
  MIXED_USE = 3,
  LAND = 4,
}

export interface PropertyInfo {
  id: number
  name: string
  metadataURI: string
  tokenContract: Address
  totalValue: bigint
  totalSupply: bigint
  pricePerToken: bigint
  isActive: boolean
  creator: Address
  createdAt: bigint
}

export interface CreatePropertyParams {
  name: string
  symbol: string
  maxSupply: string // e.g., "1000" tokens
  pricePerToken: string // e.g., "100" HBAR per token
  location: string // e.g., "New York, USA"
  ipfsURI: string // IPFS hash of property metadata
  propertyType: string // Property type (will be converted to PropertyType enum)
}

export interface DistributeTokensParams {
  propertyId: number
  to: Address
  amount: string // Number of tokens to distribute
}

export interface PurchaseTokensParams {
  propertyId: number
  tokenAmount: string // Number of tokens to purchase
  paymentAmount: string // HBAR to send (calculated: tokens * price)
}

// =============================================================================
// PROPERTY FACTORY HOOK
// =============================================================================

export function usePropertyFactory() {
  const [properties, setProperties] = useState<PropertyInfo[]>([])
  const [isLoadingProperties, setIsLoadingProperties] = useState(true)
  const publicClient = usePublicClient()

  // -------------------------------------------------------------------------
  // READ: Property Count
  // -------------------------------------------------------------------------
  const {
    data: propertyCount,
    refetch: refetchPropertyCount,
    isLoading: isLoadingCount,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.PROPERTY_FACTORY,
    abi: PROPERTY_FACTORY_ABI,
    functionName: 'getPropertyCount',
    query: {
      enabled: CONTRACT_ADDRESSES.PROPERTY_FACTORY !== '0x0000000000000000000000000000000000000000',
    },
  })

  const totalPropertyCount = propertyCount ? Number(propertyCount) : 0

  // -------------------------------------------------------------------------
  // READ: Fetch All Properties
  // -------------------------------------------------------------------------
  const fetchProperties = useCallback(async () => {
    if (!publicClient || !propertyCount || propertyCount === 0n) {
      setProperties([])
      setIsLoadingProperties(false)
      return
    }

    setIsLoadingProperties(true)

    try {
      const count = Number(propertyCount)
      const propertyPromises: Promise<PropertyInfo | null>[] = []

      // Fetch each property individually
      for (let i = 0; i < count; i++) {
        const promise = publicClient
          .readContract({
            address: CONTRACT_ADDRESSES.PROPERTY_FACTORY,
            abi: PROPERTY_FACTORY_ABI,
            functionName: 'getProperty',
            args: [BigInt(i)],
          })
          .then((data: any) => {
            if (!data || !data.tokenContract) return null

            return {
              id: i,
              name: data.name || '',
              metadataURI: data.metadataURI || '',
              tokenContract: data.tokenContract as Address,
              totalValue: BigInt(data.totalValue || 0),
              totalSupply: BigInt(data.totalSupply || 0),
              pricePerToken: BigInt(data.pricePerToken || 0),
              isActive: Boolean(data.isActive),
              creator: data.creator as Address,
              createdAt: BigInt(data.createdAt || 0),
            } as PropertyInfo
          })
          .catch((err) => {
            console.warn(`Failed to fetch property ${i}:`, err)
            return null
          })

        propertyPromises.push(promise)
      }

      const results = await Promise.all(propertyPromises)
      const validProperties = results.filter((p): p is PropertyInfo => p !== null)

      setProperties(validProperties)
    } catch (err) {
      logError('Error fetching properties', err)
      setProperties([])
    } finally {
      setIsLoadingProperties(false)
    }
  }, [publicClient, propertyCount])

  // -------------------------------------------------------------------------
  // READ: Get Single Property
  // -------------------------------------------------------------------------
  const getPropertyById = useCallback(
    (propertyId: number): PropertyInfo | null => {
      return properties.find((p) => p.id === propertyId) || null
    },
    [properties]
  )

  // -------------------------------------------------------------------------
  // READ: Get Active Properties
  // -------------------------------------------------------------------------
  const getActiveProperties = useCallback((): PropertyInfo[] => {
    return properties.filter((p) => p.isActive)
  }, [properties])

  // -------------------------------------------------------------------------
  // WRITE: Create Property
  // -------------------------------------------------------------------------
  const {
    writeContract: createPropertyWrite,
    data: createPropertyHash,
    isPending: isCreatingProperty,
    error: createPropertyError,
  } = useWriteContract()

  const {
    isLoading: isConfirmingCreate,
    isSuccess: isCreateSuccess,
  } = useWaitForTransactionReceipt({
    hash: createPropertyHash,
  })

  const createProperty = useCallback(
    async (params: CreatePropertyParams) => {
      if (CONTRACT_ADDRESSES.PROPERTY_FACTORY === '0x0000000000000000000000000000000000000000') {
        throw new Error('Property Factory contract not configured. Please deploy contracts first.')
      }

      try {
        // Validate inputs
        if (!params.name) {
          throw new Error('Property name is required')
        }

        if (!params.maxSupply || parseFloat(params.maxSupply) <= 0) {
          throw new Error('Max supply must be greater than 0')
        }

        if (!params.pricePerToken || parseFloat(params.pricePerToken) <= 0) {
          throw new Error('Price per token must be greater than 0')
        }

        if (!params.ipfsURI) {
          throw new Error('IPFS URI is required')
        }

        // Note: symbol is auto-generated as PROP{id} by the contract
        // Note: location is stored in IPFS metadata, not as a contract parameter

        // Call createProperty on the smart contract
        // Actual deployed contract signature:
        // function createProperty(
        //   string memory name,
        //   string memory metadataURI,
        //   uint256 totalValue,
        //   uint256 totalSupply,
        //   uint256 pricePerToken
        // ) external onlyPropertyManager whenNotPaused returns (uint256)
        //
        // Note: symbol is auto-generated as "PROP{id}"
        // Note: location should be stored in IPFS metadata, not on-chain

        const totalSupply = parseEther(params.maxSupply)
        const pricePerToken = parseEther(params.pricePerToken)
        const totalValue = (totalSupply * pricePerToken) / parseEther("1")

        createPropertyWrite({
          address: CONTRACT_ADDRESSES.PROPERTY_FACTORY,
          abi: PROPERTY_FACTORY_ABI,
          functionName: 'createProperty',
          args: [
            params.name,              // name
            params.ipfsURI,          // metadataURI
            totalValue,              // totalValue (calculated: totalSupply * pricePerToken)
            totalSupply,             // totalSupply (number of tokens)
            pricePerToken,           // pricePerToken (price per token in wei)
          ],
        })
      } catch (err) {
        logError('Error creating property', err)
        throw err
      }
    },
    [createPropertyWrite]
  )

  // -------------------------------------------------------------------------
  // WRITE: Distribute Tokens
  // -------------------------------------------------------------------------
  const {
    writeContract: distributeTokensWrite,
    data: distributeHash,
    isPending: isDistributing,
    error: distributeError,
  } = useWriteContract()

  const {
    isLoading: isConfirmingDistribute,
    isSuccess: isDistributeSuccess,
  } = useWaitForTransactionReceipt({
    hash: distributeHash,
  })

  const distributeTokens = useCallback(
    async (params: DistributeTokensParams) => {
      if (CONTRACT_ADDRESSES.PROPERTY_FACTORY === '0x0000000000000000000000000000000000000000') {
        throw new Error('Property Factory contract not configured')
      }

      try {
        // Validate inputs
        if (params.propertyId < 0) {
          throw new Error('Invalid property ID')
        }

        if (!params.to || params.to === '0x0000000000000000000000000000000000000000') {
          throw new Error('Invalid recipient address')
        }

        if (!params.amount || parseFloat(params.amount) <= 0) {
          throw new Error('Amount must be greater than 0')
        }

        // Call distributeTokens on the smart contract
        // function distributeTokens(uint256 propertyId, address to, uint256 amount)
        //   external onlyPropertyManager validProperty(propertyId) whenNotPaused

        distributeTokensWrite({
          address: CONTRACT_ADDRESSES.PROPERTY_FACTORY,
          abi: PROPERTY_FACTORY_ABI,
          functionName: 'distributeTokens',
          args: [
            BigInt(params.propertyId),
            params.to,
            parseEther(params.amount), // Convert to wei
          ],
        })
      } catch (err) {
        logError('Error distributing tokens', err)
        throw err
      }
    },
    [distributeTokensWrite]
  )

  // -------------------------------------------------------------------------
  // WRITE: Purchase Tokens
  // -------------------------------------------------------------------------
  const {
    writeContract: purchaseTokensWrite,
    data: purchaseHash,
    isPending: isPurchasing,
    error: purchaseError,
  } = useWriteContract()

  const {
    isLoading: isConfirmingPurchase,
    isSuccess: isPurchaseSuccess,
  } = useWaitForTransactionReceipt({
    hash: purchaseHash,
  })

  const purchaseTokens = useCallback(
    async (params: PurchaseTokensParams) => {
      if (CONTRACT_ADDRESSES.PROPERTY_FACTORY === '0x0000000000000000000000000000000000000000') {
        throw new Error('Property Factory contract not configured')
      }

      try {
        // Validate inputs
        if (params.propertyId < 0) {
          throw new Error('Invalid property ID')
        }

        if (!params.tokenAmount || parseFloat(params.tokenAmount) <= 0) {
          throw new Error('Token amount must be greater than 0')
        }

        if (!params.paymentAmount || parseFloat(params.paymentAmount) <= 0) {
          throw new Error('Payment amount must be greater than 0')
        }

        // Call purchaseTokens on the smart contract
        // function purchaseTokens(uint256 propertyId, uint256 tokenAmount)
        //   external payable validProperty(propertyId) whenNotPaused
        //
        // HEDERA-SPECIFIC: Value conversion happens automatically:
        // 1. parseEther converts HBAR to wei (multiply by 10^18)
        // 2. Hedera converts wei to tinybars (divide by 10^10)
        // 3. Contract receives msg.value in tinybars (10^8 scale)
        // See HEDERA_MSG_VALUE_FINDINGS.md for full details

        purchaseTokensWrite({
          address: CONTRACT_ADDRESSES.PROPERTY_FACTORY,
          abi: PROPERTY_FACTORY_ABI,
          functionName: 'purchaseTokens',
          args: [
            BigInt(params.propertyId),
            parseEther(params.tokenAmount), // Convert to wei
          ],
          value: parseEther(params.paymentAmount), // Send HBAR payment (converted to wei)
        })
      } catch (err) {
        logError('Error purchasing tokens', err)
        throw err
      }
    },
    [purchaseTokensWrite]
  )

  // -------------------------------------------------------------------------
  // EFFECTS
  // -------------------------------------------------------------------------

  // Fetch properties when count changes
  useEffect(() => {
    if (propertyCount !== undefined && propertyCount > 0n) {
      fetchProperties()
    } else {
      setProperties([])
      setIsLoadingProperties(false)
    }
  }, [propertyCount, fetchProperties])

  // Refetch properties after successful create
  useEffect(() => {
    if (isCreateSuccess) {
      // Add delay to allow Hedera RPC to update its state
      // Then force refetch from blockchain (not cache)
      const timer = setTimeout(async () => {
        console.log('Property created successfully, refetching from blockchain...')
        await refetchPropertyCount()
        // fetchProperties will be called automatically when propertyCount updates
      }, 2000) // 2 second delay for Hedera state propagation

      return () => clearTimeout(timer)
    }
  }, [isCreateSuccess, refetchPropertyCount])

  // Refetch properties after successful distribute
  useEffect(() => {
    if (isDistributeSuccess) {
      fetchProperties()
    }
  }, [isDistributeSuccess, fetchProperties])

  // Refetch properties after successful purchase
  useEffect(() => {
    if (isPurchaseSuccess) {
      fetchProperties()
    }
  }, [isPurchaseSuccess, fetchProperties])

  // -------------------------------------------------------------------------
  // RETURN
  // -------------------------------------------------------------------------

  return {
    // Data
    properties,
    propertyCount: totalPropertyCount,
    activeProperties: getActiveProperties(),

    // Loading states
    isLoading: isLoadingCount || isLoadingProperties,
    isLoadingProperties,

    // Create property
    createProperty,
    isCreatingProperty,
    isConfirmingCreate,
    isCreateSuccess,
    createPropertyError,
    createPropertyHash,

    // Distribute tokens
    distributeTokens,
    isDistributing,
    isConfirmingDistribute,
    isDistributeSuccess,
    distributeError,
    distributeHash,

    // Purchase tokens
    purchaseTokens,
    isPurchasing,
    isConfirmingPurchase,
    isPurchaseSuccess,
    purchaseError,
    purchaseHash,

    // Utilities
    fetchProperties,
    refetchPropertyCount,
    getPropertyById,
    getActiveProperties,
  }
}
