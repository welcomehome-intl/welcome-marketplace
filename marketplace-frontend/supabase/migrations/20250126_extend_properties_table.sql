-- Migration: Extend properties table with rich property metadata
-- Date: 2025-01-26
-- Purpose: Add property type, size, amenities, and other details for enhanced property listings

-- Add new columns to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type TEXT CHECK (property_type IN ('residential', 'commercial', 'land', 'industrial', 'mixed_use'));
ALTER TABLE properties ADD COLUMN IF NOT EXISTS size_value NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS size_unit TEXT CHECK (size_unit IN ('acres', 'sqm', 'sqft'));
ALTER TABLE properties ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold_out', 'coming_soon'));
ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities TEXT[];
ALTER TABLE properties ADD COLUMN IF NOT EXISTS featured_image_index INTEGER DEFAULT 0;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_contract ON properties(contract_address);

-- Add comment describing the metadata JSON structure
COMMENT ON COLUMN properties.metadata IS 'JSON structure: { details: { bedrooms, bathrooms, yearBuilt }, financials: { expectedROI, rentalYield }, location: { address, city, country, coordinates } }';

-- Update existing properties to have default values
UPDATE properties SET property_type = 'residential' WHERE property_type IS NULL;
UPDATE properties SET status = 'available' WHERE status IS NULL;
UPDATE properties SET size_unit = 'sqm' WHERE size_unit IS NULL;
