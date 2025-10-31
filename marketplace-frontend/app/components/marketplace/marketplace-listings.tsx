"use client"

import { useState, useEffect } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { formatUnits, parseUnits, Address } from 'viem'
import { useAccount } from 'wagmi'
import {
  useMarketplaceListing,
  useNextListingId,
  useListTokens,
  usePurchaseFromMarketplace
} from '@/app/lib/web3/hooks/use-token-handler'
import { useTokenBalance } from '@/app/lib/web3/hooks/use-property-token'
import { ShoppingCart, Plus, User, Clock, Coins, TrendingUp, CheckCircle2, Tag } from 'lucide-react'
import { motion } from 'framer-motion'

interface MarketplaceListingsProps {
  showCreateListing?: boolean
}

export function MarketplaceListings({ showCreateListing = true }: MarketplaceListingsProps) {
  const { address, isConnected } = useAccount()
  const nextListingId = useNextListingId()
  const [selectedListing, setSelectedListing] = useState<number | null>(null)

  // Get recent listings (last 20)
  const recentListingIds = Array.from(
    { length: Math.min(Number(nextListingId), 20) },
    (_, i) => Number(nextListingId) - i - 1
  ).filter(id => id >= 0)

  return (
    <div className="space-y-8">
      {showCreateListing && <CreateListing />}

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold mb-2 text-white">Marketplace Listings</h3>
            <p className="text-gray-300 text-lg">Buy and sell property tokens with other investors</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
            <ShoppingCart className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          {recentListingIds.length === 0 ? (
            <motion.div
              className="text-center py-16 bg-white/5 rounded-2xl backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-300 text-lg">No marketplace listings available</p>
            </motion.div>
          ) : (
            recentListingIds.map((listingId, index) => (
              <motion.div
                key={listingId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <ListingCard
                  listingId={listingId}
                  isSelected={selectedListing === listingId}
                  onSelect={() => setSelectedListing(listingId)}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function CreateListing() {
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')
  const [showForm, setShowForm] = useState(false)
  const { address } = useAccount()
  const { balance } = useTokenBalance(address)
  const { listTokens, isPending, isConfirming, isConfirmed, error } = useListTokens()

  const handleCreateListing = () => {
    if (!amount || !price) return

    try {
      const tokenAmount = parseUnits(amount, 18)
      const pricePerToken = parseUnits(price, 18)
      listTokens(tokenAmount, pricePerToken)
    } catch (err) {
      console.error('Error creating listing:', err)
    }
  }

  const resetForm = () => {
    setAmount('')
    setPrice('')
    setShowForm(false)
  }

  useEffect(() => {
    if (isConfirmed) {
      resetForm()
    }
  }, [isConfirmed])

  if (!showForm) {
    return (
      <motion.div
        className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <motion.div
              className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Tag className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Sell Your Tokens</h3>
              <p className="text-primary-100 text-lg">Create a listing to sell your property tokens</p>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setShowForm(true)}
              className="gap-2 bg-white text-primary-600 hover:bg-gray-100 px-6 py-6 text-lg font-semibold rounded-2xl shadow-lg transition-all duration-300"
            >
              <Plus className="h-5 w-5" />
              Create Listing
            </Button>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6 flex items-center gap-4">
        <motion.div
          className="bg-gradient-to-br from-primary-600 to-primary-700 p-3 rounded-2xl"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Tag className="h-6 w-6 text-white" />
        </motion.div>
        <div>
          <h3 className="text-2xl font-bold mb-1">Create Token Listing</h3>
          <p className="text-gray-600">
            Your Balance: <span className="font-semibold text-primary-600">{balance ? formatUnits(balance, 18) : '0'} tokens</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Amount to Sell
          </label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter token amount"
            min="0"
            step="0.000000000000000001"
            className="h-12 text-lg rounded-xl"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Price per Token (HBAR)
          </label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price in HBAR"
            min="0"
            step="0.000000000000000001"
            className="h-12 text-lg rounded-xl"
          />
        </div>
      </div>

      {amount && price && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl mb-6 border border-green-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-green-600" />
              <span className="text-gray-700 font-medium">Total Value:</span>
            </div>
            <span className="font-bold text-2xl text-green-700">
              {(parseFloat(amount) * parseFloat(price)).toFixed(6)} HBAR
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleCreateListing}
            disabled={!amount || !price || isPending || isConfirming}
            className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg"
          >
            {isPending ? 'Confirming...' :
             isConfirming ? 'Creating...' :
             'Create Listing'}
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={resetForm}
            variant="outline"
            className="h-14 px-8 text-lg font-semibold rounded-xl"
          >
            Cancel
          </Button>
        </motion.div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 font-medium">
            Failed to create listing. Please try again.
          </p>
        </div>
      )}
    </motion.div>
  )
}

interface ListingCardProps {
  listingId: number
  isSelected: boolean
  onSelect: () => void
}

function ListingCard({ listingId, isSelected, onSelect }: ListingCardProps) {
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const { address } = useAccount()
  const { listing } = useMarketplaceListing(listingId)
  const { purchaseFromMarketplace, isPending, isConfirming, error } = usePurchaseFromMarketplace()

  const handlePurchase = () => {
    if (!purchaseAmount || !listing) return

    try {
      const amount = parseUnits(purchaseAmount, 18)
      purchaseFromMarketplace(BigInt(listingId), amount)
    } catch (err) {
      console.error('Error purchasing from marketplace:', err)
    }
  }

  const calculateCost = () => {
    if (!purchaseAmount || !listing) return '0'
    try {
      const amount = parseUnits(purchaseAmount, 18)
      const cost = (amount * listing.pricePerToken) / BigInt(10**18)
      return formatUnits(cost, 18)
    } catch {
      return '0'
    }
  }

  if (!listing || !listing.isActive) {
    return null
  }

  const isOwnListing = address?.toLowerCase() === listing.seller.toLowerCase()
  const maxPurchaseAmount = listing.amount

  return (
    <Card
      className={`p-6 cursor-pointer transition-all duration-300 rounded-2xl border-2 ${
        isSelected
          ? 'ring-4 ring-primary-500/30 border-primary-500 shadow-2xl scale-[1.02]'
          : 'border-gray-200 hover:border-primary-300 hover:shadow-xl'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${
            isOwnListing
              ? 'bg-gradient-to-br from-purple-500 to-purple-600'
              : 'bg-gradient-to-br from-blue-500 to-blue-600'
          }`}>
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-lg text-gray-900">Listing #{listingId}</p>
            <p className="text-sm text-gray-600 font-mono">
              {listing.seller.slice(0, 8)}...{listing.seller.slice(-6)}
            </p>
          </div>
        </div>

        <div className="text-right">
          <Badge
            variant={isOwnListing ? "secondary" : "default"}
            className={`px-4 py-2 text-sm font-semibold rounded-full ${
              isOwnListing
                ? 'bg-purple-100 text-purple-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {isOwnListing ? "Your Listing" : "Available"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="h-4 w-4 text-gray-600" />
            <p className="text-sm font-semibold text-gray-700">Amount Available</p>
          </div>
          <p className="font-bold text-xl text-gray-900">{formatUnits(listing.amount, 18)} tokens</p>
        </div>
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-xl border border-primary-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary-700" />
            <p className="text-sm font-semibold text-primary-700">Price per Token</p>
          </div>
          <p className="font-bold text-xl text-primary-800">{formatUnits(listing.pricePerToken, 18)} HBAR</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl">
        <Clock className="h-4 w-4 text-gray-500" />
        <span className="font-medium">Listed {new Date(Number(listing.listingTime) * 1000).toLocaleDateString()}</span>
      </div>

      {isSelected && !isOwnListing && (
        <div className="border-t-2 border-gray-200 pt-6 space-y-4 mt-2">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Amount to Purchase
            </label>
            <Input
              type="number"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              max={formatUnits(maxPurchaseAmount, 18)}
              step="0.000000000000000001"
              className="h-12 text-lg rounded-xl"
            />
          </div>

          {purchaseAmount && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700 font-semibold">Total Cost:</span>
                </div>
                <span className="font-bold text-2xl text-blue-700">{calculateCost()} HBAR</span>
              </div>
            </div>
          )}

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handlePurchase}
              disabled={!purchaseAmount || isPending || isConfirming}
              className="w-full gap-2 h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all duration-300"
            >
              <ShoppingCart className="h-5 w-5" />
              {isPending ? 'Confirming Transaction...' :
               isConfirming ? 'Processing Purchase...' :
               'Purchase Tokens'}
            </Button>
          </motion.div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 font-medium">
                Purchase failed. Please try again.
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}