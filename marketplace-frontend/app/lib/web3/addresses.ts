/**
 * Centralized Contract Address Configuration
 *
 * This file manages all smart contract addresses for the platform.
 * Addresses are loaded from environment variables for easy deployment management.
 *
 * IMPORTANT: After deploying contracts, update .env.local with the new addresses
 * and restart the dev server.
 */

import { Address } from 'viem'

// =============================================================================
// DEPLOYED CONTRACT ADDRESSES (Hardcoded fallback for Turbopack env var issue)
// =============================================================================
// Deployed on: 2025-10-26
// Network: Hedera Testnet (Chain ID: 296)
// Deployer: 0xD1B156294aFa63d7d174D06D5A83e547d7a5abA9
// PropertyFactory v3: 2025-10-26 - HEDERA-COMPATIBLE
//   - Direct token purchases with HBAR payment
//   - Hedera tinybar conversion (msg.value in tinybars, not wei)
//   - Automatic refunds for overpayment
//   - See HEDERA_MSG_VALUE_FINDINGS.md for details

const DEPLOYED_ADDRESSES = {
  ACCESS_CONTROL: '0xDDAE60c136ea61552c1e6acF3c7Ab8beBd02eF69',
  OWNERSHIP_REGISTRY: '0x4Eb9F441eA43141572BC49a4e8Fdf53f44B5C99C',
  PROPERTY_FACTORY: '0x4C67256697e4a6af045faB5D9891455Cba16C420',
  MARKETPLACE: '0x74347e6046819f6cbc64eb301746c7AaDA614Dec',
  PAYMENT_TOKEN: '0x0000000000000000000000000000000000000000',
} as const

// =============================================================================
// CONTRACT ADDRESSES (from environment variables)
// =============================================================================

/**
 * Get contract address from environment variable with validation and fallback
 */
function getContractAddress(
  envKey: string,
  contractName: string,
  fallbackKey?: keyof typeof DEPLOYED_ADDRESSES
): Address {
  const address = process.env[envKey]

  // Try environment variable first
  if (address && address !== '0x0000000000000000000000000000000000000000') {
    // Basic validation: check if it looks like an address
    if (address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return address as Address
    } else {
      console.error(
        `Error: ${contractName} address is invalid: ${address}. ` +
        `Please check ${envKey} in .env.local. Using fallback.`
      )
    }
  }

  // Fallback to hardcoded deployed address
  if (fallbackKey && DEPLOYED_ADDRESSES[fallbackKey]) {
    console.log(`Using hardcoded deployed address for ${contractName}`)
    return DEPLOYED_ADDRESSES[fallbackKey] as Address
  }

  // Last resort: warn and return zero address
  console.warn(
    `Warning: ${contractName} address not configured or is zero address. ` +
    `Please set ${envKey} in .env.local after deployment.`
  )
  return '0x0000000000000000000000000000000000000000' as Address
}

/**
 * All smart contract addresses for the platform
 */
export const CONTRACT_ADDRESSES = {
  // Core contracts
  ACCESS_CONTROL: getContractAddress(
    'ACCESS_CONTROL_ADDRESS',
    'AccessControl',
    'ACCESS_CONTROL'
  ),
  OWNERSHIP_REGISTRY: getContractAddress(
    'OWNERSHIP_REGISTRY_ADDRESS',
    'OwnershipRegistry',
    'OWNERSHIP_REGISTRY'
  ),
  PROPERTY_FACTORY: getContractAddress(
    'PROPERTY_FACTORY_ADDRESS',
    'PropertyFactory',
    'PROPERTY_FACTORY'
  ),

  // Token contracts
  PAYMENT_TOKEN: getContractAddress(
    'PAYMENT_TOKEN_ADDRESS',
    'PaymentToken',
    'PAYMENT_TOKEN'
  ),

  // Optional contracts (for future MVP phases)
  MARKETPLACE: getContractAddress(
    'MARKETPLACE_ADDRESS',
    'Marketplace',
    'MARKETPLACE'
  ),
} as const

