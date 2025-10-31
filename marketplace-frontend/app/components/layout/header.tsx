"use client"


import { Search, Bell, Wallet, Home, User } from "lucide-react"

import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { useAccount } from "wagmi"
import { WalletConnect } from "../web3/wallet-connect"
import { NotificationBell } from "../ui/notifications"
import { UserProfileModal } from "../profile/user-profile-modal"
import { useUserProfile } from "@/app/lib/supabase/hooks/use-user-profile"
import { useState } from "react"

export function Header() {
  const { address, isConnected } = useAccount()
  const { profile } = useUserProfile()
  const [showProfileModal, setShowProfileModal] = useState(false)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-white px-6">
        {/* Page Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Welcome Home</h1>
              <p className="text-xs text-gray-500 -mt-1">International Group</p>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
            <Input
              type="search"
              placeholder="Search properties..."
              className="pl-10 pr-4"
            />
          </div>

          {/* KYC Status Badge - Only show if connected and verified */}
          {isConnected && profile?.kyc_status === 'approved' && (
            <Badge className="bg-green-100 text-green-800 border-green-300">
              Verified
            </Badge>
          )}

          {/* Wallet Connection */}
          <WalletConnect compact />

          {/* User Profile Button */}
          {isConnected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              {profile?.name && (
                <span className="hidden sm:inline text-sm">
                  {profile.name.length > 15 ? `${profile.name.slice(0, 15)}...` : profile.name}
                </span>
              )}
            </Button>
          )}

          {/* Real-time Notification Bell */}
          <NotificationBell />
        </div>
      </header>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  )
}