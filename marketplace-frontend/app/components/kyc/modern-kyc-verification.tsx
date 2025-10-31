"use client"

import { useState, useCallback } from 'react'
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from '../ui/modern-card'
import { Button } from '../ui/button'
import { ModernInput } from '../ui/modern-input'
import { ModernBadge, StatusBadge } from '../ui/modern-badge'
import { useAccount } from 'wagmi'
import { useUserKYCStatus, useSubmitKYC, InvestorType, KYCStatus } from '@/app/lib/web3/hooks/use-kyc-registry'
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Shield,
  X,
  Info,
  Building,
  UserCheck,
  Briefcase,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const INVESTOR_TYPES = [
  {
    type: InvestorType.RETAIL,
    title: 'Retail Investor',
    description: 'Individual investors with standard investment limits',
    icon: User,
    features: ['Up to $10,000 per investment', 'Basic verification required', 'Standard transaction fees']
  },
  {
    type: InvestorType.ACCREDITED,
    title: 'Accredited Investor',
    description: 'Qualified investors with higher limits and exclusive access',
    icon: UserCheck,
    features: ['Up to $100,000 per investment', 'Enhanced verification required', 'Priority access to new properties', 'Reduced transaction fees']
  },
  {
    type: InvestorType.INSTITUTIONAL,
    title: 'Institutional',
    description: 'Organizations and institutional entities',
    icon: Building,
    features: ['Unlimited investment amounts', 'Institutional-grade verification', 'Bulk investment options', 'Dedicated account management']
  }
]

const REQUIRED_DOCUMENTS = [
  {
    id: 'id_document',
    name: 'Government ID',
    description: 'Passport, Driver\'s License, or National ID',
    required: true,
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    maxSize: '10MB'
  },
  {
    id: 'proof_of_address',
    name: 'Proof of Address',
    description: 'Utility bill, bank statement, or lease agreement (dated within 3 months)',
    required: true,
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    maxSize: '10MB'
  },
  {
    id: 'accreditation_proof',
    name: 'Accreditation Certificate',
    description: 'Required for accredited investor status',
    required: false,
    dependsOn: InvestorType.ACCREDITED,
    acceptedFormats: ['PDF'],
    maxSize: '10MB'
  },
  {
    id: 'institutional_docs',
    name: 'Corporate Documents',
    description: 'Articles of incorporation, board resolutions, etc.',
    required: false,
    dependsOn: InvestorType.INSTITUTIONAL,
    acceptedFormats: ['PDF'],
    maxSize: '20MB'
  }
]

const STATUS_CONFIG = {
  [KYCStatus.NONE]: {
    label: 'Not Submitted',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: Clock,
    description: 'KYC verification has not been submitted'
  },
  [KYCStatus.PENDING]: {
    label: 'Under Review',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Clock,
    description: 'Your application is being reviewed by our compliance team'
  },
  [KYCStatus.APPROVED]: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Your KYC has been approved and you can start investing'
  },
  [KYCStatus.DENIED]: {
    label: 'Denied',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertCircle,
    description: 'Your KYC application was denied. Please resubmit with correct information'
  },
  [KYCStatus.EXPIRED]: {
    label: 'Expired',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: AlertCircle,
    description: 'Your KYC has expired and needs to be renewed'
  }
}

interface UploadedDocument {
  id: string
  name: string
  file?: File
  hash?: string
  uploaded: boolean
  error?: string
}

