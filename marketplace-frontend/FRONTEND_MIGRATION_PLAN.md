# Welcome Home Frontend Migration Plan

## Executive Summary

The frontend application at `/home/mrima/welcomehome` is currently incompatible with the newly deployed smart contract architecture. This document provides a comprehensive migration plan to align the frontend with the correct contract addresses, ABIs, and architectural patterns.

## Current State Analysis

### ✅ Smart Contracts (Deployed and Working)
- **Payment Token**: `0x17F78C6f9F22356838d4A5fF1E1f9413B575D207`
- **KYC Registry**: `0x7570dF6b166fF2A173DcFC699ca48F0F8bCBc701`
- **Ownership Registry**: `0x25eFAcD45224F995933aAc701dDE3D7Fb25012D8`
- **Property Factory**: `0x53FeF62106b142022951309A55a3552d1426BBd1`
- **Property Governance**: `0x0dd79160Ea9358a2F7440f369C5977CE168018b5`
- **Demo Property Token**: `0x6a883E83BF436872a455Db1A55e00477D7517174`
- **Demo Token Handler**: `0xA0f36ed1D2723aC7674035B4cEe489851176D827`

### ❌ Frontend Issues (Critical)
1. **Wrong Contract Addresses**: Environment variables point to old, non-existent contracts
2. **Outdated ABIs**: Function signatures don't match deployed contracts
3. **Architecture Mismatch**: Frontend expects monolithic structure, contracts are modular
4. **Missing Integrations**: No hooks for KYC Registry, Ownership Registry, or Factory
5. **Token Purchase Flow**: Unit calculation errors (base units vs wei units)

---

## DETAILED MIGRATION PLAN

## Phase 1: Contract Configuration Update

### 1.1 Update Environment Variables

**File**: `/home/mrima/welcomehome/.env.local`

**REPLACE ALL CONTRACT ADDRESSES:**
```bash
# OLD (Remove these lines):
NEXT_PUBLIC_PROPERTY_TOKEN_ADDRESS=0xA4469cCf38cc88bA64c9d570692872c5c2A13aF7
NEXT_PUBLIC_PROPERTY_MANAGER_ADDRESS=0x71d91F4Ad42aa2f1A118dE372247630D8C3f30cb
NEXT_PUBLIC_PROPERTY_FACTORY_ADDRESS=0x710d1E7F345CA3D893511743A00De2cFC1eAb6De
NEXT_PUBLIC_GOVERNANCE_ADDRESS=0x75A63900FF55F27975005FB8299e3C1b42e28dD6
NEXT_PUBLIC_PROPERTY_GOVERNANCE_ADDRESS=0x75A63900FF55F27975005FB8299e3C1b42e28dD6

# NEW (Add these lines):
NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS=0x17F78C6f9F22356838d4A5fF1E1f9413B575D207
NEXT_PUBLIC_KYC_REGISTRY_ADDRESS=0x7570dF6b166fF2A173DcFC699ca48F0F8bCBc701
NEXT_PUBLIC_OWNERSHIP_REGISTRY_ADDRESS=0x25eFAcD45224F995933aAc701dDE3D7Fb25012D8
NEXT_PUBLIC_PROPERTY_FACTORY_ADDRESS=0x53FeF62106b142022951309A55a3552d1426BBd1
NEXT_PUBLIC_PROPERTY_GOVERNANCE_ADDRESS=0x0dd79160Ea9358a2F7440f369C5977CE168018b5
NEXT_PUBLIC_DEMO_PROPERTY_TOKEN_ADDRESS=0x6a883E83BF436872a455Db1A55e00477D7517174
NEXT_PUBLIC_DEMO_TOKEN_HANDLER_ADDRESS=0xA0f36ed1D2723aC7674035B4cEe489851176D827

# Also add missing registry addresses that weren't exposed before:
NEXT_PUBLIC_OWNERSHIP_REGISTRY=0x25eFAcD45224F995933aAc701dDE3D7Fb25012D8
NEXT_PUBLIC_KYC_REGISTRY=0x7570dF6b166fF2A173DcFC699ca48F0F8bCBc701
```

