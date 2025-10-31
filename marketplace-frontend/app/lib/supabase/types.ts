export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string
          email: string | null
          name: string | null
          kyc_status: 'pending' | 'approved' | 'rejected' | 'expired'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          email?: string | null
          name?: string | null
          kyc_status?: 'pending' | 'approved' | 'rejected' | 'expired'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          email?: string | null
          name?: string | null
          kyc_status?: 'pending' | 'approved' | 'rejected' | 'expired'
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          contract_address: string
          name: string
          description: string | null
          location: Json | null
          images: Json | null
          documents: Json | null
          metadata: Json | null
          property_type: 'residential' | 'commercial' | 'land' | 'industrial' | 'mixed_use' | null
          size_value: number | null
          size_unit: 'acres' | 'sqm' | 'sqft' | null
          status: 'available' | 'sold_out' | 'coming_soon' | null
          amenities: string[] | null
          featured_image_index: number | null
          created_at: string
        }
        Insert: {
          id?: string
          contract_address: string
          name: string
          description?: string | null
          location?: Json | null
          images?: Json | null
          documents?: Json | null
          metadata?: Json | null
          property_type?: 'residential' | 'commercial' | 'land' | 'industrial' | 'mixed_use' | null
          size_value?: number | null
          size_unit?: 'acres' | 'sqm' | 'sqft' | null
          status?: 'available' | 'sold_out' | 'coming_soon' | null
          amenities?: string[] | null
          featured_image_index?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          contract_address?: string
          name?: string
          description?: string | null
          location?: Json | null
          images?: Json | null
          documents?: Json | null
          metadata?: Json | null
          property_type?: 'residential' | 'commercial' | 'land' | 'industrial' | 'mixed_use' | null
          size_value?: number | null
          size_unit?: 'acres' | 'sqm' | 'sqft' | null
          status?: 'available' | 'sold_out' | 'coming_soon' | null
          amenities?: string[] | null
          featured_image_index?: number | null
          created_at?: string
        }
      }
      transaction_cache: {
        Row: {
          id: string
          tx_hash: string
          block_number: number | null
          user_address: string | null
          transaction_type: string | null
          amount: string | null
          token_amount: string | null
          contract_address: string | null
          timestamp: string | null
          status: string
          indexed_at: string
        }
        Insert: {
          id?: string
          tx_hash: string
          block_number?: number | null
          user_address?: string | null
          transaction_type?: string | null
          amount?: string | null
          token_amount?: string | null
          contract_address?: string | null
          timestamp?: string | null
          status?: string
          indexed_at?: string
        }
        Update: {
          id?: string
          tx_hash?: string
          block_number?: number | null
          user_address?: string | null
          transaction_type?: string | null
          amount?: string | null
          token_amount?: string | null
          contract_address?: string | null
          timestamp?: string | null
          status?: string
          indexed_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_address: string
          type: string
          title: string
          message: string
          data: Json | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_address: string
          type: string
          title: string
          message: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_address?: string
          type?: string
          title?: string
          message?: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Additional type helpers
export type User = Database['public']['Tables']['users']['Row']
export type Property = Database['public']['Tables']['properties']['Row']
export type TransactionCache = Database['public']['Tables']['transaction_cache']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

export type UserInsert = Database['public']['Tables']['users']['Insert']
export type PropertyInsert = Database['public']['Tables']['properties']['Insert']
export type TransactionCacheInsert = Database['public']['Tables']['transaction_cache']['Insert']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

// Property-specific types
export type PropertyType = 'residential' | 'commercial' | 'land' | 'industrial' | 'mixed_use'
export type SizeUnit = 'acres' | 'sqm' | 'sqft'
export type PropertyStatus = 'available' | 'sold_out' | 'coming_soon'

// Metadata structure for properties table
export interface PropertyMetadata {
  details?: {
    bedrooms?: number
    bathrooms?: number
    yearBuilt?: number
    floors?: number
    parking?: number
  }
  financials?: {
    expectedROI?: number
    rentalYield?: number
    appreciationRate?: number
  }
  location?: {
    address?: string
    city?: string
    country?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
}

// Enhanced property with typed metadata
export interface EnrichedProperty extends Omit<Property, 'metadata' | 'images'> {
  metadata: PropertyMetadata | null
  images: string[] // Array of public URLs
}