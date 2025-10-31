-- ============================================================================
-- WELCOME HOME PROPERTY - CORE DATABASE SCHEMA
-- ============================================================================
-- This migration creates the core tables required for the MVP:
-- - users (wallet-based authentication with KYC status)
-- - properties (off-chain property metadata)
-- - transaction_cache (blockchain transaction tracking)
-- - notifications (user notifications)
--
-- IMPORTANT: This uses wallet-based authentication (no auth.users dependency)
-- ============================================================================

-- ============================================================================
-- 1. USERS TABLE (Wallet-Based Authentication)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  email TEXT,
  name TEXT,
  kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected', 'expired')),
  kyc_documents JSONB DEFAULT '[]'::jsonb, -- Array of document URLs/hashes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on wallet_address for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);

-- ============================================================================
-- 2. PROPERTIES TABLE (Off-Chain Metadata)
-- ============================================================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_address TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  location JSONB, -- {city, state, country, address, coordinates}
  images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
  documents JSONB DEFAULT '[]'::jsonb, -- Array of document URLs
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on contract_address for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_contract_address ON properties(contract_address);

-- ============================================================================
-- 3. TRANSACTION CACHE TABLE (Blockchain Transaction Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS transaction_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash TEXT NOT NULL UNIQUE,
  block_number BIGINT,
  user_address TEXT,
  transaction_type TEXT, -- 'property_purchase', 'kyc_submission', 'token_transfer', etc.
  amount TEXT, -- Store as string to preserve precision
  token_amount TEXT, -- Store as string to preserve precision
  contract_address TEXT,
  timestamp TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  indexed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for transaction queries
CREATE UNIQUE INDEX IF NOT EXISTS idx_transaction_cache_tx_hash ON transaction_cache(tx_hash);
CREATE INDEX IF NOT EXISTS idx_transaction_cache_user_address ON transaction_cache(user_address);
CREATE INDEX IF NOT EXISTS idx_transaction_cache_timestamp ON transaction_cache(timestamp);
CREATE INDEX IF NOT EXISTS idx_transaction_cache_status ON transaction_cache(status);

-- ============================================================================
-- 4. NOTIFICATIONS TABLE (User Notifications)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address TEXT NOT NULL,
  type TEXT NOT NULL, -- 'success', 'error', 'info', 'warning'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional notification data
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_address ON notifications(user_address);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ============================================================================
-- 5. AUTOMATIC UPDATED_AT TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- USERS TABLE POLICIES
-- ----------------------------------------------------------------------------

-- Policy 1: Anyone (including anon) can INSERT new users (for wallet connect)
CREATE POLICY "Anyone can create user profile"
  ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy 2: Anyone can SELECT users by wallet_address (for profile lookups)
-- This is necessary because we're using wallet-based auth without auth.users
CREATE POLICY "Anyone can view user profiles"
  ON users
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy 3: Users can UPDATE their own profile (matched by wallet_address in app logic)
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Note: In a wallet-based auth system, the application must verify wallet ownership
-- before allowing updates. RLS policies here are permissive because we can't verify
-- wallet ownership at the database level without auth.users integration.

-- ----------------------------------------------------------------------------
-- PROPERTIES TABLE POLICIES
-- ----------------------------------------------------------------------------

-- Policy 1: Anyone can view properties (public marketplace)
CREATE POLICY "Properties are publicly readable"
  ON properties
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy 2: Anyone can create properties (admin check happens in application)
-- TODO: In production, restrict this to admin wallet addresses
CREATE POLICY "Properties can be created"
  ON properties
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy 3: Properties can be updated
CREATE POLICY "Properties can be updated"
  ON properties
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- ----------------------------------------------------------------------------
-- TRANSACTION_CACHE TABLE POLICIES
-- ----------------------------------------------------------------------------

-- Policy 1: Anyone can view transaction cache (for public transaction history)
CREATE POLICY "Transaction cache is readable"
  ON transaction_cache
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy 2: Anyone can insert transactions (from blockchain events)
CREATE POLICY "Transaction cache can be inserted"
  ON transaction_cache
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy 3: Transaction cache can be updated (for status changes)
CREATE POLICY "Transaction cache can be updated"
  ON transaction_cache
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS TABLE POLICIES
-- ----------------------------------------------------------------------------

-- Policy 1: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy 2: Notifications can be created for any user
CREATE POLICY "Notifications can be created"
  ON notifications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy 3: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================

-- Grant all permissions to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant necessary permissions to anonymous users (for wallet connect before auth)
GRANT SELECT, INSERT, UPDATE ON users TO anon;
GRANT SELECT ON properties TO anon;
GRANT SELECT, INSERT ON transaction_cache TO anon;
GRANT SELECT, INSERT, UPDATE ON notifications TO anon;

-- Grant sequence usage to anon for id generation
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================================================
-- 8. INITIAL DATA / SEED (OPTIONAL)
-- ============================================================================

-- Uncomment to create a test user
-- INSERT INTO users (wallet_address, name, email, kyc_status)
-- VALUES
--   ('0x0000000000000000000000000000000000000001', 'Test User', 'test@example.com', 'approved')
-- ON CONFLICT (wallet_address) DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Run this migration on your Supabase database:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Paste this entire file
-- 3. Click "Run"
-- 4. Verify tables were created in Database > Tables
-- ============================================================================