### 1.2 Update Web3 Configuration

**File**: `/home/mrima/welcomehome/app/lib/web3/config.ts`

**REPLACE CONTRACT_ADDRESSES object entirely:**
```typescript
// Replace lines 50-58 with:
export const CONTRACT_ADDRESSES = {
  // Core contracts
  PAYMENT_TOKEN: process.env.NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS || '0x17F78C6f9F22356838d4A5fF1E1f9413B575D207',
  KYC_REGISTRY: process.env.NEXT_PUBLIC_KYC_REGISTRY_ADDRESS || '0x7570dF6b166fF2A173DcFC699ca48F0F8bCBc701',
  OWNERSHIP_REGISTRY: process.env.NEXT_PUBLIC_OWNERSHIP_REGISTRY_ADDRESS || '0x25eFAcD45224F995933aAc701dDE3D7Fb25012D8',
  PROPERTY_FACTORY: process.env.NEXT_PUBLIC_PROPERTY_FACTORY_ADDRESS || '0x53FeF62106b142022951309A55a3552d1426BBd1',
  PROPERTY_GOVERNANCE: process.env.NEXT_PUBLIC_PROPERTY_GOVERNANCE_ADDRESS || '0x0dd79160Ea9358a2F7440f369C5977CE168018b5',

  // Demo contracts (for initial testing)
  DEMO_PROPERTY_TOKEN: process.env.NEXT_PUBLIC_DEMO_PROPERTY_TOKEN_ADDRESS || '0x6a883E83BF436872a455Db1A55e00477D7517174',
  DEMO_TOKEN_HANDLER: process.env.NEXT_PUBLIC_DEMO_TOKEN_HANDLER_ADDRESS || '0xA0f36ed1D2723aC7674035B4cEe489851176D827',

  // Legacy aliases (for backward compatibility during migration)
  PROPERTY_TOKEN: process.env.NEXT_PUBLIC_DEMO_PROPERTY_TOKEN_ADDRESS || '0x6a883E83BF436872a455Db1A55e00477D7517174',
  PROPERTY_MANAGER: process.env.NEXT_PUBLIC_DEMO_TOKEN_HANDLER_ADDRESS || '0xA0f36ed1D2723aC7674035B4cEe489851176D827',
} as const
```

---

## Phase 2: ABI Updates

### 2.1 Generate Current ABIs from Smart Contracts

**CRITICAL**: The current ABIs in `/home/mrima/welcomehome/app/lib/web3/abi.ts` are outdated.

**Action Required**:
1. Extract ABIs from deployed contracts using the following commands:

```bash
# Navigate to smart contract directory
cd /home/mrima/welcomehome-smart-contract

# Extract all ABIs using forge
forge inspect SecureWelcomeHomeProperty abi > abi_outputs/SecureWelcomeHomeProperty.json
forge inspect PropertyTokenHandler abi > abi_outputs/PropertyTokenHandler.json
forge inspect MockKYCRegistry abi > abi_outputs/MockKYCRegistry.json
forge inspect OwnershipRegistry abi > abi_outputs/OwnershipRegistry.json
forge inspect MinimalPropertyFactory abi > abi_outputs/MinimalPropertyFactory.json
forge inspect PropertyGovernance abi > abi_outputs/PropertyGovernance.json
```

### 2.2 Update Frontend ABI File

**File**: `/home/mrima/welcomehome/app/lib/web3/abi.ts`

**COMPLETE REPLACEMENT REQUIRED** - Replace entire file content with:

