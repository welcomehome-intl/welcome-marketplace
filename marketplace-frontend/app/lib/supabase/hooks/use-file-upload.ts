"use client"

import { useState, useCallback } from 'react'
import { uploadFile, uploadMultipleFiles, deleteFile, StorageBucket, UploadResult } from '../storage'

export interface FileUploadState {
  isUploading: boolean
  progress: number
  error: string | null
}

export function useFileUpload() {
  const [state, setState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  })

  const upload = useCallback(async (
    file: File,
    bucket: StorageBucket,
    path: string,
    options?: { replace?: boolean; metadata?: Record<string, any> }
  ): Promise<UploadResult> => {
    setState({
      isUploading: true,
      progress: 0,
      error: null,
    })

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }))
      }, 200)

      const result = await uploadFile(file, bucket, path, options)

      clearInterval(progressInterval)

      if (result.success) {
        setState({
          isUploading: false,
          progress: 100,
          error: null,
        })
      } else {
        setState({
          isUploading: false,
          progress: 0,
          error: result.error || 'Upload failed',
        })
      }

      return result
    } catch (error) {
      setState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
      })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      }
    }
  }, [])

  const uploadMultiple = useCallback(async (
    files: File[],
    bucket: StorageBucket,
    pathPrefix: string
  ): Promise<UploadResult[]> => {
    setState({
      isUploading: true,
      progress: 0,
      error: null,
    })

    try {
      const results = await uploadMultipleFiles(files, bucket, pathPrefix)

      const hasErrors = results.some(r => !r.success)
      const successCount = results.filter(r => r.success).length

      setState({
        isUploading: false,
        progress: 100,
        error: hasErrors ? `${successCount}/${files.length} files uploaded successfully` : null,
      })

      return results
    } catch (error) {
      setState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
      })
      return files.map(() => ({
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      }))
    }
  }, [])

  const remove = useCallback(async (
    bucket: StorageBucket,
    path: string
  ): Promise<boolean> => {
    setState({
      isUploading: true,
      progress: 0,
      error: null,
    })

    try {
      const success = await deleteFile(bucket, path)

      setState({
        isUploading: false,
        progress: success ? 100 : 0,
        error: success ? null : 'Failed to delete file',
      })

      return success
    } catch (error) {
      setState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Delete failed',
      })
      return false
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
    })
  }, [])

  return {
    ...state,
    upload,
    uploadMultiple,
    remove,
    reset,
  }
}