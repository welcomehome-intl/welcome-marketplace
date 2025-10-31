"use client"

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../config'
import { ACCESS_CONTROL_ABI } from '../abi'
import { Address } from 'viem'

export function useUserRoles(address?: Address) {
  // Query AccessControl contract for admin and property manager roles
  const { data: hasAdminRole } = useReadContract({
    address: CONTRACT_ADDRESSES.ACCESS_CONTROL as Address,
    abi: ACCESS_CONTROL_ABI,
    functionName: 'isUserAdmin',
    args: [address as Address],
    query: {
      enabled: !!address,
    },
  })

  const { data: hasPropertyManagerRole } = useReadContract({
    address: CONTRACT_ADDRESSES.ACCESS_CONTROL as Address,
    abi: ACCESS_CONTROL_ABI,
    functionName: 'isUserPropertyManager',
    args: [address as Address],
    query: {
      enabled: !!address,
    },
  })

  return {
    hasAdminRole: !!hasAdminRole,
    hasPropertyManagerRole: !!hasPropertyManagerRole,
    // Legacy role fields (for backward compatibility)
    hasMinterRole: false,
    hasPauserRole: false,
    isManager: !!(hasPropertyManagerRole || hasAdminRole),
  }
}

export function useRoleManagement() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const grantRole = (role: string, account: Address) => {
    writeContract({
      address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'grantRole',
      args: [role as `0x${string}`, account],
    })
  }

  const revokeRole = (role: string, account: Address) => {
    writeContract({
      address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'revokeRole',
      args: [role as `0x${string}`, account],
    })
  }

  const grantMinterRole = (account: Address) => grantRole(CONTRACT_ROLES.MINTER_ROLE, account)
  const revokeMinterRole = (account: Address) => revokeRole(CONTRACT_ROLES.MINTER_ROLE, account)

  const grantPauserRole = (account: Address) => grantRole(CONTRACT_ROLES.PAUSER_ROLE, account)
  const revokePauserRole = (account: Address) => revokeRole(CONTRACT_ROLES.PAUSER_ROLE, account)

  const grantPropertyManagerRole = (account: Address) => grantRole(CONTRACT_ROLES.PROPERTY_MANAGER_ROLE, account)
  const revokePropertyManagerRole = (account: Address) => revokeRole(CONTRACT_ROLES.PROPERTY_MANAGER_ROLE, account)

  return {
    grantRole,
    revokeRole,
    grantMinterRole,
    revokeMinterRole,
    grantPauserRole,
    revokePauserRole,
    grantPropertyManagerRole,
    revokePropertyManagerRole,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}