"use client"

import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { testContractConnectivity } from '@/app/lib/web3/test-connectivity'
import { CONTRACT_ADDRESSES } from '@/app/lib/web3/config'

interface ConnectivityResults {
  rpcConnection: boolean
  contractExists: boolean
  contractFunctions: {
    name: string | null
    symbol: string | null
    totalSupply: bigint | null
  }
  errors: string[]
}

export function ContractDebug() {
  const [results, setResults] = useState<ConnectivityResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runTest = async () => {
    setIsLoading(true)
    try {
      const testResults = await testContractConnectivity()
      setResults(testResults)
    } catch (error) {
      console.error('Test failed:', error)
      setResults({
        rpcConnection: false,
        contractExists: false,
        contractFunctions: { name: null, symbol: null, totalSupply: null },
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Contract Connectivity Debug</CardTitle>
        <CardDescription>
          Test connection to deployed smart contracts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>Property Token:</strong> {CONTRACT_ADDRESSES.PROPERTY_TOKEN}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Property Manager:</strong> {CONTRACT_ADDRESSES.PROPERTY_MANAGER}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>RPC URL:</strong> {process.env.NEXT_PUBLIC_HEDERA_TESTNET_RPC_URL}
          </p>
        </div>

        <Button onClick={runTest} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Run Connectivity Test'}
        </Button>

        {results && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className={results.rpcConnection ? 'text-green-600' : 'text-red-600'}>
                {results.rpcConnection ? '✅' : '❌'}
              </span>
              <span>RPC Connection</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className={results.contractExists ? 'text-green-600' : 'text-red-600'}>
                {results.contractExists ? '✅' : '❌'}
              </span>
              <span>Contract Exists</span>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Contract Functions:</h4>
              <div className="pl-4 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={results.contractFunctions.name ? 'text-green-600' : 'text-red-600'}>
                    {results.contractFunctions.name ? '✅' : '❌'}
                  </span>
                  <span>name(): {results.contractFunctions.name || 'Failed'}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={results.contractFunctions.symbol ? 'text-green-600' : 'text-red-600'}>
                    {results.contractFunctions.symbol ? '✅' : '❌'}
                  </span>
                  <span>symbol(): {results.contractFunctions.symbol || 'Failed'}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={results.contractFunctions.totalSupply ? 'text-green-600' : 'text-red-600'}>
                    {results.contractFunctions.totalSupply ? '✅' : '❌'}
                  </span>
                  <span>totalSupply(): {results.contractFunctions.totalSupply?.toString() || 'Failed'}</span>
                </div>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-red-600">Errors:</h4>
                <div className="pl-4 space-y-1">
                  {results.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600">• {error}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}