```typescript
// SecureWelcomeHomeProperty ABI (Generated from deployed contract)
export const SECURE_PROPERTY_TOKEN_ABI = [
  // Insert generated ABI from SecureWelcomeHomeProperty.json
] as const

// PropertyTokenHandler ABI (Generated from deployed contract)
export const PROPERTY_TOKEN_HANDLER_ABI = [
  // Insert generated ABI from PropertyTokenHandler.json
] as const

// MockKYCRegistry ABI (NEW - Add this)
export const KYC_REGISTRY_ABI = [
  // Insert generated ABI from MockKYCRegistry.json
] as const

// OwnershipRegistry ABI (NEW - Add this)
export const OWNERSHIP_REGISTRY_ABI = [
  // Insert generated ABI from OwnershipRegistry.json
] as const

// MinimalPropertyFactory ABI (Updated - Replace existing)
export const MINIMAL_PROPERTY_FACTORY_ABI = [
  // Insert generated ABI from MinimalPropertyFactory.json
] as const

// PropertyGovernance ABI (Updated - Replace existing)
export const PROPERTY_GOVERNANCE_ABI = [
  // Insert generated ABI from PropertyGovernance.json
] as const

// MockPaymentToken ABI (NEW - Add this for HBAR token)
export const PAYMENT_TOKEN_ABI = [
  // Standard ERC20 functions + mint function
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "address", "name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

// Legacy exports for backward compatibility
export const PROPERTY_TOKEN_ABI = SECURE_PROPERTY_TOKEN_ABI
export const PROPERTY_MANAGER_ABI = PROPERTY_TOKEN_HANDLER_ABI
```

**CRITICAL NOTE**: You must replace the placeholder comments with actual ABIs generated from the forge inspect commands above.

---

## Phase 3: Hook Restructuring

### 3.1 Fix Token Handler Hooks

**File**: `/home/mrima/welcomehome/app/lib/web3/hooks/use-token-handler.ts`

**Key Issues to Fix**:

1. **Line 11 & 38**: Wrong contract address - should use `DEMO_TOKEN_HANDLER` not `PROPERTY_MANAGER`
2. **Function signatures**: Need to match new contract architecture

**REPLACE lines 8-43:**
```typescript
// Token Sale Hooks - FIXED
export function useTokenSale() {
  const { data: saleData, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.DEMO_TOKEN_HANDLER as Address, // FIXED: was PROPERTY_MANAGER
    abi: PROPERTY_TOKEN_HANDLER_ABI,
    functionName: 'getTokenSaleInfo', // FIXED: use getter function instead of direct struct access
  })

  return {
    sale: saleData ? {
      pricePerToken: saleData[0],
      minPurchase: saleData[1],
      maxPurchase: saleData[2],
      totalSold: saleData[3],
      maxSupply: saleData[4],
      isActive: saleData[5],
    } : null,
    refetch
  }
}

export function usePurchaseTokens() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const purchaseTokens = (tokenAmount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.DEMO_TOKEN_HANDLER as Address, // FIXED: was PROPERTY_MANAGER
      abi: PROPERTY_TOKEN_HANDLER_ABI,
      functionName: 'purchaseTokens',
      args: [tokenAmount], // IMPORTANT: tokenAmount should be in BASE UNITS, not wei
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
```

### 3.2 Fix Property Factory Hooks

**File**: `/home/mrima/welcomehome/app/lib/web3/hooks/use-property-factory.ts`

**Critical Issue**: The ABI doesn't match the deployed MinimalPropertyFactory contract.

