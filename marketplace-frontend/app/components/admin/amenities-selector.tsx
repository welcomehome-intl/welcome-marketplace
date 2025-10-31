"use client"

import { useState, useCallback } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { X, Plus } from 'lucide-react'

interface AmenitiesSelectorProps {
  selectedAmenities: string[]
  onChange: (amenities: string[]) => void
  disabled?: boolean
}

const COMMON_AMENITIES = [
  'Swimming Pool',
  'Gym',
  'Parking',
  'Garden',
  'Security',
  'Balcony',
  'Air Conditioning',
  'Heating',
  'Elevator',
  'Storage',
  'Pet Friendly',
  'Furnished',
  'High-Speed Internet',
  'Backup Generator',
  'Water Supply',
  'Solar Panels',
  'CCTV',
  'Gated Community',
]

export function AmenitiesSelector({
  selectedAmenities,
  onChange,
  disabled = false
}: AmenitiesSelectorProps) {
  const [customAmenity, setCustomAmenity] = useState('')

  const handleToggleAmenity = useCallback((amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      onChange(selectedAmenities.filter(a => a !== amenity))
    } else {
      onChange([...selectedAmenities, amenity])
    }
  }, [selectedAmenities, onChange])

  const handleAddCustom = useCallback(() => {
    const trimmed = customAmenity.trim()
    if (trimmed && !selectedAmenities.includes(trimmed)) {
      onChange([...selectedAmenities, trimmed])
      setCustomAmenity('')
    }
  }, [customAmenity, selectedAmenities, onChange])

  const handleRemove = useCallback((amenity: string) => {
    onChange(selectedAmenities.filter(a => a !== amenity))
  }, [selectedAmenities, onChange])

  return (
    <div className="space-y-4">
      {/* Common Amenities */}
      <div>
        <h4 className="text-sm font-medium mb-3">Common Amenities</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {COMMON_AMENITIES.map((amenity) => {
            const isSelected = selectedAmenities.includes(amenity)
            return (
              <Button
                key={amenity}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="justify-start text-left h-auto py-2"
                onClick={() => handleToggleAmenity(amenity)}
                disabled={disabled}
              >
                <span className="truncate">{amenity}</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Custom Amenity Input */}
      <div>
        <h4 className="text-sm font-medium mb-3">Add Custom Amenity</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Enter amenity name"
            value={customAmenity}
            onChange={(e) => setCustomAmenity(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddCustom()
              }
            }}
            disabled={disabled}
          />
          <Button
            type="button"
            onClick={handleAddCustom}
            disabled={!customAmenity.trim() || disabled}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selected Amenities */}
      {selectedAmenities.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">
            Selected Amenities ({selectedAmenities.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedAmenities.map((amenity) => (
              <Badge
                key={amenity}
                variant="secondary"
                className="px-3 py-1.5 text-sm flex items-center gap-1"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => handleRemove(amenity)}
                  disabled={disabled}
                  className="ml-1 hover:text-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
