"use client"

import { useState } from "react"
import * as React from "react"
import { Card } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Badge } from "@/app/components/ui/badge"
import { Label } from "@/app/components/ui/label"
import { cn } from "@/app/lib/utils"
import { Upload, Mail, Bell, Shield, User, Save, Loader2, CheckCircle, Clock, XCircle, AlertTriangle, FileText } from "lucide-react"
import { useUserProfile } from "@/app/lib/supabase/hooks/use-user-profile"
import { useAccount } from "wagmi"
import { useMounted } from "@/app/lib/hooks/use-mounted"

const tabs = [
  { id: "profile", label: "Profile settings", icon: User },
  { id: "kyc", label: "KYC Verification", icon: FileText },
  { id: "security", label: "Security settings", icon: Shield },
  { id: "notifications", label: "Notification settings", icon: Bell },
  { id: "email", label: "Email settings", icon: Mail },
]

// Disable static rendering for this page
export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  const mounted = useMounted()
  const [activeTab, setActiveTab] = useState("profile")
  const { address, isConnected } = useAccount()
  const { profile, isAccredited } = useUserProfile()

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Settings...</h1>
        </div>
      </div>
    )
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isConnected) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Connect your wallet to access settings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-primary text-white text-2xl">
            {profile?.name ? profile.name.slice(0, 2).toUpperCase() : address?.slice(2, 4).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{profile?.name || 'Anonymous User'}</h2>
          <p className="text-gray-800 font-mono text-sm">{address ? formatAddress(address) : 'Not connected'}</p>
          <div className="flex gap-2 mt-2">
            <Badge className={getKYCStatusColor(profile?.kyc_status || 'pending')}>
              {profile?.kyc_status?.charAt(0).toUpperCase() + profile?.kyc_status?.slice(1) || 'Pending'}
            </Badge>
            {isAccredited && (
              <Badge className="bg-blue-100 text-blue-800">Accredited</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Settings Card */}
      <Card className="overflow-hidden">
        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2",
                    activeTab === tab.id
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-gray-700 hover:text-gray-800"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "kyc" && <KYCSettings />}
          {activeTab === "security" && <SecuritySettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "email" && <EmailSettings />}
        </div>
      </Card>
    </div>
  )
}

