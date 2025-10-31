"use client"

import { useState, useCallback } from 'react'
import { supabase } from '../client'
import { PropertyInsert, Property } from '../types'
import { uploadFile, getPublicUrl } from '../storage'
import { useAccount } from 'wagmi'

export interface PropertyWithImages extends Omit<Property, 'images'> {
  images: string[] // Array of public URLs
}

export function usePropertyManagement() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { address } = useAccount()

  // Create a new property entry
  const createProperty = useCallback(async (
    propertyData: Omit<PropertyInsert, 'id' | 'created_at'>,
    imageFiles?: File[]
  ): Promise<PropertyWithImages | null> => {
    if (!address || !supabase) return null

    setIsLoading(true)
    setError(null)

    try {
      let imageUrls: string[] = []

      // Upload images first if provided
      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i]
          const timestamp = Date.now()
          const extension = file.name.split('.').pop()
          const fileName = `properties/${propertyData.contract_address}/${timestamp}-${i}.${extension}`

          const uploadResult = await uploadFile(file, 'property-images', fileName)
          if (uploadResult.success && uploadResult.url) {
            imageUrls.push(uploadResult.url)
          }
        }
      }

      // Create property record
      const { data: property, error: createError } = await supabase
        .from('properties')
        .insert({
          ...propertyData,
          images: imageUrls.length > 0 ? imageUrls : null,
        })
        .select()
        .single()

      if (createError) throw createError

      return {
        ...property,
        images: imageUrls,
      }
    } catch (err) {
      console.error('Error creating property:', err)
      setError(err instanceof Error ? err.message : 'Failed to create property')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [address])

  // Update property metadata
  const updateProperty = useCallback(async (
    contractAddress: string,
    updates: Partial<PropertyInsert>,
    newImageFiles?: File[]
  ): Promise<PropertyWithImages | null> => {
    if (!supabase) return null

    setIsLoading(true)
    setError(null)

    try {
      let imageUrls: string[] = []

      // Get existing property to preserve current images
      const { data: existingProperty } = await supabase
        .from('properties')
        .select('images')
        .eq('contract_address', contractAddress)
        .single()

      if (existingProperty?.images) {
        imageUrls = Array.isArray(existingProperty.images)
          ? existingProperty.images
          : []
      }

      // Upload new images if provided
      if (newImageFiles && newImageFiles.length > 0) {
        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i]
          const timestamp = Date.now()
          const extension = file.name.split('.').pop()
          const fileName = `properties/${contractAddress}/${timestamp}-${i}.${extension}`

          const uploadResult = await uploadFile(file, 'property-images', fileName)
          if (uploadResult.success && uploadResult.url) {
            imageUrls.push(uploadResult.url)
          }
        }
      }

      // Update property record
      const { data: property, error: updateError } = await supabase
        .from('properties')
        .update({
          ...updates,
          images: imageUrls.length > 0 ? imageUrls : null,
        })
        .eq('contract_address', contractAddress)
        .select()
        .single()

      if (updateError) throw updateError

      return {
        ...property,
        images: imageUrls,
      }
    } catch (err) {
      console.error('Error updating property:', err)
      setError(err instanceof Error ? err.message : 'Failed to update property')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get property by contract address
  const getProperty = useCallback(async (
    contractAddress: string
  ): Promise<PropertyWithImages | null> => {
    if (!supabase) return null

    try {
      const { data: property, error } = await supabase
        .from('properties')
        .select('*')
        .eq('contract_address', contractAddress)
        .single()

      if (error) throw error

      const images = Array.isArray(property.images) ? property.images : []

      return {
        ...property,
        images,
      }
    } catch (err) {
      console.error('Error fetching property:', err)
      return null
    }
  }, [])

  // List all properties
  const listProperties = useCallback(async (): Promise<PropertyWithImages[]> => {
    if (!supabase) return []

    try {
      const { data: properties, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return properties.map(property => ({
        ...property,
        images: Array.isArray(property.images) ? property.images : [],
      }))
    } catch (err) {
      console.error('Error listing properties:', err)
      return []
    }
  }, [])

  // Delete property
  const deleteProperty = useCallback(async (
    contractAddress: string
  ): Promise<boolean> => {
    if (!supabase) return false

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('contract_address', contractAddress)

      if (error) throw error

      return true
    } catch (err) {
      console.error('Error deleting property:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete property')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    createProperty,
    updateProperty,
    getProperty,
    listProperties,
    deleteProperty,
    isLoading,
    error,
  }
}