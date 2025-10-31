"use client"

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../config'
import { PROPERTY_TOKEN_ABI } from '../abi'
import { Address } from 'viem'

// Read hooks for property token data
export function useTokenInfo() {
  const { data: name } = useReadContract({
    address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'name',
  })

  const { data: symbol } = useReadContract({
    address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'symbol',
  })

  const { data: decimals } = useReadContract({
    address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'decimals',
  })

  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'totalSupply',
  })

  const { data: maxTokens } = useReadContract({
    address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'maxTokens',
  })

  const { data: remainingTokens } = useReadContract({
    address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'getRemainingTokens',
  })

  return {
    name,
    symbol,
    decimals,
    totalSupply,
    maxTokens,
    remainingTokens,
  }
}

export function useTokenBalance(address?: Address) {
  const { data: balance, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return { balance, refetch }
}

export function usePropertyStatus() {
  const { data: isInitialized } = useReadContract({
    address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'propertyInitialized',
  })

  const { data: isPaused } = useReadContract({
    address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'paused',
  })

  return {
    isInitialized,
    isPaused,
  }
}

export function useMintCooldown(address?: Address) {
  const { data: cooldownRemaining } = useReadContract({
    address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'getMintCooldownRemaining',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return { cooldownRemaining }
}

// Write hooks for token operations
export function useMintTokens() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const mint = (to: Address, amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'mint',
      args: [to, amount],
    })
  }

  return {
    mint,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

export function useBurnTokens() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const burn = (amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'burn',
      args: [amount],
    })
  }

  const burnFrom = (account: Address, amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'burnFrom',
      args: [account, amount],
    })
  }

  return {
    burn,
    burnFrom,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

export function useConnectProperty() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const connectProperty = (propertyAddress: Address, transactionId: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'connectToProperty',
      args: [propertyAddress, transactionId],
    })
  }

  return {
    connectProperty,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

export function useSetMaxTokens() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const setMaxTokens = (maxTokens: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'setMaxTokens',
      args: [maxTokens],
    })
  }

  return {
    setMaxTokens,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

// Hook that matches the expected interface for property browser
export function usePropertyToken(contractAddress?: Address) {
  const getTokenInfo = async () => {
    // For now, return basic info since the component already has property data
    // This can be enhanced to fetch dynamic token info from the specific contract
    return {
      name: 'Property Token',
      symbol: 'PROP',
      totalSupply: '0',
      maxTokens: '1000000',
    }
  }

  return {
    getTokenInfo,
  }
}

export function usePauseContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const pause = () => {
    writeContract({
      address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'pause',
    })
  }

  const unpause = () => {
    writeContract({
      address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'unpause',
    })
  }

  return {
    pause,
    unpause,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}