"use client"

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useAccount } from 'wagmi'
import { FileText, Upload, CheckCircle, AlertCircle, Clock, User, Loader2 } from 'lucide-react'
import { useAutoKYC } from '@/app/lib/web3/hooks/use-auto-kyc'
import { useFileUpload } from '@/app/lib/supabase/hooks/use-file-upload'
import { generateFilePath } from '@/app/lib/supabase/storage'
import { useUserProfile } from '@/app/lib/supabase/hooks/use-user-profile'

type InvestorTypeOption = 'RETAIL' | 'ACCREDITED' | 'INSTITUTIONAL'

const INVESTOR_TYPE_LABELS: Record<InvestorTypeOption, string> = {
  RETAIL: 'Retail Investor',
  ACCREDITED: 'Accredited Investor',
  INSTITUTIONAL: 'Institutional Investor',
}

interface UploadedDocument {
  name: string
  url: string
  path: string
}

export function KYCSubmission() {
  const { address, isConnected } = useAccount()
  const { profile, refresh: refreshProfile } = useUserProfile()

  // Form state
  const [investorType, setInvestorType] = useState<InvestorTypeOption>('RETAIL')
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([])
  const [currentStep, setCurrentStep] = useState<'upload' | 'submitting' | 'approving' | 'complete'>('upload')

  // Hooks
  const { upload, isUploading, error: uploadError, reset: resetUpload } = useFileUpload()
  const {
    submitAndApproveKYC,
    autoApproveAfterSubmit,
    isSubmitting,
    isApproving,
    isComplete,
    error: kycError,
    submitTxHash,
    approveTxHash,
    isSubmitSuccess,
    reset: resetKYC,
  } = useAutoKYC()

  // Auto-approve after submission success
  useEffect(() => {
    if (isSubmitSuccess && address && currentStep === 'submitting') {
      setCurrentStep('approving')
      autoApproveAfterSubmit(address as `0x${string}`)
    }
  }, [isSubmitSuccess, address, currentStep, autoApproveAfterSubmit])

  // Complete flow
  useEffect(() => {
    if (isComplete) {
      setCurrentStep('complete')
      refreshProfile() // Refresh profile to get updated KYC status
    }
  }, [isComplete, refreshProfile])

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!address) return

    resetUpload()

    const filePath = generateFilePath('kyc', file.name, address.toLowerCase())
    const result = await upload(file, 'kyc-documents', filePath)

    if (result.success && result.url && result.path) {
      setUploadedDocs(prev => [
        ...prev,
        {
          name: documentType,
          url: result.url!,
          path: result.path!,
        }
      ])
    }
  }

  const handleSubmit = async () => {
    if (!address || uploadedDocs.length === 0) return

    try {
      setCurrentStep('submitting')

      // Prepare document hashes/URLs
      const documentHashes = uploadedDocs.map(doc => doc.url)

      // Submit and auto-approve
      await submitAndApproveKYC(address as `0x${string}`, {
        documentHashes,
        investorType,
      })

    } catch (err) {
      console.error('KYC submission failed:', err)
      setCurrentStep('upload')
    }
  }

  const handleReset = () => {
    setUploadedDocs([])
    setCurrentStep('upload')
    resetKYC()
    resetUpload()
  }

  // Check if already verified
  const isVerified = profile?.kyc_status === 'approved'

  if (!isConnected) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Connect your wallet to access KYC verification</p>
        </div>
      </Card>
    )
  }

  if (isVerified) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-xl font-semibold mb-2 text-green-700">KYC Verified</h3>
          <p className="text-gray-600 mb-4">
            Your account is verified and you can now invest in properties.
          </p>
          <Badge className="bg-green-100 text-green-800">
            Verified Investor
          </Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            KYC Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {profile?.kyc_status === 'pending' ? (
                <>
                  <Clock className="h-5 w-5 text-orange-500" />
                  <Badge className="bg-orange-100 text-orange-800">Pending Review</Badge>
                </>
              ) : profile?.kyc_status === 'rejected' ? (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-gray-500" />
                  <Badge className="bg-gray-100 text-gray-800">Not Submitted</Badge>
                </>
              )}
            </div>

            {/* Progress Steps */}
            {(currentStep !== 'upload') && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {currentStep === 'submitting' ? (
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm">Step 1: Submitting to Blockchain</p>
                    {submitTxHash && (
                      <p className="text-xs text-gray-500 font-mono">
                        Tx: {submitTxHash.slice(0, 10)}...{submitTxHash.slice(-8)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {currentStep === 'approving' ? (
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  ) : currentStep === 'complete' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                  <div>
                    <p className="font-medium text-sm">Step 2: Auto-Approving KYC</p>
                    {approveTxHash && (
                      <p className="text-xs text-gray-500 font-mono">
                        Tx: {approveTxHash.slice(0, 10)}...{approveTxHash.slice(-8)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {currentStep === 'complete' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                  <p className="font-medium text-sm">Step 3: Verification Complete</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KYC Submission Form */}
      {currentStep === 'upload' && !isVerified && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Submit KYC Application
            </CardTitle>
            <p className="text-sm text-gray-600">
              Upload your documents and get instant verification (MVP auto-approval)
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Investor Type Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Investor Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(Object.keys(INVESTOR_TYPE_LABELS) as InvestorTypeOption[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setInvestorType(type)}
                    className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                      investorType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {INVESTOR_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Retail:</strong> Standard investment limits and restrictions apply</p>
                <p><strong>Accredited:</strong> Higher investment limits for qualified investors</p>
                <p><strong>Institutional:</strong> For organizations and institutional entities</p>
              </div>
            </div>

            {/* Document Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Required Documents
              </label>
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* ID Document */}
                  <div>
                    <input
                      type="file"
                      id="id-document"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, 'ID Document')
                      }}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="id-document"
                      className={`h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        uploadedDocs.some(d => d.name === 'ID Document')
                          ? 'border-green-300 bg-green-50'
                          : isUploading
                          ? 'border-blue-300 bg-blue-50 cursor-wait'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {uploadedDocs.some(d => d.name === 'ID Document') ? (
                        <>
                          <CheckCircle className="h-6 w-6 text-green-500" />
                          <span className="text-sm font-medium text-green-700">ID Uploaded</span>
                        </>
                      ) : isUploading ? (
                        <>
                          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                          <span className="text-sm font-medium text-blue-700">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">ID Document</span>
                          <span className="text-xs text-gray-500">PDF, JPG, PNG</span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Proof of Address */}
                  <div>
                    <input
                      type="file"
                      id="proof-address"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, 'Proof of Address')
                      }}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="proof-address"
                      className={`h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        uploadedDocs.some(d => d.name === 'Proof of Address')
                          ? 'border-green-300 bg-green-50'
                          : isUploading
                          ? 'border-blue-300 bg-blue-50 cursor-wait'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {uploadedDocs.some(d => d.name === 'Proof of Address') ? (
                        <>
                          <CheckCircle className="h-6 w-6 text-green-500" />
                          <span className="text-sm font-medium text-green-700">Address Uploaded</span>
                        </>
                      ) : isUploading ? (
                        <>
                          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                          <span className="text-sm font-medium text-blue-700">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">Proof of Address</span>
                          <span className="text-xs text-gray-500">PDF, JPG, PNG</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Accreditation Certificate (if accredited) */}
                {investorType === 'ACCREDITED' && (
                  <div>
                    <input
                      type="file"
                      id="accreditation-cert"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, 'Accreditation Certificate')
                      }}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="accreditation-cert"
                      className={`h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        uploadedDocs.some(d => d.name === 'Accreditation Certificate')
                          ? 'border-green-300 bg-green-50'
                          : isUploading
                          ? 'border-blue-300 bg-blue-50 cursor-wait'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {uploadedDocs.some(d => d.name === 'Accreditation Certificate') ? (
                        <>
                          <CheckCircle className="h-6 w-6 text-green-500" />
                          <span className="text-sm font-medium text-green-700">Certificate Uploaded</span>
                        </>
                      ) : isUploading ? (
                        <>
                          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                          <span className="text-sm font-medium text-blue-700">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">Accreditation Certificate</span>
                          <span className="text-xs text-gray-500">PDF, JPG, PNG</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>

              {/* Uploaded Files List */}
              {uploadedDocs.length > 0 && (
                <div className="space-y-2 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Uploaded Documents:</p>
                  <div className="space-y-1">
                    {uploadedDocs.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span>{doc.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error Messages */}
            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Upload failed: {uploadError}</span>
                </div>
              </div>
            )}

            {kycError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">KYC submission failed: {kycError}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={uploadedDocs.length < 2 || isUploading || isSubmitting || isApproving}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting to Blockchain...
                </>
              ) : isApproving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Auto-Approving KYC...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit & Get Instant Verification
                </>
              )}
            </Button>

            {/* Info */}
            <div className="text-xs text-gray-500 space-y-1 p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-800">MVP Auto-Approval:</p>
              <p>• Upload at least 2 documents (ID + Proof of Address)</p>
              <p>• Your KYC will be automatically approved after submission</p>
              <p>• Production will include manual review by compliance team</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Card */}
      {currentStep === 'complete' && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-semibold mb-2 text-green-700">KYC Verified!</h3>
            <p className="text-gray-600 mb-4">
              Your KYC has been successfully verified. You can now invest in properties.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Documents uploaded and stored securely</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Blockchain verification completed</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Auto-approval processed</span>
              </div>
            </div>
            <Button
              onClick={() => window.location.href = '/marketplace'}
              size="lg"
            >
              Start Investing
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