**REPLACE lines 10-114 with correct ABI:**
```typescript
// Updated ABI matching deployed MinimalPropertyFactory
const PROPERTY_FACTORY_ABI = [
  {
    "type": "function",
    "name": "propertyCount",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getProperty",
    "inputs": [{"name": "propertyId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [{
      "name": "", "type": "tuple", "internalType": "struct MinimalPropertyFactory.PropertyInfo",
      "components": [
        {"name": "tokenContract", "type": "address", "internalType": "address"},
        {"name": "handlerContract", "type": "address", "internalType": "address"},
        {"name": "name", "type": "string", "internalType": "string"},
        {"name": "symbol", "type": "string", "internalType": "string"},
        {"name": "ipfsHash", "type": "string", "internalType": "string"},
        {"name": "totalValue", "type": "uint256", "internalType": "uint256"},
        {"name": "maxTokens", "type": "uint256", "internalType": "uint256"},
        {"name": "creator", "type": "address", "internalType": "address"},
        {"name": "createdAt", "type": "uint256", "internalType": "uint256"},
        {"name": "isActive", "type": "bool", "internalType": "bool"},
        {"name": "propertyType", "type": "uint8", "internalType": "enum MinimalPropertyFactory.PropertyType"},
        {"name": "location", "type": "string", "internalType": "string"}
      ]
    }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "registerProperty",
    "inputs": [
      {"name": "tokenContract", "type": "address", "internalType": "address"},
      {"name": "handlerContract", "type": "address", "internalType": "address"},
      {"name": "name", "type": "string", "internalType": "string"},
      {"name": "symbol", "type": "string", "internalType": "string"},
      {"name": "ipfsHash", "type": "string", "internalType": "string"},
      {"name": "totalValue", "type": "uint256", "internalType": "uint256"},
      {"name": "maxTokens", "type": "uint256", "internalType": "uint256"},
      {"name": "propertyType", "type": "uint8", "internalType": "enum MinimalPropertyFactory.PropertyType"},
      {"name": "location", "type": "string", "internalType": "string"}
    ],
    "outputs": [{"name": "propertyId", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "getCreatorProperties",
    "inputs": [{"name": "creator", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint256[]", "internalType": "uint256[]"}],
    "stateMutability": "view"
  }
] as const
```

**ALSO UPDATE fetchProperties function (lines 151-224):**
```typescript
const fetchProperties = useCallback(async () => {
  if (!publicClient) return

  setIsLoading(true)
  setError(null)

  try {
    const factoryAddress = CONTRACT_ADDRESSES.PROPERTY_FACTORY as Address
    if (!factoryAddress || factoryAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Property Factory contract not deployed yet')
    }

    // Get total property count
    const count = await publicClient.readContract({
      address: factoryAddress,
      abi: PROPERTY_FACTORY_ABI,
      functionName: 'propertyCount',
    }) as bigint

    const totalCount = Number(count)
    setPropertyCount(totalCount)

    if (totalCount === 0) {
      setProperties([])
      return
    }

    // Get properties individually (no batch function in MinimalPropertyFactory)
    const allProperties: PropertyInfo[] = []

    for (let i = 0; i < totalCount; i++) {
      try {
        const property = await publicClient.readContract({
          address: factoryAddress,
          abi: PROPERTY_FACTORY_ABI,
          functionName: 'getProperty',
          args: [BigInt(i)],
        }) as any

        allProperties.push({
          id: i,
          tokenContract: property.tokenContract,
          handlerContract: property.handlerContract,
          name: property.name,
          symbol: property.symbol,
          ipfsHash: property.ipfsHash,
          totalValue: property.totalValue,
          maxTokens: property.maxTokens,
          creator: property.creator,
          createdAt: property.createdAt,
          isActive: property.isActive,
          propertyType: property.propertyType,
          location: property.location,
        })
      } catch (propertyError) {
        console.warn(`Failed to fetch property ${i}:`, propertyError)
      }
    }

    setProperties(allProperties)

  } catch (err) {
    logError('Error fetching properties from factory', err)
    setError(err instanceof Error ? err.message : 'Failed to fetch properties')
  } finally {
    setIsLoading(false)
  }
}, [publicClient])
```

### 3.3 Create New Hook Files

**Create**: `/home/mrima/welcomehome/app/lib/web3/hooks/use-kyc-registry.ts`

