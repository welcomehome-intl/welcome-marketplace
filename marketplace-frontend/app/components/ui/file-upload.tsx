"use client"

import { useCallback, useRef, useState } from "react"
import { Card } from "./card"
import { Button } from "./button"
import { Badge } from "./badge"
import {
  Upload,
  X,
  FileImage,
  FileText,
  Loader2,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { useFileUpload } from "@/app/lib/supabase/hooks/use-file-upload"
import { StorageBucket } from "@/app/lib/supabase/storage"
import { cn } from "@/app/lib/utils"

interface FileUploadProps {
  bucket: StorageBucket
  pathPrefix: string
  accept?: string
  multiple?: boolean
  maxFiles?: number
  onUploadSuccess?: (results: any[]) => void
  onUploadError?: (error: string) => void
  className?: string
  children?: React.ReactNode
}

interface UploadedFile {
  file: File
  url?: string
  path?: string
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export function FileUpload({
  bucket,
  pathPrefix,
  accept,
  multiple = false,
  maxFiles = 5,
  onUploadSuccess,
  onUploadError,
  className,
  children
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { upload, uploadMultiple, isUploading, progress, error } = useFileUpload()

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    handleFiles(selectedFiles)
  }, [])

  const handleFiles = useCallback(async (newFiles: File[]) => {
    if (!multiple && newFiles.length > 1) {
      onUploadError?.('Only one file allowed')
      return
    }

    if (files.length + newFiles.length > maxFiles) {
      onUploadError?.(`Maximum ${maxFiles} files allowed`)
      return
    }

    // Add files to state with uploading status
    const uploadedFiles: UploadedFile[] = newFiles.map(file => ({
      file,
      status: 'uploading' as const
    }))

    setFiles(prev => [...prev, ...uploadedFiles])

    try {
      if (newFiles.length === 1) {
        // Single file upload
        const file = newFiles[0]
        const timestamp = Date.now()
        const extension = file.name.split('.').pop()
        const fileName = `${pathPrefix}/${timestamp}.${extension}`

        const result = await upload(file, bucket, fileName)

        setFiles(prev => prev.map(f =>
          f.file === file
            ? {
                ...f,
                status: result.success ? 'success' : 'error',
                url: result.url,
                path: result.path,
                error: result.error
              }
            : f
        ))

        if (result.success) {
          onUploadSuccess?.([result])
        } else {
          onUploadError?.(result.error || 'Upload failed')
        }
      } else {
        // Multiple file upload
        const results = await uploadMultiple(newFiles, bucket, pathPrefix)

        setFiles(prev => prev.map((f, index) => {
          const result = results[index]
          return newFiles.includes(f.file)
            ? {
                ...f,
                status: result.success ? 'success' : 'error',
                url: result.url,
                path: result.path,
                error: result.error
              }
            : f
        }))

        const successfulResults = results.filter(r => r.success)
        if (successfulResults.length > 0) {
          onUploadSuccess?.(successfulResults)
        }

        const failedResults = results.filter(r => !r.success)
        if (failedResults.length > 0) {
          onUploadError?.(
            `${failedResults.length} file(s) failed to upload`
          )
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      onUploadError?.(errorMessage)

      // Update file status to error
      setFiles(prev => prev.map(f =>
        newFiles.includes(f.file)
          ? { ...f, status: 'error', error: errorMessage }
          : f
      ))
    }
  }, [files, maxFiles, multiple, upload, uploadMultiple, bucket, pathPrefix, onUploadSuccess, onUploadError])

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400",
          isUploading && "opacity-50"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="p-8 text-center">
          {children || (
            <>
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {multiple ? 'Upload files' : 'Upload file'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop your {multiple ? 'files' : 'file'} here, or click to browse
              </p>
              <Button variant="outline" disabled={isUploading}>
                Choose {multiple ? 'Files' : 'File'}
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Progress */}
      {isUploading && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            {multiple ? 'Uploaded Files' : 'Uploaded File'}
          </h4>
          {files.map((uploadedFile, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(uploadedFile.file)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      uploadedFile.status === 'success' && 'border-green-200 text-green-800',
                      uploadedFile.status === 'error' && 'border-red-200 text-red-800'
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(uploadedFile.status)}
                      {uploadedFile.status}
                    </div>
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={uploadedFile.status === 'uploading'}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {uploadedFile.error && (
                <p className="text-xs text-red-600 mt-2">{uploadedFile.error}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}