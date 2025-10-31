"use client"

import { PortfolioOverview } from '@/app/components/dashboard/portfolio-overview'

// Disable static rendering for this page
export const dynamic = 'force-dynamic'

/**
 * Portfolio Page
 * Shows user's owned property tokens with real balances from smart contracts
 */
export default function PortfolioPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold">My Portfolio</h2>
        <p className="text-gray-600 mt-1">
          View your property investments and token holdings
        </p>
      </div>

      <PortfolioOverview />
    </div>
  )
}