```typescript
"use client"

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../config'
import { KYC_REGISTRY_ABI } from '../abi'
import { Address } from 'viem'

export function useKYCStatus(address?: Address) {
  const { data: isAccredited, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.KYC_REGISTRY as Address,
    abi: KYC_REGISTRY_ABI,
    functionName: 'isAccreditedInvestor',
    args: address ? [address] : undefined,
  })

  return {
    isAccredited: Boolean(isAccredited),
    refetch
  }
}

export function useSetKYCStatus() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const setKYCStatus = (investor: Address, status: boolean) => {
    writeContract({
      address: CONTRACT_ADDRESSES.KYC_REGISTRY as Address,
      abi: KYC_REGISTRY_ABI,
      functionName: 'setAccreditedInvestor',
      args: [investor, status],
    })
  }

  return {
    setKYCStatus,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}
```

**Create**: `/home/mrima/welcomehome/app/lib/web3/hooks/use-ownership-registry.ts`

```typescript
"use client"

import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../config'
import { OWNERSHIP_REGISTRY_ABI } from '../abi'
import { Address } from 'viem'

export function useUserPortfolio(address?: Address) {
  const { data: portfolio, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.OWNERSHIP_REGISTRY as Address,
    abi: OWNERSHIP_REGISTRY_ABI,
    functionName: 'getUserPortfolio',
    args: address ? [address] : undefined,
  })

  return {
    portfolio: portfolio ? {
      propertyIds: portfolio.propertyIds,
      totalProperties: Number(portfolio.totalProperties),
      totalTokens: portfolio.totalTokens,
      totalValue: portfolio.totalValue,
      lastUpdated: Number(portfolio.lastUpdated),
    } : null,
    refetch
  }
}

export function useUserProperties(address?: Address) {
  const { data: propertyIds } = useReadContract({
    address: CONTRACT_ADDRESSES.OWNERSHIP_REGISTRY as Address,
    abi: OWNERSHIP_REGISTRY_ABI,
    functionName: 'getUserProperties',
    args: address ? [address] : undefined,
  })

  return propertyIds || []
}

export function usePropertyHolders(propertyId: number) {
  const { data: holders } = useReadContract({
    address: CONTRACT_ADDRESSES.OWNERSHIP_REGISTRY as Address,
    abi: OWNERSHIP_REGISTRY_ABI,
    functionName: 'getPropertyHolders',
    args: [BigInt(propertyId)],
  })

  return holders || []
}

export function useGlobalStats() {
  const { data: stats } = useReadContract({
    address: CONTRACT_ADDRESSES.OWNERSHIP_REGISTRY as Address,
    abi: OWNERSHIP_REGISTRY_ABI,
    functionName: 'getGlobalStats',
  })

  return stats ? {
    totalProperties: Number(stats[0]),
    totalUsers: Number(stats[1]),
    totalTokens: stats[2],
  } : null
}
```

---

## Phase 4: Component Updates

### 4.1 Update Property Token Hooks

**File**: `/home/mrima/welcomehome/app/lib/web3/hooks/use-property-token.ts`

**Key Fix**: Update contract address and function calls.

**REPLACE useTokenBalance function (around line 6-20):**
```typescript
export function useTokenBalance(address?: Address) {
  const { data: balance, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.DEMO_PROPERTY_TOKEN as Address, // FIXED: use DEMO_PROPERTY_TOKEN
    abi: SECURE_PROPERTY_TOKEN_ABI, // FIXED: use SECURE_PROPERTY_TOKEN_ABI
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  return {
    balance: balance || 0n,
    refetch
  }
}
```

### 4.2 Update Dashboard Page

**File**: `/home/mrima/welcomehome/app/(dashboard)/dashboard/page.tsx`

**Add KYC status import and display (after line 11):**
```typescript
import { useKYCStatus } from "@/app/lib/web3/hooks/use-kyc-registry"
import { useUserPortfolio } from "@/app/lib/web3/hooks/use-ownership-registry"
```

**Add KYC status check in component (after line 34):**
```typescript
const { isAccredited } = useKYCStatus(address)
const { portfolio } = useUserPortfolio(address)
```

