"use client"

import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { useEnrichedProperty } from '@/app/lib/supabase/hooks/use-enriched-properties'
import { PropertyDetail } from '@/app/components/property/property-detail'
import { PurchaseForm } from '@/app/components/property/purchase-form'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function PropertyDetailsPage() {
  const params = useParams()
  const contractAddress = params.id as string // Now expects contract address instead of numeric ID

  const { property, isLoading, error, refetch } = useEnrichedProperty(contractAddress)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
            <p className="text-gray-600 mb-4">
              {error || 'The property you are looking for does not exist or has not been created yet.'}
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/">
                <Button>Back to Marketplace</Button>
              </Link>
              <Button variant="outline" onClick={refetch}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-gray-900 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Marketplace</span>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="sm">Admin</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details (2/3 width) */}
          <div className="lg:col-span-2">
            <PropertyDetail property={property} />
          </div>

          {/* Right Column - Purchase Form (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <PurchaseForm property={property} />

              {/* Benefits Card */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Why Invest?</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Fractional ownership starting from 1 token</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Blockchain-secured ownership records</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Potential revenue distribution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Trade on secondary marketplace</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
