"use client"

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useEnsName, useSwitchChain } from 'wagmi'
import { Button } from '@/app/components/ui/button'
import { Card } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Copy, ExternalLink, Check, AlertTriangle, Wallet } from 'lucide-react'
import { useUserRoles } from '@/app/lib/web3/hooks/use-roles'
import { useTokenBalance } from '@/app/lib/web3/hooks/use-property-token'
import { addNetworkToWallet, getNetworkName, isHederaNetwork } from '@/app/lib/web3/utils'
import { hederaTestnet } from '@/app/lib/web3/config'

interface WalletConnectProps {
  compact?: boolean
}

export function WalletConnect({ compact = false }: WalletConnectProps) {
  const { address, isConnected, chain } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const [showConnectors, setShowConnectors] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isAddingNetwork, setIsAddingNetwork] = useState(false)
  const [networkError, setNetworkError] = useState<string | null>(null)

  const { balance } = useTokenBalance(address)
  const roles = useUserRoles(address)

  // Check if user is on the correct network
  const isCorrectNetwork = chain && isHederaNetwork(chain.id)
  const networkName = chain ? getNetworkName(chain.id) : 'Unknown Network'

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleAddNetwork = async () => {
    setIsAddingNetwork(true)
    setNetworkError(null)

    try {
      await addNetworkToWallet('testnet') // Default to testnet
      // The network switch will be handled automatically by the wallet
      console.log('✅ Network addition completed successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('❌ Failed to add network:', errorMessage)
      setNetworkError(errorMessage)
    } finally {
      setIsAddingNetwork(false)
    }
  }

  const retryAddNetwork = async () => {
    await handleAddNetwork()
  }

  const clearNetworkError = () => {
    setNetworkError(null)
  }

  // Compact variant for navbar
  if (compact && isConnected && address) {
    return (
      <Button
        variant="outline"
        size="default"
        onClick={() => disconnect()}
        className="px-4 py-2 h-10 border-gray-300"
      >
        <span className="font-medium">{formatAddress(address)}</span>
      </Button>
    )
  }

  if (compact && !isConnected) {
    return (
      <Button
        onClick={() => {
          if (connectors[0]) {
            connect({ connector: connectors[0] })
          }
        }}
        disabled={isPending}
        size="default"
        className="px-6 py-2 h-10 bg-teal-600 hover:bg-teal-700 text-white"
      >
        <span className="font-medium">Connect Wallet</span>
      </Button>
    )
  }

  // Full card variant for modals/dialogs
  if (isConnected && address) {
    return (
      <Card className="p-4 bg-white border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {ensName || formatAddress(address)}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">
                  Connected to {networkName}
                </p>
                {!isCorrectNetwork && (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyAddress}
              className="h-8 px-2"
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => disconnect()}
              className="h-8 px-3"
            >
              Disconnect
            </Button>
          </div>
        </div>

        {/* Network Warning */}
        {!isCorrectNetwork && (
          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Wrong Network</span>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              You're connected to {networkName}. Please switch to Hedera Testnet to use this application.
            </p>

            {/* Network Error Display */}
            {networkError && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700 mb-2">{networkError}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={retryAddNetwork}
                    disabled={isAddingNetwork}
                    size="sm"
                    variant="outline"
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    {isAddingNetwork ? 'Retrying...' : 'Retry'}
                  </Button>
                  <Button
                    onClick={clearNetworkError}
                    size="sm"
                    variant="ghost"
                    className="text-red-700"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            )}

            <Button
              onClick={handleAddNetwork}
              disabled={isAddingNetwork}
              size="sm"
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              {isAddingNetwork ? 'Adding Network...' : 'Add Hedera Testnet to MetaMask'}
            </Button>

            {/* Manual Instructions */}
            <details className="mt-3">
              <summary className="text-sm text-yellow-700 cursor-pointer hover:text-yellow-800">
                Add network manually (click to expand)
              </summary>
              <div className="mt-2 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                <p className="font-medium mb-1">Manual MetaMask Setup:</p>
                <p><strong>Network Name:</strong> Hedera Testnet</p>
                <p><strong>RPC URL:</strong> https://testnet.hashio.io/api</p>
                <p><strong>Chain ID:</strong> 296</p>
                <p><strong>Symbol:</strong> HBAR</p>
                <p><strong>Explorer:</strong> https://hashscan.io/testnet</p>
              </div>
            </details>
          </div>
        )}

        {/* Token Balance */}
        {isCorrectNetwork && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Token Balance:</span>
              <span className="font-semibold text-gray-900">
                {balance ? Number(balance).toLocaleString() : '0'} tokens
              </span>
            </div>
          </div>
        )}

        {/* User Roles */}
        {roles.isManager && (
          <div className="flex flex-wrap gap-2">
            {roles.hasAdminRole && (
              <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                Admin
              </Badge>
            )}
            {roles.hasMinterRole && (
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                Minter
              </Badge>
            )}
            {roles.hasPauserRole && (
              <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Pauser
              </Badge>
            )}
            {roles.hasPropertyManagerRole && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                Property Manager
              </Badge>
            )}
          </div>
        )}
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
          <Wallet className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600 text-sm">
          Connect your wallet to start investing in tokenized real estate
        </p>
      </div>

      {!showConnectors ? (
        <Button
          onClick={() => setShowConnectors(true)}
          className="w-full"
          disabled={isPending}
        >
          Connect Wallet
        </Button>
      ) : (
        <div className="space-y-3">
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              onClick={() => {
                connect({ connector })
                setShowConnectors(false)
              }}
              variant="outline"
              className="w-full justify-start"
              disabled={isPending}
            >
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded bg-gray-100"></div>
                <span>{connector.name}</span>
              </div>
            </Button>
          ))}
          <Button
            variant="ghost"
            onClick={() => setShowConnectors(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      )}
    </Card>
  )
}