### 4.3 Update Marketplace Page

**File**: `/home/mrima/welcomehome/app/(dashboard)/marketplace/page.tsx`

**Critical Token Purchase Fix**: The purchase form needs to handle base units correctly.

**Add unit conversion helper (at top of file):**
```typescript
import { parseUnits, formatUnits } from 'viem'

// Helper to convert display tokens to base units for contract calls
const convertToBaseUnits = (displayAmount: string): bigint => {
  // Display: "1000" tokens -> Base units: 1000n (NOT 1000 * 1e18)
  return BigInt(displayAmount)
}

// Helper to convert base units to display tokens
const convertToDisplayUnits = (baseAmount: bigint): string => {
  return baseAmount.toString()
}
```

**Update purchase button handler to use base units:**
```typescript
// In purchase form submission
const handlePurchase = (amount: string) => {
  const baseUnits = convertToBaseUnits(amount)
  purchaseTokens(baseUnits) // This sends base units, not wei
}
```

---

## Phase 5: Testing & Validation

### 5.1 Contract Connectivity Tests

**Create**: `/home/mrima/welcomehome/app/components/debug/ContractConnectivityTest.tsx`

```typescript
"use client"

import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/app/lib/web3/config'
import { PROPERTY_TOKEN_HANDLER_ABI, SECURE_PROPERTY_TOKEN_ABI, KYC_REGISTRY_ABI } from '@/app/lib/web3/abi'
import { Address } from 'viem'

export function ContractConnectivityTest() {
  // Test all contract connections
  const { data: tokenName } = useReadContract({
    address: CONTRACT_ADDRESSES.DEMO_PROPERTY_TOKEN as Address,
    abi: SECURE_PROPERTY_TOKEN_ABI,
    functionName: 'name',
  })

  const { data: saleInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.DEMO_TOKEN_HANDLER as Address,
    abi: PROPERTY_TOKEN_HANDLER_ABI,
    functionName: 'getTokenSaleInfo',
  })

  const { data: factoryCount } = useReadContract({
    address: CONTRACT_ADDRESSES.PROPERTY_FACTORY as Address,
    abi: [{"type":"function","name":"propertyCount","inputs":[],"outputs":[{"type":"uint256"}],"stateMutability":"view"}],
    functionName: 'propertyCount',
  })

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-2">Contract Connectivity Test</h3>
      <div className="space-y-2 text-sm">
        <div>Property Token Name: {tokenName || 'Failed to load'}</div>
        <div>Sale Active: {saleInfo?.[5] ? 'Yes' : 'No'}</div>
        <div>Property Count: {factoryCount?.toString() || 'Failed to load'}</div>
        <div className="mt-2 font-semibold">
          Status: {tokenName && saleInfo && factoryCount !== undefined ?
            '✅ All Connected' : '❌ Connection Issues'}
        </div>
      </div>
    </div>
  )
}
```

### 5.2 Add to Dashboard for Testing

**File**: `/home/mrima/welcomehome/app/(dashboard)/dashboard/page.tsx`

**Add import:**
```typescript
import { ContractConnectivityTest } from "@/app/components/debug/ContractConnectivityTest"
```

**Add component in dashboard (after line 50):**
```tsx
<ContractConnectivityTest />
```

---

## Phase 6: Payment Token Integration

### 6.1 Add Payment Token Hooks

**Create**: `/home/mrima/welcomehome/app/lib/web3/hooks/use-payment-token.ts`

```typescript
"use client"

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../config'
import { PAYMENT_TOKEN_ABI } from '../abi'
import { Address } from 'viem'

export function usePaymentTokenBalance(address?: Address) {
  const { data: balance, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.PAYMENT_TOKEN as Address,
    abi: PAYMENT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  return {
    balance: balance || 0n,
    refetch
  }
}

export function usePaymentTokenApproval(owner?: Address, spender?: Address) {
  const { data: allowance, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.PAYMENT_TOKEN as Address,
    abi: PAYMENT_TOKEN_ABI,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
  })

  return {
    allowance: allowance || 0n,
    refetch
  }
}

export function useApprovePaymentToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = (spender: Address, amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.PAYMENT_TOKEN as Address,
      abi: PAYMENT_TOKEN_ABI,
      functionName: 'approve',
      args: [spender, amount],
    })
  }

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}
```

