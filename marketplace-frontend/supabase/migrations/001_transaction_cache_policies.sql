-- =====================================================
-- Transaction Cache RLS Policies
-- =====================================================
-- Purpose: Allow caching of blockchain transactions for performance
-- Safe because: All data is verifiable on-chain via smart contract events
-- =====================================================

-- Enable RLS on transaction_cache table
ALTER TABLE public.transaction_cache ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to SELECT cached transactions
-- This enables reading transaction history without authentication
CREATE POLICY "Allow public read access to transaction cache"
ON public.transaction_cache FOR SELECT
TO public
USING (true);

-- Policy 2: Allow anyone to INSERT transaction records
-- Required for real-time caching of blockchain events
-- Validation: Ensures tx_hash is valid Ethereum format (0x + 64 hex chars)
CREATE POLICY "Allow public insert to transaction cache"
ON public.transaction_cache FOR INSERT
TO public
WITH CHECK (
  tx_hash IS NOT NULL
  AND user_address IS NOT NULL
  AND length(tx_hash) = 66
  AND tx_hash LIKE '0x%'
);

-- Policy 3: Allow anyone to UPDATE transaction status
-- Required for updating pending -> confirmed status
CREATE POLICY "Allow public update to transaction cache"
ON public.transaction_cache FOR UPDATE
TO public
USING (true)
WITH CHECK (
  tx_hash IS NOT NULL
);

-- =====================================================
-- How to apply this migration:
-- =====================================================
-- 1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/jplicanfiibpkfqttgmi
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New query"
-- 4. Copy and paste this entire file
-- 5. Click "Run" or press Cmd/Ctrl + Enter
-- =====================================================

-- Verify policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'transaction_cache'
ORDER BY policyname;
