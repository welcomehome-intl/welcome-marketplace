"use client"

import { createPublicClient, http } from 'viem'
import { CONTRACT_ADDRESSES } from './config'
import { PROPERTY_TOKEN_ABI } from './abi'

// Test connectivity to deployed contracts
export async function testContractConnectivity() {
  const results = {
    rpcConnection: false,
    contractExists: false,
    contractFunctions: {
      name: null,
      symbol: null,
      totalSupply: null,
    },
    errors: [] as string[],
  }

  try {
    // Create public client for Hedera testnet
    const publicClient = createPublicClient({
      transport: http(process.env.NEXT_PUBLIC_HEDERA_TESTNET_RPC_URL || 'https://testnet.hashio.io/api'),
      chain: {
        id: 296,
        name: 'Hedera Testnet',
        nativeCurrency: { decimals: 8, name: 'HBAR', symbol: 'HBAR' },
        rpcUrls: {
          default: {
            http: ['https://testnet.hashio.io/api'],
          },
        },
      },
    })

    // Test RPC connection
    try {
      const blockNumber = await publicClient.getBlockNumber()
      console.log('✅ RPC Connection successful, latest block:', blockNumber.toString())
      results.rpcConnection = true
    } catch (rpcError) {
      console.error('❌ RPC Connection failed:', rpcError)
      results.errors.push(`RPC Error: ${rpcError instanceof Error ? rpcError.message : 'Unknown'}`)
      return results
    }

    // Test contract existence by checking bytecode
    try {
      const bytecode = await publicClient.getBytecode({
        address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as `0x${string}`,
      })

      if (bytecode && bytecode !== '0x') {
        console.log('✅ Contract exists at address:', CONTRACT_ADDRESSES.PROPERTY_TOKEN)
        results.contractExists = true
      } else {
        console.error('❌ No contract found at address:', CONTRACT_ADDRESSES.PROPERTY_TOKEN)
        results.errors.push('Contract not found at specified address')
        return results
      }
    } catch (bytecodeError) {
      console.error('❌ Error checking contract bytecode:', bytecodeError)
      results.errors.push(`Bytecode check failed: ${bytecodeError instanceof Error ? bytecodeError.message : 'Unknown'}`)
    }

    // Test contract function calls
    try {
      const name = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as `0x${string}`,
        abi: PROPERTY_TOKEN_ABI,
        functionName: 'name',
      })
      console.log('✅ Contract name():', name)
      results.contractFunctions.name = name as string
    } catch (nameError) {
      console.error('❌ name() call failed:', nameError)
      results.errors.push(`name() failed: ${nameError instanceof Error ? nameError.message : 'Unknown'}`)
    }

    try {
      const symbol = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as `0x${string}`,
        abi: PROPERTY_TOKEN_ABI,
        functionName: 'symbol',
      })
      console.log('✅ Contract symbol():', symbol)
      results.contractFunctions.symbol = symbol as string
    } catch (symbolError) {
      console.error('❌ symbol() call failed:', symbolError)
      results.errors.push(`symbol() failed: ${symbolError instanceof Error ? symbolError.message : 'Unknown'}`)
    }

    try {
      const totalSupply = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as `0x${string}`,
        abi: PROPERTY_TOKEN_ABI,
        functionName: 'totalSupply',
      })
      console.log('✅ Contract totalSupply():', totalSupply?.toString())
      results.contractFunctions.totalSupply = totalSupply as bigint
    } catch (supplyError) {
      console.error('❌ totalSupply() call failed:', supplyError)
      results.errors.push(`totalSupply() failed: ${supplyError instanceof Error ? supplyError.message : 'Unknown'}`)
    }

  } catch (error) {
    console.error('❌ General connectivity test error:', error)
    results.errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown'}`)
  }

  return results
}

// Helper function to test connectivity and log results
export async function runConnectivityTest() {
  console.log('🧪 Testing contract connectivity...')
  console.log('Contract Address:', CONTRACT_ADDRESSES.PROPERTY_TOKEN)
  console.log('RPC URL:', process.env.NEXT_PUBLIC_HEDERA_TESTNET_RPC_URL)

  const results = await testContractConnectivity()

  console.log('\n📊 Connectivity Test Results:')
  console.log('RPC Connection:', results.rpcConnection ? '✅' : '❌')
  console.log('Contract Exists:', results.contractExists ? '✅' : '❌')
  console.log('Function Calls:')
  console.log('  - name():', results.contractFunctions.name || '❌')
  console.log('  - symbol():', results.contractFunctions.symbol || '❌')
  console.log('  - totalSupply():', results.contractFunctions.totalSupply?.toString() || '❌')

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:')
    results.errors.forEach(error => console.log('  -', error))
  }

  return results
}