function KYCSettings() {
  const { profile } = useUserProfile()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<{
    idDocument: File | null
    proofOfAddress: File | null
  }>({
    idDocument: null,
    proofOfAddress: null
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docType: 'idDocument' | 'proofOfAddress') => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFiles(prev => ({ ...prev, [docType]: file }))
    }
  }

  const handleSubmitKYC = async () => {
    if (!selectedFiles.idDocument || !selectedFiles.proofOfAddress) {
      setUploadError('Please upload both required documents')
      return
    }

    setIsUploading(true)
    setUploadError('')
    setUploadSuccess(false)

    try {
      // In production, upload files to Supabase storage
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 2000))
      setUploadSuccess(true)
      setSelectedFiles({ idDocument: null, proofOfAddress: null })
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload documents')
    } finally {
      setIsUploading(false)
    }
  }

  const getKYCStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'expired':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getKYCStatusMessage = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Your KYC verification has been approved. You can now invest in properties.'
      case 'pending':
        return 'Your KYC documents are under review. This typically takes 1-3 business days.'
      case 'rejected':
        return 'Your KYC verification was rejected. Please resubmit your documents.'
      case 'expired':
        return 'Your KYC verification has expired. Please submit updated documents.'
      default:
        return 'Please submit your KYC documents to start investing.'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">KYC Verification</h3>
        <p className="text-sm text-gray-800 mb-6">
          Complete your KYC verification to unlock full access to property investments
        </p>

        {/* Current KYC Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-start gap-3">
            {getKYCStatusIcon(profile?.kyc_status || 'pending')}
            <div>
              <h4 className="font-medium mb-1">
                Status: {profile?.kyc_status?.charAt(0).toUpperCase() + profile?.kyc_status?.slice(1) || 'Pending'}
              </h4>
              <p className="text-sm text-gray-600">
                {getKYCStatusMessage(profile?.kyc_status || 'pending')}
              </p>
              {profile?.kyc_submitted_at && (
                <p className="text-xs text-gray-500 mt-2">
                  Submitted on: {new Date(profile.kyc_submitted_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Document Upload */}
        {profile?.kyc_status !== 'approved' && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Government-Issued ID Document
                <span className="text-red-500">*</span>
              </Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'idDocument')}
                  className="hidden"
                  id="id-document"
                />
                <label htmlFor="id-document" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">
                    {selectedFiles.idDocument ? selectedFiles.idDocument.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Passport, Driver's License, or National ID (PDF, JPG, PNG - Max 5MB)
                  </p>
                </label>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Proof of Address
                <span className="text-red-500">*</span>
              </Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'proofOfAddress')}
                  className="hidden"
                  id="proof-of-address"
                />
                <label htmlFor="proof-of-address" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">
                    {selectedFiles.proofOfAddress ? selectedFiles.proofOfAddress.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Utility Bill, Bank Statement, or Tax Document (PDF, JPG, PNG - Max 5MB)
                  </p>
                </label>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Document Requirements</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Documents must be clear and legible</li>
                <li>• All four corners of the document must be visible</li>
                <li>• Documents must be current (issued within last 3 months for proof of address)</li>
                <li>• Personal information must match across all documents</li>
              </ul>
            </div>

            {uploadSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <p className="font-medium">Documents submitted successfully! Your verification is under review.</p>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="font-medium">{uploadError}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleSubmitKYC}
                disabled={isUploading || !selectedFiles.idDocument || !selectedFiles.proofOfAddress}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit KYC Documents
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Approved Status */}
        {profile?.kyc_status === 'approved' && (
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h4 className="font-semibold text-green-900 mb-2">Verification Complete</h4>
            <p className="text-sm text-green-800">
              You are fully verified and can now access all investment opportunities on our platform.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ProfileSettings() {
  const { profile, updateProfile } = useUserProfile()
  const { address } = useAccount()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
  })

  // Update form when profile changes
  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
      })
    }
  }, [profile])

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

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 10)}...${addr.slice(-6)}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Personal Info</h3>
        <p className="text-sm text-gray-800 mb-6">Update your personal details and contact information.</p>

        {/* Wallet Address (Read-only) */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-2 block">Wallet Address</Label>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-mono text-sm">{address ? formatAddress(address) : 'Not connected'}</span>
          </div>
        </div>

        <div className="mb-6">
          <Label className="text-sm font-medium mb-2 block">Display Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your display name"
            disabled={!isEditing}
          />
        </div>

        <div className="mb-6">
          <Label className="text-sm font-medium mb-2 block">Email Address (Optional)</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter your email address"
            disabled={!isEditing}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Profile Photo</label>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>JM</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Click to upload or drag and drop
              </Button>
              <p className="text-xs text-gray-700 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Country</label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option>Australia</option>
              <option>United Kingdom</option>
              <option>United States</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option>PST UTC-08:00</option>
              <option>EST UTC-05:00</option>
              <option>GMT UTC+00:00</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.name.trim()}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Password</h3>
        <p className="text-sm text-gray-800 mb-6">Please enter your current password to change your password</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Current password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">New password</label>
            <Input type="password" placeholder="Your new password must be more than 8 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Confirm new password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button>Update password</Button>
      </div>
    </div>
  )
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">General notifications</h3>
        <p className="text-sm text-gray-800 mb-6">Set what you'll be notified in our service</p>

        <div className="space-y-4">
          <NotificationRow
            title="Earnings Report"
            description=""
            options={["None", "In-app", "Email"]}
          />
          <NotificationRow
            title="New Properties Listing"
            description=""
            options={["None", "In-app", "Email"]}
          />
          <NotificationRow
            title="Property Updates"
            description=""
            options={["None", "In-app", "Email"]}
          />
        </div>
      </div>
    </div>
  )
}

function EmailSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Email notifications</h3>
        <p className="text-sm text-gray-800 mb-6">Set up email notifications that you'll receive on your email.</p>

        <div className="space-y-4">
          <EmailToggle
            title="Newsletter"
            description="Receive the latest news, updates from us"
            enabled={true}
          />
          <EmailToggle
            title="Trading Alerts"
            description="Get notified about all buying and feature updates"
            enabled={true}
          />
        </div>
      </div>
    </div>
  )
}

function NotificationRow({ title, description, options }: { title: string, description: string, options: string[] }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium">{title}</p>
        {description && <p className="text-sm text-gray-700">{description}</p>}
      </div>
      <div className="flex gap-2">
        {options.map((option) => (
          <Button key={option} variant="outline" size="sm">
            {option}
          </Button>
        ))}
      </div>
    </div>
  )
}

function EmailToggle({ title, description, enabled }: { title: string, description: string, enabled: boolean }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-700">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" defaultChecked={enabled} className="rounded" />
      </div>
    </div>
  )
}