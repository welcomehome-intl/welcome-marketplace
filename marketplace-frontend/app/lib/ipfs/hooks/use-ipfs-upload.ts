"use client"

import { useState, useCallback } from 'react'
import { ipfs } from '../client'
import { supabase } from '../../supabase/client'
import { logError } from '../../web3/error-utils'

export interface UploadProgress {
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

export interface IPFSUploadResult {
  hash: string
  size: number
  name: string
  url: string
}

export function useIPFSUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress[]>([])
  const [error, setError] = useState<string | null>(null)

  const uploadFiles = useCallback(async (
    files: File[],
    propertyId: number,
    documentType: string,
    uploadedBy?: string
  ): Promise<IPFSUploadResult[]> => {
    if (!files.length) throw new Error('No files provided')

    setIsUploading(true)
    setError(null)
    setProgress(files.map(f => ({
      fileName: f.name,
      progress: 0,
      status: 'pending'
    })))

    const results: IPFSUploadResult[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Update progress
        setProgress(prev => prev.map((p, idx) =>
          idx === i ? { ...p, status: 'uploading', progress: 0 } : p
        ))

        try {
          // Upload to IPFS
          const { hash, size } = await ipfs.uploadFile(file)
          const url = ipfs.getGatewayURL(hash)

          // Store document metadata in Supabase (if available)
          if (supabase) {
            const { error: dbError } = await supabase
              .from('property_documents')
              .insert({
                property_id: propertyId,
                document_type: documentType,
                filename: file.name,
                ipfs_hash: hash,
                file_size: size,
                mime_type: file.type,
                uploaded_by: uploadedBy,
                verified: false
              })

            if (dbError) {
              console.warn('Database storage failed, but IPFS upload succeeded:', dbError)
            }
          }

          const result: IPFSUploadResult = {
            hash,
            size,
            name: file.name,
            url
          }
          results.push(result)

          // Update progress
          setProgress(prev => prev.map((p, idx) =>
            idx === i ? { ...p, status: 'completed', progress: 100 } : p
          ))

        } catch (fileError) {
          logError(`Failed to upload ${file.name}`, fileError)

          setProgress(prev => prev.map((p, idx) =>
            idx === i ? {
              ...p,
              status: 'error',
              error: fileError instanceof Error ? fileError.message : 'Upload failed'
            } : p
          ))

          throw fileError
        }
      }

      return results

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsUploading(false)
    }
  }, [])

  const uploadJSON = useCallback(async (
    data: any,
    propertyId: number,
    documentType: string,
    filename: string,
    uploadedBy?: string
  ): Promise<IPFSUploadResult> => {
    setIsUploading(true)
    setError(null)

    try {
      const { hash, size } = await ipfs.uploadJSON(data)
      const url = ipfs.getGatewayURL(hash)

      // Store metadata in database (if available)
      if (supabase) {
        const { error: dbError } = await supabase
          .from('property_documents')
          .insert({
            property_id: propertyId,
            document_type: documentType,
            filename,
            ipfs_hash: hash,
            file_size: size,
            mime_type: 'application/json',
            uploaded_by: uploadedBy,
            verified: false
          })

        if (dbError) {
          console.warn('Database storage failed, but IPFS upload succeeded:', dbError)
        }
      }

      return {
        hash,
        size,
        name: filename,
        url
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'JSON upload failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsUploading(false)
    }
  }, [])

  const resetProgress = useCallback(() => {
    setProgress([])
    setError(null)
  }, [])

  return {
    uploadFiles,
    uploadJSON,
    isUploading,
    progress,
    error,
    resetProgress
  }
}