### 6.2 Update Token Purchase Flow

**File**: `/home/mrima/welcomehome/app/(dashboard)/marketplace/page.tsx`

**Add payment token integration:**
```typescript
import { usePaymentTokenBalance, usePaymentTokenApproval, useApprovePaymentToken } from '@/app/lib/web3/hooks/use-payment-token'
import { CONTRACT_ADDRESSES } from '@/app/lib/web3/config'

// In component:
const { balance: paymentBalance } = usePaymentTokenBalance(address)
const { allowance } = usePaymentTokenApproval(address, CONTRACT_ADDRESSES.DEMO_TOKEN_HANDLER as Address)
const { approve, isPending: isApproving } = useApprovePaymentToken()

// Purchase flow - check allowance first, approve if needed
const handlePurchase = async (tokenAmount: string) => {
  const baseUnits = BigInt(tokenAmount)
  const cost = baseUnits * BigInt(sale?.pricePerToken || 0)

  if (allowance < cost) {
    // Need approval first
    approve(CONTRACT_ADDRESSES.DEMO_TOKEN_HANDLER as Address, cost)
  } else {
    // Can purchase directly
    purchaseTokens(baseUnits)
  }
}
```

---

## Phase 7: Error Handling & User Experience

### 7.1 Update Error Messages

**File**: `/home/mrima/welcomehome/app/lib/web3/error-utils.ts`

**Add contract-specific error handling:**
```typescript
export function parseContractError(error: any): string {
  const errorMessage = error?.message || error?.toString() || 'Unknown error'

  // Handle specific contract errors
  if (errorMessage.includes('InsufficientPayment')) {
    return 'Insufficient payment token balance or allowance'
  }
  if (errorMessage.includes('PurchaseAmountTooLow')) {
    return 'Purchase amount below minimum required'
  }
  if (errorMessage.includes('PurchaseAmountTooHigh')) {
    return 'Purchase amount exceeds maximum allowed'
  }
  if (errorMessage.includes('NotAccreditedInvestor')) {
    return 'Account not approved for investment. Please complete KYC verification.'
  }
  if (errorMessage.includes('TokenSaleNotActive')) {
    return 'Token sale is currently not active'
  }

  return errorMessage
}
```

### 7.2 Add Loading States

**File**: `/home/mrima/welcomehome/app/components/ui/loading-spinner.tsx`

```typescript
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
  )
}
```

---

## Phase 8: Package Dependencies

### 8.1 Verify Dependencies

**File**: `/home/mrima/welcomehome/package.json`

**Check these dependencies are correct versions:**
```json
{
  "@wagmi/core": "^2.21.1",
  "wagmi": "^2",
  "viem": "^2",
  "ethers": "^6"
}
```

**If any are missing or wrong version, run:**
```bash
cd /home/mrima/welcomehome
npm install @wagmi/core@^2.21.1 wagmi@^2 viem@^2
```

---

## IMPLEMENTATION CHECKLIST

### ✅ Pre-Implementation
- [ ] Backup current frontend: `cp -r /home/mrima/welcomehome /home/mrima/welcomehome-backup`
- [ ] Verify smart contracts are deployed and working
- [ ] Generate ABIs from deployed contracts using `forge inspect`

### 🔧 Phase 1: Configuration
- [ ] Update `.env.local` with correct contract addresses
- [ ] Update `app/lib/web3/config.ts` CONTRACT_ADDRESSES
- [ ] Add missing environment variables

