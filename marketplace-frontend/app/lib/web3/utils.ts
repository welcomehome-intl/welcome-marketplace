import { hederaTestnet, hederaMainnet } from './config'
import { logError, serializeError } from './error-utils'

export async function addNetworkToWallet(network: 'testnet' | 'mainnet') {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask extension.')
  }

  const networkConfig = network === 'mainnet' ? hederaMainnet : hederaTestnet
  const chainIdHex = `0x${networkConfig.id.toString(16)}`

  console.log(`🔄 Attempting to add ${networkConfig.name} to MetaMask...`)
  console.log('Network config:', {
    chainId: chainIdHex,
    chainName: networkConfig.name,
    rpcUrls: networkConfig.rpcUrls.default.http,
    nativeCurrency: networkConfig.nativeCurrency,
  })

  // First, validate the RPC URL
  try {
    await validateRpcUrl(networkConfig.rpcUrls.default.http[0])
  } catch (rpcError) {
    logError('RPC validation failed', rpcError, {
      rpcUrl: networkConfig.rpcUrls.default.http[0],
      network: networkConfig.name
    })
    throw new Error(`RPC endpoint ${networkConfig.rpcUrls.default.http[0]} is not accessible. Please check your internet connection.`)
  }

  try {
    // Try to switch to the network first
    console.log('🔄 Attempting to switch to existing network...')
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    })
    console.log('✅ Successfully switched to existing network')
  } catch (switchError: any) {
    console.log('ℹ️  Network not found, attempting to add it...')

    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        const networkParams = {
          chainId: chainIdHex,
          chainName: networkConfig.name,
          rpcUrls: networkConfig.rpcUrls.default.http,
          blockExplorerUrls: [networkConfig.blockExplorers.default.url],
          nativeCurrency: {
            name: networkConfig.nativeCurrency.name,
            symbol: networkConfig.nativeCurrency.symbol,
            decimals: networkConfig.nativeCurrency.decimals,
          },
        }

        // Validate network parameters before sending to MetaMask
        validateNetworkParams(networkParams)

        console.log('🔄 Adding network with params:', networkParams)

        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [networkParams],
        })

        console.log('✅ Successfully added network to MetaMask')
      } catch (addError: any) {
        logError('Failed to add network to MetaMask', addError, {
          networkParams,
          network: networkConfig.name,
          chainId: chainIdHex
        })

        // Handle specific error cases
        if (addError.code === 4001) {
          throw new Error('User rejected the network addition request. Please try again and approve the network addition in MetaMask.')
        } else if (addError.code === -32602) {
          throw new Error('Invalid network parameters. Please contact support.')
        } else if (addError.code === -32603) {
          throw new Error('MetaMask internal error. Please restart MetaMask and try again.')
        } else if (addError.message?.includes('rpc')) {
          throw new Error(`RPC endpoint error: ${addError.message}. The Hedera RPC might be temporarily unavailable.`)
        } else {
          throw new Error(`Failed to add network: ${addError.message || 'Unknown error occurred'}`)
        }
      }
    } else if (switchError.code === 4001) {
      throw new Error('User rejected the network switch request.')
    } else {
      logError('Unexpected switch error', switchError, {
        network: networkConfig.name,
        chainId: chainIdHex
      })
      throw new Error(`Network switch failed: ${switchError.message || 'Unknown error occurred'}`)
    }
  }
}

// Helper function to validate network parameters before MetaMask call
function validateNetworkParams(params: any): void {
  const errors: string[] = []

  // Required parameters
  if (!params.chainId || typeof params.chainId !== 'string') {
    errors.push('chainId must be a hex string')
  }

  if (!params.chainName || typeof params.chainName !== 'string' || params.chainName.length === 0) {
    errors.push('chainName must be a non-empty string')
  }

  if (!params.rpcUrls || !Array.isArray(params.rpcUrls) || params.rpcUrls.length === 0) {
    errors.push('rpcUrls must be a non-empty array')
  }

  if (!params.nativeCurrency || typeof params.nativeCurrency !== 'object') {
    errors.push('nativeCurrency must be an object')
  } else {
    const { name, symbol, decimals } = params.nativeCurrency
    if (!name || typeof name !== 'string') {
      errors.push('nativeCurrency.name must be a non-empty string')
    }
    if (!symbol || typeof symbol !== 'string') {
      errors.push('nativeCurrency.symbol must be a non-empty string')
    }
    if (typeof decimals !== 'number' || decimals < 0 || decimals > 36) {
      errors.push('nativeCurrency.decimals must be a number between 0 and 36')
    }
  }

  // Validate chain ID format (should be hex)
  if (params.chainId && !params.chainId.startsWith('0x')) {
    errors.push('chainId must be in hex format (0x...)')
  }

  // Validate RPC URLs format
  if (params.rpcUrls && Array.isArray(params.rpcUrls)) {
    params.rpcUrls.forEach((url: any, index: number) => {
      if (typeof url !== 'string' || !url.startsWith('http')) {
        errors.push(`rpcUrls[${index}] must be a valid HTTP/HTTPS URL`)
      }
    })
  }

  if (errors.length > 0) {
    console.error('❌ Network parameter validation failed:', errors)
    throw new Error(`Invalid network parameters: ${errors.join(', ')}`)
  }

  console.log('✅ Network parameter validation passed')
}

// Helper function to validate RPC URL accessibility
async function validateRpcUrl(rpcUrl: string, timeoutMs: number = 5000): Promise<void> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`RPC returned status ${response.status}`)
    }

    const data = await response.json()
    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`)
    }

    console.log('✅ RPC validation successful')
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('RPC request timed out')
      }
      throw error
    }
    throw new Error('Unknown RPC validation error')
  }
}

export function getNetworkName(chainId: number): string {
  switch (chainId) {
    case 295:
      return 'Hedera Mainnet'
    case 296:
      return 'Hedera Testnet'
    case 1:
      return 'Ethereum Mainnet'
    case 137:
      return 'Polygon Mainnet'
    case 11155111:
      return 'Sepolia Testnet'
    default:
      return 'Unknown Network'
  }
}

export function isHederaNetwork(chainId: number): boolean {
  return chainId === 295 || chainId === 296
}

export function getHederaExplorerUrl(chainId: number, hash: string, type: 'tx' | 'address' = 'tx'): string {
  const baseUrl = chainId === 295
    ? 'https://hashscan.io/mainnet'
    : 'https://hashscan.io/testnet'

  return `${baseUrl}/${type}/${hash}`
}