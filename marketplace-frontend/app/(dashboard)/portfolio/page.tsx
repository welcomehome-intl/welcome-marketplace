"use client"

import { PortfolioOverview } from '@/app/components/dashboard/portfolio-overview'
import { DashboardLayout } from '@/app/components/layout/dashboard-layout'

// Disable static rendering for this page
export const dynamic = 'force-dynamic'

/**
 * Portfolio Page
 * Shows user's owned property tokens with real balances from smart contracts
 */
export default function PortfolioPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold">My Portfolio</h2>
          <p className="text-gray-600 mt-1">
            View your property investments and token holdings
          </p>
        </div>

        <PortfolioOverview />
      </div>
    </DashboardLayout>
  )
}
