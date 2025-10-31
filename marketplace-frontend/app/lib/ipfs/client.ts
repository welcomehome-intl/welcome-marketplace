"use client"

import { create } from 'kubo-rpc-client'

// IPFS client configuration
const IPFS_GATEWAY_URL = process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs/'
const IPFS_API_URL = process.env.NEXT_PUBLIC_IPFS_API_URL || 'https://ipfs.infura.io:5001/api/v0'
const IPFS_PROJECT_ID = process.env.NEXT_PUBLIC_IPFS_PROJECT_ID
const IPFS_PROJECT_SECRET = process.env.NEXT_PUBLIC_IPFS_PROJECT_SECRET

// Create IPFS client instance
let ipfsClient: any = null

export function getIPFSClient() {
  if (!ipfsClient) {
    try {
      const auth = IPFS_PROJECT_ID && IPFS_PROJECT_SECRET
        ? { authorization: 'Basic ' + Buffer.from(IPFS_PROJECT_ID + ':' + IPFS_PROJECT_SECRET).toString('base64') }
        : undefined

      ipfsClient = create({
        url: IPFS_API_URL,
        headers: auth ? { authorization: auth.authorization } : undefined
      })
    } catch (error) {
      console.warn('Failed to create IPFS client, using fallback methods:', error)
    }
  }
  return ipfsClient
}

// IPFS utility functions
export class IPFSService {
  private static instance: IPFSService
  private client: any

  private constructor() {
    this.client = getIPFSClient()
  }

  public static getInstance(): IPFSService {
    if (!IPFSService.instance) {
      IPFSService.instance = new IPFSService()
    }
    return IPFSService.instance
  }

  // Upload file to IPFS
  async uploadFile(file: File): Promise<{ hash: string; size: number }> {
    try {
      if (!this.client) {
        throw new Error('IPFS client not available')
      }

      const result = await this.client.add(file, {
        pin: true,
        progress: (bytes: number) => {
          console.log(`IPFS upload progress: ${bytes} bytes`)
        }
      })

      return {
        hash: result.cid.toString(),
        size: result.size
      }
    } catch (error) {
      console.error('IPFS upload error:', error)
      throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Upload JSON data to IPFS
  async uploadJSON(data: any): Promise<{ hash: string; size: number }> {
    try {
      if (!this.client) {
        throw new Error('IPFS client not available')
      }

      const jsonString = JSON.stringify(data, null, 2)
      const result = await this.client.add(jsonString, {
        pin: true
      })

      return {
        hash: result.cid.toString(),
        size: result.size
      }
    } catch (error) {
      console.error('IPFS JSON upload error:', error)
      throw new Error(`Failed to upload JSON to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Upload multiple files to IPFS
  async uploadMultiple(files: File[]): Promise<Array<{ hash: string; size: number; name: string }>> {
    const results = []

    for (const file of files) {
      try {
        const result = await this.uploadFile(file)
        results.push({
          ...result,
          name: file.name
        })
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        throw error
      }
    }

    return results
  }

  // Get file from IPFS
  async getFile(hash: string): Promise<Blob> {
    try {
      const response = await fetch(`${IPFS_GATEWAY_URL}${hash}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.blob()
    } catch (error) {
      console.error('IPFS fetch error:', error)
      throw new Error(`Failed to fetch from IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get JSON data from IPFS
  async getJSON<T = any>(hash: string): Promise<T> {
    try {
      const response = await fetch(`${IPFS_GATEWAY_URL}${hash}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('IPFS JSON fetch error:', error)
      throw new Error(`Failed to fetch JSON from IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get IPFS gateway URL for a hash
  getGatewayURL(hash: string): string {
    return `${IPFS_GATEWAY_URL}${hash}`
  }

  // Pin content to IPFS (if using a service that supports pinning)
  async pinContent(hash: string): Promise<void> {
    try {
      if (!this.client) {
        throw new Error('IPFS client not available')
      }

      await this.client.pin.add(hash)
      console.log(`Successfully pinned content: ${hash}`)
    } catch (error) {
      console.error('IPFS pinning error:', error)
      // Don't throw here as pinning might not be critical
    }
  }

  // Check if content exists on IPFS
  async exists(hash: string): Promise<boolean> {
    try {
      const response = await fetch(`${IPFS_GATEWAY_URL}${hash}`, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      console.error('IPFS exists check error:', error)
      return false
    }
  }

  // Validate IPFS hash format
  static isValidHash(hash: string): boolean {
    // Basic IPFS hash validation (CIDv0 and CIDv1)
    const ipfsHashRegex = /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,})$/
    return ipfsHashRegex.test(hash)
  }
}

// Export default instance
export const ipfs = IPFSService.getInstance()