export function ModernKYCVerification() {
  const [selectedInvestorType, setSelectedInvestorType] = useState<InvestorType>(InvestorType.RETAIL)
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])
  const [documentHash, setDocumentHash] = useState('')
  const [currentStep, setCurrentStep] = useState<'select-type' | 'upload-docs' | 'review'>('select-type')
  const [dragOver, setDragOver] = useState<string | null>(null)

  const { address, isConnected } = useAccount()
  const { status, isApproved, isAccredited, record } = useUserKYCStatus(address)
  const { submitKYC, isPending, isConfirming, isConfirmed, error } = useSubmitKYC()

  const currentStatusConfig = STATUS_CONFIG[status || KYCStatus.NONE]

  // File upload handlers
  const handleFileUpload = useCallback((documentId: string, file: File) => {
    // Mock file upload - in production this would upload to IPFS
    const mockHash = `QmHash${Math.random().toString(36).substring(2, 15)}`

    setUploadedDocuments(prev => {
      const existing = prev.find(doc => doc.id === documentId)
      if (existing) {
        return prev.map(doc =>
          doc.id === documentId
            ? { ...doc, file, hash: mockHash, uploaded: true, error: undefined }
            : doc
        )
      }
      return [...prev, {
        id: documentId,
        name: file.name,
        file,
        hash: mockHash,
        uploaded: true
      }]
    })

    // Set the document hash from the first uploaded file
    if (!documentHash) {
      setDocumentHash(mockHash)
    }
  }, [documentHash])

  const handleDrop = useCallback((e: React.DragEvent, documentId: string) => {
    e.preventDefault()
    setDragOver(null)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(documentId, files[0])
    }
  }, [handleFileUpload])

  const handleSubmit = async () => {
    if (!documentHash.trim()) {
      return
    }

    try {
      await submitKYC(documentHash, selectedInvestorType)
    } catch (err) {
      console.error('Failed to submit KYC:', err)
    }
  }

  const removeDocument = (documentId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }

  const getRequiredDocuments = () => {
    return REQUIRED_DOCUMENTS.filter(doc =>
      doc.required ||
      doc.dependsOn === selectedInvestorType
    )
  }

  const isStepComplete = (step: string) => {
    switch (step) {
      case 'select-type':
        return selectedInvestorType !== undefined
      case 'upload-docs':
        const requiredDocs = getRequiredDocuments()
        return requiredDocs.every(doc =>
          uploadedDocuments.some(uploaded => uploaded.id === doc.id && uploaded.uploaded)
        )
      case 'review':
        return true
      default:
        return false
    }
  }

  if (!isConnected) {
    return (
      <ModernCard variant="glass" className="p-8">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Wallet Connection Required</h3>
          <p className="text-gray-600 mb-6">Connect your wallet to begin the KYC verification process</p>
          <Button variant="gradient">
            Connect Wallet
          </Button>
        </div>
      </ModernCard>
    )
  }

  // Show status for existing KYC
  if (status && status !== KYCStatus.NONE && status !== KYCStatus.DENIED && status !== KYCStatus.EXPIRED) {
    const StatusIcon = currentStatusConfig.icon

    return (
      <ModernCard variant="elevated" className="p-8">
        <div className="text-center">
          <div className={cn(
            "h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4",
            status === KYCStatus.APPROVED ? "bg-green-100" : "bg-orange-100"
          )}>
            <StatusIcon className={cn(
              "h-8 w-8",
              status === KYCStatus.APPROVED ? "text-green-600" : "text-orange-600"
            )} />
          </div>

          <StatusBadge
            status={status === KYCStatus.APPROVED ? 'approved' : 'pending'}
            className="mb-4"
          />

          <h3 className="text-lg font-semibold mb-2">KYC Status</h3>
          <p className="text-gray-600 mb-6">{currentStatusConfig.description}</p>

          {record && (
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Investor Type:</span>
                  <p className="font-medium">{INVESTOR_TYPES.find(t => t.type === record.investorType)?.title}</p>
                </div>
                <div>
                  <span className="text-gray-500">Submitted:</span>
                  <p className="font-medium">{new Date(Number(record.submittedAt) * 1000).toLocaleDateString()}</p>
                </div>
                {record.expiresAt && (
                  <div className="md:col-span-2">
                    <span className="text-gray-500">Expires:</span>
                    <p className="font-medium">{new Date(Number(record.expiresAt) * 1000).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {record.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Rejection Reason:</strong> {record.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </ModernCard>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { key: 'select-type', label: 'Select Type', icon: Briefcase },
          { key: 'upload-docs', label: 'Upload Documents', icon: Upload },
          { key: 'review', label: 'Review & Submit', icon: Shield }
        ].map((step, index) => {
          const Icon = step.icon
          const isActive = currentStep === step.key
          const isCompleted = isStepComplete(step.key) && !isActive

          return (
            <div key={step.key} className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                isCompleted ? "bg-teal-600 border-teal-600 text-white" :
                isActive ? "border-teal-600 text-teal-600 bg-white" :
                "border-gray-300 text-gray-400 bg-white"
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              <div className="ml-3 hidden sm:block">
                <p className={cn(
                  "text-sm font-medium",
                  isActive ? "text-teal-600" :
                  isCompleted ? "text-gray-900" :
                  "text-gray-500"
                )}>
                  {step.label}
                </p>
              </div>

              {index < 2 && (
                <ChevronRight className="w-5 h-5 text-gray-300 mx-4" />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 'select-type' && (
          <motion.div
            key="select-type"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <ModernCard variant="soft" hover>
              <ModernCardHeader>
                <ModernCardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Select Your Investor Type
                </ModernCardTitle>
                <p className="text-gray-600">
                  Choose the investor category that best describes you to determine your investment limits and requirements.
                </p>
              </ModernCardHeader>
              <ModernCardContent>
                <div className="grid gap-4">
                  {INVESTOR_TYPES.map((investorType) => {
                    const Icon = investorType.icon
                    const isSelected = selectedInvestorType === investorType.type

                    return (
                      <motion.div
                        key={investorType.type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <button
                          onClick={() => setSelectedInvestorType(investorType.type)}
                          className={cn(
                            "w-full p-6 rounded-lg border-2 text-left transition-all",
                            isSelected
                              ? "border-teal-500 bg-teal-50 ring-2 ring-teal-500/20"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "p-3 rounded-lg",
                              isSelected ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"
                            )}>
                              <Icon className="h-6 w-6" />
                            </div>

                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {investorType.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3">
                                {investorType.description}
                              </p>

                              <ul className="space-y-1">
                                {investorType.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                                    <CheckCircle className="h-3 w-3 text-teal-500" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {isSelected && (
                              <CheckCircle className="h-6 w-6 text-teal-600" />
                            )}
                          </div>
                        </button>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Button
                    onClick={() => setCurrentStep('upload-docs')}
                    disabled={!selectedInvestorType}
                    variant="gradient"
                    size="lg"
                    className="w-full"
                  >
                    Continue to Document Upload
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </ModernCardContent>
            </ModernCard>
          </motion.div>
        )}

        {currentStep === 'upload-docs' && (
          <motion.div
            key="upload-docs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <ModernCard variant="soft" hover>
              <ModernCardHeader>
                <ModernCardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Required Documents
                </ModernCardTitle>
                <p className="text-gray-600">
                  Please upload the following documents for verification. All files should be clear, legible, and in color.
                </p>
              </ModernCardHeader>
              <ModernCardContent>
                <div className="space-y-6">
                  {getRequiredDocuments().map((doc) => {
                    const uploaded = uploadedDocuments.find(u => u.id === doc.id)

                    return (
                      <div key={doc.id} className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{doc.name}</h4>
                            <p className="text-sm text-gray-600">{doc.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Accepted: {doc.acceptedFormats.join(', ')} • Max size: {doc.maxSize}
                            </p>
                          </div>
                          {doc.required && (
                            <Badge variant="secondary" className="text-xs">Required</Badge>
                          )}
                        </div>

                        {uploaded ? (
                          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium text-green-900">{uploaded.name}</p>
                                <p className="text-sm text-green-700">Upload successful</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument(doc.id)}
                              className="text-green-700 hover:text-green-900"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                              dragOver === doc.id
                                ? "border-teal-500 bg-teal-50"
                                : "border-gray-300 hover:border-gray-400"
                            )}
                            onDrop={(e) => handleDrop(e, doc.id)}
                            onDragOver={(e) => {
                              e.preventDefault()
                              setDragOver(doc.id)
                            }}
                            onDragLeave={() => setDragOver(null)}
                          >
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                            <p className="text-sm text-gray-600 mb-2">
                              Drag and drop your file here, or{' '}
                              <label className="text-teal-600 hover:text-teal-700 cursor-pointer font-medium">
                                browse
                                <input
                                  type="file"
                                  className="hidden"
                                  accept={doc.acceptedFormats.map(f => `.${f.toLowerCase()}`).join(',')}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleFileUpload(doc.id, file)
                                  }}
                                />
                              </label>
                            </p>
                            <p className="text-xs text-gray-500">
                              {doc.acceptedFormats.join(', ')} up to {doc.maxSize}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Document Hash Display */}
                  {documentHash && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        <p className="font-medium text-blue-900">Document Hash Generated</p>
                      </div>
                      <p className="text-sm text-blue-800 font-mono break-all">{documentHash}</p>
                      <p className="text-xs text-blue-700 mt-1">
                        This hash represents your uploaded documents on the blockchain
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('select-type')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep('review')}
                    disabled={!isStepComplete('upload-docs')}
                    variant="gradient"
                    className="flex-1"
                  >
                    Review Application
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </ModernCardContent>
            </ModernCard>
          </motion.div>
        )}

        {currentStep === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <ModernCard variant="soft" hover>
              <ModernCardHeader>
                <ModernCardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Review Your Application
                </ModernCardTitle>
                <p className="text-gray-600">
                  Please review your information before submitting your KYC application.
                </p>
              </ModernCardHeader>
              <ModernCardContent className="space-y-6">
                {/* Investor Type Summary */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Selected Investor Type</h4>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const investorType = INVESTOR_TYPES.find(t => t.type === selectedInvestorType)
                      const Icon = investorType?.icon || User
                      return (
                        <>
                          <Icon className="h-5 w-5 text-teal-600" />
                          <span className="font-medium">{investorType?.title}</span>
                        </>
                      )
                    })()}
                  </div>
                </div>

                {/* Documents Summary */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Uploaded Documents</h4>
                  <div className="space-y-2">
                    {uploadedDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{doc.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Hash */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Document Hash (Blockchain Reference)
                  </label>
                  <ModernInput
                    value={documentHash}
                    readOnly
                    variant="bordered"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    This cryptographic hash will be stored on the blockchain as proof of your document submission
                  </p>
                </div>

                {/* Terms and Conditions */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 h-4 w-4 text-teal-600 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I confirm that all information provided is accurate and up-to-date. I understand that providing false information may result in application rejection and potential legal consequences. I consent to the processing of my personal data for KYC verification purposes.
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('upload-docs')}
                    className="flex-1"
                  >
                    Back to Documents
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!documentHash.trim() || isPending || isConfirming}
                    variant="glow"
                    className="flex-1"
                    size="lg"
                  >
                    {isPending ? 'Preparing Transaction...' :
                     isConfirming ? 'Submitting to Blockchain...' :
                     'Submit KYC Application'}
                  </Button>
                </div>

                {/* Status Messages */}
                <AnimatePresence>
                  {isConfirmed && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Application Submitted Successfully!</p>
                        <p className="text-sm">Your KYC application has been submitted to the blockchain. You will receive an email notification when it's reviewed.</p>
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
                    >
                      <AlertCircle className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Submission Failed</p>
                        <p className="text-sm">There was an error submitting your application. Please try again.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </ModernCardContent>
            </ModernCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}