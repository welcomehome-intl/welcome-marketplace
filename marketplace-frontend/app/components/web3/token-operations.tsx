"use client"

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Badge } from '@/app/components/ui/badge'
import { Coins, Flame, Clock, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useMintTokens, useBurnTokens, useTokenInfo, useMintCooldown } from '@/app/lib/web3/hooks/use-property-token'
import { useUserRoles } from '@/app/lib/web3/hooks/use-roles'

export function TokenOperations() {
  const { address } = useAccount()
  const [mintAmount, setMintAmount] = useState('')
  const [mintToAddress, setMintToAddress] = useState('')
  const [burnAmount, setBurnAmount] = useState('')

  const tokenInfo = useTokenInfo()
  const { cooldownRemaining } = useMintCooldown(address)
  const roles = useUserRoles(address)

  const mintTokens = useMintTokens()
  const burnTokens = useBurnTokens()

  const handleMint = async () => {
    if (!mintAmount || !mintToAddress) return

    try {
      const amount = parseEther(mintAmount)
      mintTokens.mint(mintToAddress as `0x${string}`, amount)
    } catch (error) {
      console.error('Mint error:', error)
    }
  }

  const handleBurn = async () => {
    if (!burnAmount) return

    try {
      const amount = parseEther(burnAmount)
      burnTokens.burn(amount)
    } catch (error) {
      console.error('Burn error:', error)
    }
  }

  const canMint = roles.hasMinterRole && (!cooldownRemaining || cooldownRemaining === 0n)

  return (
    <div className="space-y-6">
      {/* Token Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold">{tokenInfo.name || 'Loading...'}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Symbol</p>
              <p className="font-semibold">{tokenInfo.symbol || 'Loading...'}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Supply</p>
              <p className="font-semibold">
                {tokenInfo.totalSupply ? Number(formatEther(tokenInfo.totalSupply)).toLocaleString() : '0'}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="font-semibold">
                {tokenInfo.remainingTokens ? Number(formatEther(tokenInfo.remainingTokens)).toLocaleString() : '0'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mint Tokens */}
      {roles.hasMinterRole && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Mint Tokens
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                Minter Role
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cooldownRemaining && cooldownRemaining > 0n && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">
                  Cooldown remaining: {Number(cooldownRemaining)} seconds
                </span>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Recipient Address</label>
                <Input
                  placeholder="0x..."
                  value={mintToAddress}
                  onChange={(e) => setMintToAddress(e.target.value)}
                  disabled={mintTokens.isPending}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount (in ETH)</label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  disabled={mintTokens.isPending}
                />
              </div>
            </div>

            <Button
              onClick={handleMint}
              disabled={!canMint || mintTokens.isPending || !mintAmount || !mintToAddress}
              className="w-full"
            >
              {mintTokens.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting...
                </>
              ) : mintTokens.isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <Coins className="mr-2 h-4 w-4" />
                  Mint Tokens
                </>
              )}
            </Button>

            {mintTokens.isConfirmed && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Tokens minted successfully!</span>
              </div>
            )}

            {mintTokens.error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">
                  Error: {mintTokens.error.message}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Burn Tokens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Burn Tokens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount to Burn (in ETH)</label>
            <Input
              type="number"
              placeholder="0.0"
              value={burnAmount}
              onChange={(e) => setBurnAmount(e.target.value)}
              disabled={burnTokens.isPending}
            />
          </div>

          <Button
            onClick={handleBurn}
            disabled={burnTokens.isPending || !burnAmount}
            variant="destructive"
            className="w-full"
          >
            {burnTokens.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Burning...
              </>
            ) : burnTokens.isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <Flame className="mr-2 h-4 w-4" />
                Burn Tokens
              </>
            )}
          </Button>

          {burnTokens.isConfirmed && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">Tokens burned successfully!</span>
            </div>
          )}

          {burnTokens.error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">
                Error: {burnTokens.error.message}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}