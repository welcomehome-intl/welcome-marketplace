"use client"

import { KYCSubmission } from "@/app/components/kyc/kyc-submission"

// Disable static rendering for this page
export const dynamic = 'force-dynamic'

export default function KYCPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
        <p className="text-gray-600">
          Complete your Know Your Customer (KYC) verification to start investing in properties
        </p>
      </div>

      <KYCSubmission />
    </div>
  )
}