"use client"

import { useState } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Label } from "../ui/label"
import {
  User,
  Mail,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  X,
  Loader2,
  Save
} from "lucide-react"
import { useUserProfile } from "@/app/lib/supabase/hooks/use-user-profile"
import { useAccount } from "wagmi"

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { address } = useAccount()
  const { profile, isLoading, error, updateProfile } = useUserProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
  })

  if (!isOpen) return null

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getKYCStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'expired':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) return

    setIsSaving(true)
    try {
      await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim() || null,
      })
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to save profile:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      email: profile?.email || '',
    })
    setIsEditing(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">User Profile</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <>
              {/* Wallet Address */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Wallet Address</Label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-mono text-sm">{address ? formatAddress(address) : 'Not connected'}</span>
                </div>
              </div>

              {/* KYC Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Verification Status</Label>
                <Badge className={`inline-flex items-center gap-2 ${getKYCStatusColor(profile?.kyc_status || 'pending')}`}>
                  {getKYCStatusIcon(profile?.kyc_status || 'pending')}
                  {profile?.kyc_status?.charAt(0).toUpperCase() + profile?.kyc_status?.slice(1) || 'Pending'}
                </Badge>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Display Name</Label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your display name"
                    className="w-full"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{profile?.name || 'Not set'}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Email (Optional)</Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{profile?.email || 'Not set'}</span>
                  </div>
                )}
              </div>

              {/* Account Created */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Member Since</Label>
                <div className="text-sm text-gray-600">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2 p-6 border-t">
          {isEditing ? (
            <>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1"
                disabled={isSaving || !formData.name.trim()}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex-1"
              disabled={isLoading}
            >
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}