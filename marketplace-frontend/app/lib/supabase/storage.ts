import { supabase } from './client'

export type StorageBucket = 'property-images' | 'property-documents' | 'user-avatars' | 'kyc-documents'

export interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  'property-images': 5 * 1024 * 1024, // 5MB
  'property-documents': 10 * 1024 * 1024, // 10MB
  'user-avatars': 2 * 1024 * 1024, // 2MB
  'kyc-documents': 10 * 1024 * 1024, // 10MB
}

// Allowed file types
const ALLOWED_FILE_TYPES = {
  'property-images': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  'property-documents': ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  'user-avatars': ['image/jpeg', 'image/png', 'image/webp'],
  'kyc-documents': ['application/pdf', 'image/jpeg', 'image/png'],
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  bucket: StorageBucket,
  path: string,
  options?: {
    replace?: boolean
    metadata?: Record<string, any>
  }
): Promise<UploadResult> {
  try {
    // Validate file size
    const maxSize = FILE_SIZE_LIMITS[bucket]
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
      }
    }

    // Validate file type
    const allowedTypes = ALLOWED_FILE_TYPES[bucket]
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      }
    }

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: options?.replace || false,
        metadata: options?.metadata
      })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    // Get public URL for public buckets
    let publicUrl = null
    if (bucket === 'property-images' || bucket === 'user-avatars') {
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)
      publicUrl = urlData.publicUrl
    }

    return {
      success: true,
      path: data.path,
      url: publicUrl || undefined
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  bucket: StorageBucket,
  pathPrefix: string
): Promise<UploadResult[]> {
  const results: UploadResult[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `${pathPrefix}/${timestamp}-${i}.${extension}`

    const result = await uploadFile(file, bucket, fileName)
    results.push(result)
  }

  return results
}

/**
 * Delete a file from storage
 */
export async function deleteFile(bucket: StorageBucket, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    return !error
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string | null {
  if (bucket === 'property-documents') {
    // Documents are private, need signed URL
    return null
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

/**
 * Get signed URL for private files (like documents)
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn = 3600 // 1 hour default
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error('Error creating signed URL:', error)
      return null
    }

    return data.signedUrl
  } catch (error) {
    console.error('Error creating signed URL:', error)
    return null
  }
}

/**
 * List files in a directory
 */
export async function listFiles(
  bucket: StorageBucket,
  folder: string = ''
): Promise<any[]> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder)

    if (error) {
      console.error('Error listing files:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error listing files:', error)
    return []
  }
}

/**
 * Generate unique file path
 */
export function generateFilePath(
  prefix: string,
  fileName: string,
  userId?: string
): string {
  const timestamp = Date.now()
  const extension = fileName.split('.').pop()
  const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-')

  const userPrefix = userId ? `${userId}/` : ''
  return `${userPrefix}${prefix}/${timestamp}-${baseName}.${extension}`
}