### 📝 Phase 2: ABI Updates
- [ ] Generate all ABIs using forge inspect commands
- [ ] Replace entire `app/lib/web3/abi.ts` with generated ABIs
- [ ] Add new contract ABIs (KYC Registry, Ownership Registry)

### 🔗 Phase 3: Hook Fixes
- [ ] Fix `use-token-handler.ts` contract addresses and functions
- [ ] Fix `use-property-factory.ts` ABI and function calls
- [ ] Create `use-kyc-registry.ts` hook
- [ ] Create `use-ownership-registry.ts` hook
- [ ] Create `use-payment-token.ts` hook

### 🎨 Phase 4: Component Updates
- [ ] Update `use-property-token.ts` contract addresses
- [ ] Add KYC status to dashboard
- [ ] Fix marketplace token purchase flow (base units)
- [ ] Update all contract address references

### ✅ Phase 5: Testing
- [ ] Create `ContractConnectivityTest.tsx` component
- [ ] Add connectivity test to dashboard
- [ ] Test all contract interactions
- [ ] Verify token purchase with correct units

### 🚨 Phase 6: Integration & UX
- [ ] Add payment token approval flow
- [ ] Update error handling with contract-specific messages
- [ ] Add loading states for all transactions
- [ ] Test complete user flow end-to-end

### 🔍 Phase 7: Validation
- [ ] Test wallet connection
- [ ] Test KYC status checking
- [ ] Test token purchases (verify base units work)
- [ ] Test marketplace listing and purchases
- [ ] Test staking functionality
- [ ] Test revenue claiming
- [ ] Verify portfolio tracking

---

## CRITICAL SUCCESS FACTORS

### 1. **Contract Address Accuracy**
All contract addresses MUST exactly match deployed addresses. Double-check every address.

### 2. **ABI Synchronization**
ABIs MUST be generated from deployed contracts, not from source code, to ensure exact matching.

### 3. **Unit Handling**
Token amounts must be handled correctly:
- **Display**: "1000 tokens"
- **Contract Call**: `BigInt(1000)` (base units, NOT wei)
- **Price**: Always in wei units (e.g., `1 * 1e18` for 1 HBAR per token)

### 4. **Hook Architecture**
Each contract needs its own hook file for clean separation:
- `use-property-token.ts` → SecureWelcomeHomeProperty
- `use-token-handler.ts` → PropertyTokenHandler
- `use-kyc-registry.ts` → MockKYCRegistry
- `use-ownership-registry.ts` → OwnershipRegistry
- `use-property-factory.ts` → MinimalPropertyFactory

### 5. **Error Handling**
Contract-specific error messages help users understand what went wrong and how to fix it.

---

## POST-MIGRATION VERIFICATION

### Test Checklist:
1. **✅ Connect wallet** - Should connect to Hedera testnet
2. **✅ Load dashboard** - Should show property token balance
3. **✅ Check KYC status** - Should display accredited status
4. **✅ View marketplace** - Should show current token sale
5. **✅ Purchase tokens** - Should handle approval + purchase flow
6. **✅ View portfolio** - Should show owned properties via OwnershipRegistry
7. **✅ Test staking** - Should stake/unstake with rewards
8. **✅ Test revenue** - Should claim revenue distributions

### Success Criteria:
- **Zero console errors** when loading pages
- **All contract interactions work** without transaction failures
- **User flows complete** from start to finish
- **Real-time data loading** from blockchain (no mock data)
- **Responsive UI** with proper loading states

This plan transforms the incompatible frontend into a fully functional application aligned with the deployed smart contract architecture. The migration addresses all critical issues: wrong addresses, outdated ABIs, missing integrations, and incorrect unit handling.

## FINAL NOTE

This migration plan requires systematic implementation in the exact order specified. Each phase builds on the previous one, so skipping steps or implementing out of order will cause failures. The plan addresses every identified compatibility issue and provides specific code changes needed for successful integration.

The result will be a fully functional, production-ready frontend that perfectly integrates with your deployed Hedera smart contracts.