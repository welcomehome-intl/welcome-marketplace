"use client"

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { CONTRACT_ADDRESSES } from '@/app/lib/web3/addresses'

interface ContractStatus {
  name: string
  address: string
  deployed: boolean
  verified?: boolean
  explorerUrl?: string
}

export function DeploymentStatusBanner() {
  const [isExpanded, setIsExpanded] = useState(false)

  // Check contract deployment status
  const contracts: ContractStatus[] = [
    {
      name: 'AccessControl',
      address: CONTRACT_ADDRESSES.ACCESS_CONTROL,
      deployed: CONTRACT_ADDRESSES.ACCESS_CONTROL !== '0x0000000000000000000000000000000000000000',
      explorerUrl: `https://hashscan.io/testnet/contract/${CONTRACT_ADDRESSES.ACCESS_CONTROL}`
    },
    {
      name: 'OwnershipRegistry',
      address: CONTRACT_ADDRESSES.OWNERSHIP_REGISTRY,
      deployed: CONTRACT_ADDRESSES.OWNERSHIP_REGISTRY !== '0x0000000000000000000000000000000000000000',
      explorerUrl: `https://hashscan.io/testnet/contract/${CONTRACT_ADDRESSES.OWNERSHIP_REGISTRY}`
    },
    {
      name: 'PropertyFactory',
      address: CONTRACT_ADDRESSES.PROPERTY_FACTORY,
      deployed: CONTRACT_ADDRESSES.PROPERTY_FACTORY !== '0x0000000000000000000000000000000000000000',
      explorerUrl: `https://hashscan.io/testnet/contract/${CONTRACT_ADDRESSES.PROPERTY_FACTORY}`
    },
    {
      name: 'PaymentToken',
      address: CONTRACT_ADDRESSES.PAYMENT_TOKEN,
      deployed: CONTRACT_ADDRESSES.PAYMENT_TOKEN !== '0x0000000000000000000000000000000000000000',
      explorerUrl: `https://hashscan.io/testnet/contract/${CONTRACT_ADDRESSES.PAYMENT_TOKEN}`
    },
    {
      name: 'Marketplace',
      address: CONTRACT_ADDRESSES.MARKETPLACE,
      deployed: CONTRACT_ADDRESSES.MARKETPLACE !== '0x0000000000000000000000000000000000000000',
      explorerUrl: `https://hashscan.io/testnet/contract/${CONTRACT_ADDRESSES.MARKETPLACE}`
    },
  ]

  const deployedCount = contracts.filter(c => c.deployed).length
  const totalCount = contracts.length
  const allDeployed = deployedCount === totalCount
  const noneDeployed = deployedCount === 0

  // Don't show banner if all contracts are deployed
  if (allDeployed) {
    return null
  }

  return (
    <div className="sticky top-0 z-50">
      <Card className={`rounded-none border-x-0 border-t-0 shadow-md ${
        noneDeployed ? 'border-l-4 border-l-red-500 bg-red-50' :
        deployedCount < totalCount ? 'border-l-4 border-l-yellow-500 bg-yellow-50' :
        'border-l-4 border-l-green-500 bg-green-50'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {noneDeployed ? (
                <AlertCircle className="h-6 w-6 text-red-600" />
              ) : deployedCount < totalCount ? (
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}

              <div>
                <CardTitle className="text-base">
                  {noneDeployed ? 'Contracts Not Deployed' :
                   deployedCount < totalCount ? 'Partial Deployment' :
                   'All Contracts Deployed'}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {deployedCount} of {totalCount} smart contracts deployed to Hedera Testnet
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={noneDeployed ? 'destructive' : deployedCount < totalCount ? 'default' : 'outline'}>
                {deployedCount}/{totalCount}
              </Badge>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0 pb-4">
            <div className="space-y-3">
              {contracts.map((contract) => (
                <div
                  key={contract.name}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {contract.deployed ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    )}

                    <div>
                      <p className="font-medium text-sm">{contract.name}</p>
                      <p className="text-xs font-mono text-gray-500">
                        {contract.deployed
                          ? `${contract.address.slice(0, 10)}...${contract.address.slice(-8)}`
                          : 'Not configured'}
                      </p>
                    </div>
                  </div>

                  {contract.deployed && (
                    <a
                      href={contract.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                    >
                      View on HashScan
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}

              {!allDeployed && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Next Steps:
                  </p>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Deploy smart contracts to Hedera Testnet</li>
                    <li>Update `.env.local` with contract addresses</li>
                    <li>Restart the development server</li>
                    <li>Test the integration</li>
                  </ol>
                  <div className="mt-3">
                    <a
                      href="/INTEGRATION_README.md"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      Read Integration Guide
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
