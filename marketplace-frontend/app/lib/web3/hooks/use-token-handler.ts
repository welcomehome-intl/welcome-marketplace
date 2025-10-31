"use client"

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { MARKETPLACE_ABI } from '../abi'
import { Address } from 'viem'

// Token Sale Hooks - Updated for new modular architecture
export function useTokenSale(handlerAddress?: Address) {
  const { data: saleData, refetch } = useReadContract({
    address: handlerAddress,
    abi: MARKETPLACE_ABI,
    functionName: 'currentSale',
    query: {
      enabled: !!handlerAddress,
    },
  })

  return {
    sale: saleData ? {
      pricePerToken: saleData[0],
      minPurchase: saleData[1],
      maxPurchase: saleData[2],
      isActive: saleData[3],
      totalSold: saleData[4],
      maxSupply: saleData[5],
    } : null,
    refetch
  }
}

export function usePurchaseTokens(handlerAddress?: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const purchaseTokens = (tokenAmount: bigint) => {
    if (!handlerAddress) {
      throw new Error('Handler address is required for purchasing tokens')
    }
    writeContract({
      address: handlerAddress,
      abi: MARKETPLACE_ABI,
      functionName: 'purchaseTokens',
      args: [tokenAmount],
    })
  }

  return {
    purchaseTokens,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

// Marketplace Hooks
export function useMarketplaceListing(handlerAddress: Address | undefined, listingId: number) {
  const { data: listingData } = useReadContract({
    address: handlerAddress,
    abi: MARKETPLACE_ABI,
    functionName: 'marketplaceListings',
    args: [BigInt(listingId)],
    query: {
      enabled: !!handlerAddress,
    },
  })

  return {
    listing: listingData ? {
      seller: listingData[0],
      amount: listingData[1],
      pricePerToken: listingData[2],
      listingTime: listingData[3],
      isActive: listingData[4],
    } : null
  }
}

export function useNextListingId(handlerAddress?: Address) {
  const { data: nextId } = useReadContract({
    address: handlerAddress,
    abi: MARKETPLACE_ABI,
    functionName: 'nextListingId',
    query: {
      enabled: !!handlerAddress,
    },
  })

  return nextId || 0n
}

export function useListTokens(handlerAddress?: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const listTokens = (amount: bigint, pricePerToken: bigint) => {
    if (!handlerAddress) {
      throw new Error('Handler address is required for listing tokens')
    }
    writeContract({
      address: handlerAddress,
      abi: MARKETPLACE_ABI,
      functionName: 'listTokensForSale',
      args: [amount, pricePerToken],
    })
  }

  return {
    listTokens,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

export function usePurchaseFromMarketplace(handlerAddress?: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const purchaseFromMarketplace = (listingId: bigint, amount: bigint) => {
    if (!handlerAddress) {
      throw new Error('Handler address is required for purchasing from marketplace')
    }
    writeContract({
      address: handlerAddress,
      abi: MARKETPLACE_ABI,
      functionName: 'purchaseFromMarketplace',
      args: [listingId, amount],
    })
  }

  return {
    purchaseFromMarketplace,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

// Staking Hooks
export function useStakingInfo(handlerAddress: Address | undefined, address?: Address) {
  const { data: stakingData, refetch } = useReadContract({
    address: handlerAddress,
    abi: MARKETPLACE_ABI,
    functionName: 'stakingInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: !!(handlerAddress && address),
    },
  })

  return {
    stakingInfo: stakingData ? {
      stakedAmount: stakingData[0],
      stakeTime: stakingData[1],
      lastRewardClaim: stakingData[2],
      totalRewards: stakingData[3],
    } : null,
    refetch
  }
}

export function useStakingRewards(handlerAddress: Address | undefined, address?: Address) {
  const { data: rewards } = useReadContract({
    address: handlerAddress,
    abi: MARKETPLACE_ABI,
    functionName: 'calculateStakingRewards',
    args: address ? [address] : undefined,
    query: {
      enabled: !!(handlerAddress && address),
    },
  })

  return { rewards }
}

export function useStakeTokens(handlerAddress?: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const stakeTokens = (amount: bigint) => {
    if (!handlerAddress) {
      throw new Error('Handler address is required for staking tokens')
    }
    writeContract({
      address: handlerAddress,
      abi: MARKETPLACE_ABI,
      functionName: 'stakeTokens',
      args: [amount],
    })
  }

  return {
    stakeTokens,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

export function useUnstakeTokens(handlerAddress?: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const unstakeTokens = (amount: bigint) => {
    if (!handlerAddress) {
      throw new Error('Handler address is required for unstaking tokens')
    }
    writeContract({
      address: handlerAddress,
      abi: MARKETPLACE_ABI,
      functionName: 'unstakeTokens',
      args: [amount],
    })
  }

  return {
    unstakeTokens,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

// Revenue Distribution Hooks
export function usePropertyRevenue(handlerAddress?: Address) {
  const { data: revenueData, refetch } = useReadContract({
    address: handlerAddress,
    abi: MARKETPLACE_ABI,
    functionName: 'propertyRevenue',
    query: {
      enabled: !!handlerAddress,
    },
  })

  return {
    revenue: revenueData ? {
      totalRevenue: revenueData[0],
      distributedRevenue: revenueData[1],
      revenuePerToken: revenueData[2],
      lastDistribution: revenueData[3],
    } : null,
    refetch
  }
}

export function useClaimableRevenue(handlerAddress: Address | undefined, address?: Address) {
  const { data: claimableAmount, refetch } = useReadContract({
    address: handlerAddress,
    abi: MARKETPLACE_ABI,
    functionName: 'getClaimableRevenue',
    args: address ? [address] : undefined,
    query: {
      enabled: !!(handlerAddress && address),
    },
  })

  return { claimableAmount, refetch }
}

export function useClaimRevenue(handlerAddress?: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const claimRevenue = () => {
    if (!handlerAddress) {
      throw new Error('Handler address is required for claiming revenue')
    }
    writeContract({
      address: handlerAddress,
      abi: MARKETPLACE_ABI,
      functionName: 'claimRevenue',
    })
  }

  return {
    claimRevenue,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

// Access Control Hooks
export function useAccreditedStatus(handlerAddress: Address | undefined, address?: Address) {
  const { data: isAccredited } = useReadContract({
    address: handlerAddress,
    abi: MARKETPLACE_ABI,
    functionName: 'accreditedInvestors',
    args: address ? [address] : undefined,
    query: {
      enabled: !!(handlerAddress && address),
    },
  })

  return { isAccredited }
}