"use client"

import { useState, useCallback } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useFileUpload } from '@/app/lib/supabase/hooks/use-file-upload'
import Image from 'next/image'

interface ImageUploaderProps {
  maxFiles?: number
  onImagesChange: (imageUrls: string[]) => void
  initialImages?: string[]
  disabled?: boolean
}

export function ImageUploader({
  maxFiles = 10,
  onImagesChange,
  initialImages = [],
  disabled = false
}: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { upload } = useFileUpload()

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (images.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const timestamp = Date.now()
        const extension = file.name.split('.').pop()
        const fileName = `properties/temp-${timestamp}-${i}.${extension}`

        const result = await upload(file, 'property-images', fileName)

        if (result.success && result.url) {
          uploadedUrls.push(result.url)
        }

        setUploadProgress(((i + 1) / files.length) * 100)
      }

      const newImages = [...images, ...uploadedUrls]
      setImages(newImages)
      onImagesChange(newImages)
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Failed to upload some images. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [images, maxFiles, upload, onImagesChange])

  const handleRemoveImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages)
  }, [images, onImagesChange])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    )

    if (files.length === 0) return

    if (images.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const timestamp = Date.now()
        const extension = file.name.split('.').pop()
        const fileName = `properties/temp-${timestamp}-${i}.${extension}`

        const result = await upload(file, 'property-images', fileName)

        if (result.success && result.url) {
          uploadedUrls.push(result.url)
        }

        setUploadProgress(((i + 1) / files.length) * 100)
      }

      const newImages = [...images, ...uploadedUrls]
      setImages(newImages)
      onImagesChange(newImages)
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Failed to upload some images. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [images, maxFiles, upload, onImagesChange])

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className="p-6">
        <label
          htmlFor="image-upload"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
            uploading ? 'opacity-50 cursor-not-allowed' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 mb-2 text-primary animate-spin" />
                <p className="text-sm text-gray-600">Uploading... {uploadProgress.toFixed(0)}%</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 mb-2 text-gray-400" />
                <p className="mb-2 text-sm text-gray-600">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WEBP up to 5MB ({images.length}/{maxFiles} images)
                </p>
              </>
            )}
          </div>
          <input
            id="image-upload"
            type="file"
            className="hidden"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={disabled || uploading || images.length >= maxFiles}
          />
        </label>
      </Card>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={imageUrl}
                  alt={`Property image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                    Featured
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No images uploaded yet</p>
        </div>
      )}
    </div>
  )
}