// =============================================================================
// CONTRACT ADDRESS VALIDATION
// =============================================================================

/**
 * Check if a contract address is configured (not zero address)
 */
export function isContractConfigured(address: Address): boolean {
  return address !== '0x0000000000000000000000000000000000000000'
}

/**
 * Validate that all required contracts are configured
 * Returns list of missing contracts
 */
export function validateRequiredContracts(): string[] {
  const required = [
    { name: 'AccessControl', address: CONTRACT_ADDRESSES.ACCESS_CONTROL },
    { name: 'OwnershipRegistry', address: CONTRACT_ADDRESSES.OWNERSHIP_REGISTRY },
    { name: 'PropertyFactory', address: CONTRACT_ADDRESSES.PROPERTY_FACTORY },
    { name: 'PaymentToken', address: CONTRACT_ADDRESSES.PAYMENT_TOKEN },
  ]

  const missing = required
    .filter(({ address }) => !isContractConfigured(address))
    .map(({ name }) => name)

  return missing
}

/**
 * Get user-friendly error message about missing contracts
 */
export function getMissingContractsMessage(): string | null {
  const missing = validateRequiredContracts()

  if (missing.length === 0) return null

  return (
    `The following contracts are not configured: ${missing.join(', ')}. ` +
    `Please deploy contracts and update .env.local with their addresses.`
  )
}

// =============================================================================
// CONTRACT DEPLOYMENT STATUS
// =============================================================================

/**
 * Check overall deployment status
 */
export function getDeploymentStatus() {
  const missing = validateRequiredContracts()
  const configured = Object.keys(CONTRACT_ADDRESSES).length - missing.length
  const total = Object.keys(CONTRACT_ADDRESSES).length

  return {
    isReady: missing.length === 0,
    configured,
    total,
    missing,
    percentage: Math.round((configured / total) * 100),
  }
}

// =============================================================================
// DEVELOPMENT HELPERS
// =============================================================================

/**
 * Log all contract addresses (useful for debugging)
 */
export function logContractAddresses() {
  console.group('Smart Contract Addresses')
  Object.entries(CONTRACT_ADDRESSES).forEach(([name, address]) => {
    const status = isContractConfigured(address) ? '✓' : '✗'
    console.log(`${status} ${name}: ${address}`)
  })
  console.groupEnd()

  const status = getDeploymentStatus()
  console.log(`Deployment Status: ${status.configured}/${status.total} (${status.percentage}%)`)

  if (!status.isReady) {
    console.warn(getMissingContractsMessage())
  }
}

// =============================================================================
// BACKWARD COMPATIBILITY ALIASES
// =============================================================================
// These aliases maintain compatibility with existing code that uses old names
// TODO: Refactor all code to use CONTRACT_ADDRESSES directly, then remove these

/**
 * @deprecated Use CONTRACT_ADDRESSES.ACCESS_CONTROL instead
 * KYC functionality is part of the AccessControl contract
 */
export const KYC_REGISTRY_ADDRESS = CONTRACT_ADDRESSES.ACCESS_CONTROL

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ContractName = keyof typeof CONTRACT_ADDRESSES

// =============================================================================
// USAGE EXAMPLE
// =============================================================================
/*
import { CONTRACT_ADDRESSES, isContractConfigured, logContractAddresses } from '@/app/lib/web3/addresses'

// Check if ready
if (!isContractConfigured(CONTRACT_ADDRESSES.PROPERTY_FACTORY)) {
  console.error('Property Factory not deployed yet')
  return
}

// Use in contract calls
const { data } = useReadContract({
  address: CONTRACT_ADDRESSES.PROPERTY_FACTORY,
  abi: PROPERTY_FACTORY_ABI,
  functionName: 'getProperty',
  args: [propertyId]
})

// Log all addresses in development
if (process.env.NODE_ENV === 'development') {
  logContractAddresses()
}
*/
