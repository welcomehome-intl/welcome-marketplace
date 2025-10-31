"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Slider } from '@/app/components/ui/slider'
import { Button } from '@/app/components/ui/button'
import { Calculator, DollarSign, Percent, Ruler } from 'lucide-react'

type CalculationMode = 'tokens' | 'area' | 'percentage'

interface FractionalCalculatorProps {
  totalValue: number
  maxTokens: number
  pricePerToken: number
  propertySize?: number // Size in the base unit (e.g., 10 acres, 500 sqm)
  sizeUnit?: string // 'acres', 'sqm', 'sqft'
  availableTokens?: number
  onTokenAmountChange?: (amount: number, totalPrice: number) => void
  compact?: boolean
}

export function FractionalCalculator({
  totalValue,
  maxTokens,
  pricePerToken,
  propertySize,
  sizeUnit = 'sqm',
  availableTokens,
  onTokenAmountChange,
  compact = false
}: FractionalCalculatorProps) {
  const [calculationMode, setCalculationMode] = useState<CalculationMode>('tokens')
  const [tokenAmount, setTokenAmount] = useState(1)
  const [areaInput, setAreaInput] = useState(0)
  const [percentageInput, setPercentageInput] = useState(0)

  const maxAvailable = availableTokens || maxTokens
  const hasPropertySize = !!propertySize && propertySize > 0

  // Calculation functions
  const calculateTokensFromArea = (area: number): number => {
    if (!hasPropertySize || area <= 0) return 1
    const tokensPerUnit = maxTokens / propertySize!
    return Math.max(1, Math.ceil(area * tokensPerUnit))
  }

  const calculateTokensFromPercentage = (percent: number): number => {
    if (percent <= 0) return 1
    return Math.max(1, Math.ceil((percent / 100) * maxTokens))
  }

  const calculateAreaFromTokens = (tokens: number): number => {
    if (!hasPropertySize) return 0
    return (tokens / maxTokens) * propertySize!
  }

  const calculatePercentageFromTokens = (tokens: number): number => {
    return (tokens / maxTokens) * 100
  }

  // Derived values
  const totalPrice = tokenAmount * pricePerToken
  const ownershipPercentage = calculatePercentageFromTokens(tokenAmount)
  const ownershipArea = calculateAreaFromTokens(tokenAmount)

  useEffect(() => {
    if (onTokenAmountChange) {
      onTokenAmountChange(tokenAmount, totalPrice)
    }
  }, [tokenAmount, totalPrice, onTokenAmountChange])

  const handleSliderChange = (value: number[]) => {
    const tokens = Math.max(1, Math.min(value[0], maxAvailable))
    setTokenAmount(tokens)
    setAreaInput(calculateAreaFromTokens(tokens))
    setPercentageInput(calculatePercentageFromTokens(tokens))
  }

  const handleTokenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value > 0 && value <= maxAvailable) {
      setTokenAmount(value)
      setAreaInput(calculateAreaFromTokens(value))
      setPercentageInput(calculatePercentageFromTokens(value))
    }
  }

  const handleAreaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0) {
      setAreaInput(value)
      const tokens = calculateTokensFromArea(value)
      setTokenAmount(Math.min(tokens, maxAvailable))
      setPercentageInput(calculatePercentageFromTokens(tokens))
    }
  }

  const handlePercentageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setPercentageInput(value)
      const tokens = calculateTokensFromPercentage(value)
      setTokenAmount(Math.min(tokens, maxAvailable))
      setAreaInput(calculateAreaFromTokens(tokens))
    }
  }

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Mode Toggle */}
        {hasPropertySize && (
          <div className="flex gap-2 mb-3">
            <Button
              type="button"
              variant={calculationMode === 'tokens' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCalculationMode('tokens')}
              className="flex-1"
            >
              Tokens
            </Button>
            <Button
              type="button"
              variant={calculationMode === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCalculationMode('area')}
              className="flex-1"
            >
              Area ({sizeUnit})
            </Button>
            <Button
              type="button"
              variant={calculationMode === 'percentage' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCalculationMode('percentage')}
              className="flex-1"
            >
              %
            </Button>
          </div>
        )}

        {/* Input based on mode */}
        <div className="space-y-2">
          <Label htmlFor="calculator-input" className="text-sm font-medium flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            {calculationMode === 'tokens' && 'Select Tokens'}
            {calculationMode === 'area' && `Select Area (${sizeUnit})`}
            {calculationMode === 'percentage' && 'Select Ownership %'}
          </Label>

          <div className="flex gap-2">
            {calculationMode === 'tokens' && (
              <Input
                id="calculator-input"
                type="number"
                value={tokenAmount}
                onChange={handleTokenInputChange}
                min={1}
                max={maxAvailable}
                step={1}
                className="flex-1"
              />
            )}
            {calculationMode === 'area' && hasPropertySize && (
              <Input
                id="calculator-input"
                type="number"
                value={areaInput.toFixed(2)}
                onChange={handleAreaInputChange}
                min={0}
                max={propertySize}
                step={0.01}
                className="flex-1"
              />
            )}
            {calculationMode === 'percentage' && (
              <Input
                id="calculator-input"
                type="number"
                value={percentageInput.toFixed(2)}
                onChange={handlePercentageInputChange}
                min={0}
                max={100}
                step={0.1}
                className="flex-1"
              />
            )}

            <div className="flex items-center px-3 py-2 bg-gray-50 rounded-md border min-w-[120px]">
              <span className="text-sm font-medium">
                ${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <Slider
            value={[tokenAmount]}
            onValueChange={handleSliderChange}
            min={1}
            max={maxAvailable}
            step={1}
            className="mt-2"
          />
        </div>

        {/* Show all three values */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-gray-600 text-xs">Tokens</div>
            <div className="font-semibold">{tokenAmount.toLocaleString()}</div>
          </div>
          {hasPropertySize && (
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-gray-600 text-xs">Area</div>
              <div className="font-semibold">{ownershipArea.toFixed(2)} {sizeUnit}</div>
            </div>
          )}
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-gray-600 text-xs">Ownership</div>
            <div className="font-semibold">{ownershipPercentage.toFixed(2)}%</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Fractional Ownership Calculator</h3>
        </div>

        {/* Mode Toggle */}
        {hasPropertySize && (
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <Button
              type="button"
              variant={calculationMode === 'tokens' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCalculationMode('tokens')}
              className="flex-1"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Tokens
            </Button>
            <Button
              type="button"
              variant={calculationMode === 'area' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCalculationMode('area')}
              className="flex-1"
            >
              <Ruler className="h-4 w-4 mr-2" />
              Area ({sizeUnit})
            </Button>
            <Button
              type="button"
              variant={calculationMode === 'percentage' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCalculationMode('percentage')}
              className="flex-1"
            >
              <Percent className="h-4 w-4 mr-2" />
              Percentage
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {/* Conditional Input Based on Mode */}
          {calculationMode === 'tokens' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="token-input" className="text-sm text-gray-600">
                  Number of Tokens
                </Label>
                <Input
                  id="token-input"
                  type="number"
                  value={tokenAmount}
                  onChange={handleTokenInputChange}
                  min={1}
                  max={maxAvailable}
                  step={1}
                  className="text-lg font-semibold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-gray-600">Available</Label>
                <div className="flex items-center h-10 px-3 py-2 bg-gray-50 rounded-md border">
                  <span className="text-lg font-semibold">{maxAvailable.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {calculationMode === 'area' && hasPropertySize && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="area-input" className="text-sm text-gray-600">
                  Desired Area ({sizeUnit})
                </Label>
                <Input
                  id="area-input"
                  type="number"
                  value={areaInput.toFixed(2)}
                  onChange={handleAreaInputChange}
                  min={0}
                  max={propertySize}
                  step={0.01}
                  className="text-lg font-semibold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-gray-600">Total Property Size</Label>
                <div className="flex items-center h-10 px-3 py-2 bg-gray-50 rounded-md border">
                  <span className="text-lg font-semibold">{propertySize} {sizeUnit}</span>
                </div>
              </div>
            </div>
          )}

          {calculationMode === 'percentage' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="percentage-input" className="text-sm text-gray-600">
                  Ownership Percentage (%)
                </Label>
                <Input
                  id="percentage-input"
                  type="number"
                  value={percentageInput.toFixed(2)}
                  onChange={handlePercentageInputChange}
                  min={0}
                  max={100}
                  step={0.1}
                  className="text-lg font-semibold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-gray-600">Calculated Tokens</Label>
                <div className="flex items-center h-10 px-3 py-2 bg-gray-50 rounded-md border">
                  <span className="text-lg font-semibold">{tokenAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>1 token</span>
              <span>{maxAvailable.toLocaleString()} tokens</span>
            </div>
            <Slider
              value={[tokenAmount]}
              onValueChange={handleSliderChange}
              min={1}
              max={maxAvailable}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          {/* Summary Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
            <div>
              <div className="text-xs text-blue-700 mb-1">Tokens</div>
              <div className="text-2xl font-bold text-blue-900">{tokenAmount.toLocaleString()}</div>
            </div>
            {hasPropertySize && (
              <div>
                <div className="text-xs text-blue-700 mb-1">Area ({sizeUnit})</div>
                <div className="text-2xl font-bold text-blue-900">{ownershipArea.toFixed(2)}</div>
              </div>
            )}
            <div>
              <div className="text-xs text-blue-700 mb-1">Ownership</div>
              <div className="text-2xl font-bold text-blue-900">{ownershipPercentage.toFixed(2)}%</div>
            </div>
            <div>
              <div className="text-xs text-blue-700 mb-1">Price/Token</div>
              <div className="text-2xl font-bold text-blue-900">${pricePerToken.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-lg font-semibold">Total Investment</span>
            <span className="text-2xl font-bold text-blue-600">
              ${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
          <p>
            You will own <span className="font-semibold">{ownershipPercentage.toFixed(2)}%</span> of this property,
            representing <span className="font-semibold">{tokenAmount.toLocaleString()}</span> tokens
            out of <span className="font-semibold">{maxTokens.toLocaleString()}</span> total.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
