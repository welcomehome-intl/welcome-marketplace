/**
 * Hook to fetch user's token balance for a specific PropertyToken
 * Uses wagmi to read balanceOf(address) from the ERC20 token contract
 */

import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { Address } from 'viem'

// Minimal ERC20 ABI for balanceOf
const ERC20_BALANCE_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

interface UsePropertyTokenBalanceParams {
  tokenAddress: Address | undefined
  userAddress: Address | undefined
  enabled?: boolean
}

interface UsePropertyTokenBalanceResult {
  balance: bigint | undefined
  balanceFormatted: string
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Fetch user's balance for a specific PropertyToken contract
 *
 * @param tokenAddress - Address of the PropertyToken (ERC20) contract
 * @param userAddress - Address of the user to check balance for
 * @param enabled - Whether to enable the query (default: true if addresses provided)
 * @returns User's token balance and loading state
 */
export function usePropertyTokenBalance({
  tokenAddress,
  userAddress,
  enabled = true,
}: UsePropertyTokenBalanceParams): UsePropertyTokenBalanceResult {
  const {
    data: balance,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: tokenAddress,
    abi: ERC20_BALANCE_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: enabled && !!tokenAddress && !!userAddress,
      // Refetch every 10 seconds to keep balances fresh
      refetchInterval: 10000,
    },
  })

  const balanceFormatted = balance ? formatEther(balance) : '0'

  return {
    balance,
    balanceFormatted,
    isLoading,
    error: error as Error | null,
    refetch,
  }
}

/**
 * Fetch balances for multiple PropertyTokens at once
 * Useful for portfolio overview where user owns multiple properties
 */
export function useMultipleTokenBalances({
  tokenAddresses,
  userAddress,
  enabled = true,
}: {
  tokenAddresses: Address[]
  userAddress: Address | undefined
  enabled?: boolean
}): {
  balances: Record<Address, UsePropertyTokenBalanceResult>
  isLoading: boolean
  refetchAll: () => void
} {
  // Create a result object to store all balances
  const balances: Record<Address, UsePropertyTokenBalanceResult> = {}
  let anyLoading = false
  const refetchFns: Array<() => void> = []

  // Use individual hooks for each token address
  // This is OK because the array length is stable (React hooks rules)
  tokenAddresses.forEach((tokenAddress) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const result = usePropertyTokenBalance({
      tokenAddress,
      userAddress,
      enabled,
    })

    balances[tokenAddress] = result
    if (result.isLoading) anyLoading = true
    refetchFns.push(result.refetch)
  })

  const refetchAll = () => {
    refetchFns.forEach((refetch) => refetch())
  }

  return {
    balances,
    isLoading: anyLoading,
    refetchAll,
  }
}
