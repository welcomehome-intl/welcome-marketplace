# Supabase Backend Setup Guide

## ✅ Completed

- [x] Database schema verified (all required tables exist)
- [x] Environment variables configured
- [x] Security scan completed (minor warnings only)

## 📦 Storage Buckets Setup Required

You need to create 4 storage buckets in your Supabase project. Follow these steps:

### 1. Access Supabase Dashboard

Visit: https://supabase.com/dashboard/project/jplicanfiibpkfqttgmi/storage/buckets

### 2. Create Storage Buckets

Create the following buckets with these settings:

#### Bucket 1: `property-images`
- **Name**: `property-images`
- **Public**: ✅ Yes (images need to be publicly accessible)
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

#### Bucket 2: `kyc-documents`
- **Name**: `kyc-documents`
- **Public**: ❌ No (private - KYC documents are sensitive)
- **File size limit**: 10 MB
- **Allowed MIME types**: `application/pdf`, `image/jpeg`, `image/png`

#### Bucket 3: `property-documents`
- **Name**: `property-documents`
- **Public**: ❌ No (private - legal documents)
- **File size limit**: 10 MB
- **Allowed MIME types**: `application/pdf`, `image/jpeg`, `image/png`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

#### Bucket 4: `user-avatars`
- **Name**: `user-avatars`
- **Public**: ✅ Yes (avatars need to be publicly accessible)
- **File size limit**: 2 MB
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`

### 3. Quick Create via Supabase Dashboard

1. Go to **Storage** in the left sidebar
2. Click **New bucket**
3. Enter the bucket name
4. Toggle **Public bucket** for property-images and user-avatars
5. Click **Create bucket**
6. Repeat for all 4 buckets

### Alternative: SQL Commands

If you prefer SQL, you can run these commands in the SQL Editor:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('property-images', 'property-images', true),
  ('kyc-documents', 'kyc-documents', false),
  ('property-documents', 'property-documents', false),
  ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for public buckets
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('property-images', 'user-avatars'));

CREATE POLICY "Authenticated Upload to property-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Authenticated Upload to user-avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-avatars');

-- Private bucket policies (KYC and property documents)
CREATE POLICY "Authenticated Access to kyc-documents"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'kyc-documents')
WITH CHECK (bucket_id = 'kyc-documents');

CREATE POLICY "Authenticated Access to property-documents"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'property-documents')
WITH CHECK (bucket_id = 'property-documents');
```

## 🔒 Security Warnings Addressed

Your database has 5 minor security warnings about mutable search paths in functions:
- `update_updated_at_column`
- `get_or_create_user`
- `create_notification`
- `get_user_transaction_summary`
- `mark_notifications_read`

These are **non-critical** warnings. To fix them, you can add `SECURITY DEFINER SET search_path = public` to each function definition. See: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

## 📊 Database Tables Status

All required tables exist and are properly configured:

### Core Tables (MVP)
- ✅ `users` - User profiles with wallet-based auth
- ✅ `properties` - Property metadata and off-chain data
- ✅ `transaction_cache` - Transaction tracking
- ✅ `notifications` - User notifications

### Additional Tables (Future Features)
- `governance_proposals` - Property governance
- `governance_votes` - Voting records
- `property_documents` - Document management
- `property_metrics` - Analytics
- `property_staking` - Token staking
- `property_revenues` - Revenue tracking
- `user_claimable_revenue` - User dividends
- `marketplace_listings` - Secondary market

## 🔐 Required: RLS Policies for Transaction Cache

**IMPORTANT**: You must apply RLS policies to enable transaction caching.

### Run the Migration

1. Go to **Supabase Dashboard** > **SQL Editor**: https://supabase.com/dashboard/project/jplicanfiibpkfqttgmi/sql/new
2. Open the file: `supabase/migrations/001_transaction_cache_policies.sql`
3. Copy the entire SQL content
4. Paste into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)

You should see a success message and 3 policies created for `transaction_cache`.

### Verify Policies Applied

Run this query to verify:
```sql
SELECT policyname FROM pg_policies WHERE tablename = 'transaction_cache';
```

Expected output:
- `Allow public read access to transaction cache`
- `Allow public insert to transaction cache`
- `Allow public update to transaction cache`

## 🚀 Next Steps

1. **Apply RLS policies** for transaction cache (see above) ⚠️ **REQUIRED**
2. **Create storage buckets** (see above)
3. **Deploy smart contracts** to Hedera Testnet
4. **Update contract addresses** in `.env.local`
5. **Restart dev server**: `npm run dev` or `yarn dev`
6. **Test the integration**:
   - Connect wallet
   - Upload KYC documents
   - Create a property (admin)
   - Purchase tokens

## 🔧 Troubleshooting

### Issue: "Error caching transaction: {}"
**Cause**: Missing RLS policies on `transaction_cache` table.
**Solution**: Run the SQL migration in `supabase/migrations/001_transaction_cache_policies.sql` (see "Required: RLS Policies" section above).

### Issue: "Failed to upload file"
**Solution**: Make sure storage buckets are created and public buckets have proper policies.

### Issue: "RLS policy violation"
**Solution**: The current RLS policies are permissive for wallet-based auth. Verification happens in the application layer.

### Issue: "Cannot read properties from database"
**Solution**: Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly in `.env.local`.

## 📝 Environment Variables

Current configuration in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://jplicanfiibpkfqttgmi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (configured)

# Smart Contracts (TODO: Update after deployment)
NEXT_PUBLIC_ACCESS_CONTROL_ADDRESS=0x0000... (placeholder)
NEXT_PUBLIC_OWNERSHIP_REGISTRY_ADDRESS=0x0000... (placeholder)
NEXT_PUBLIC_PROPERTY_FACTORY_ADDRESS=0x0000... (placeholder)
NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS=0x0000... (placeholder)
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x0000... (placeholder)
```

## 📚 Additional Resources

- Supabase Storage Docs: https://supabase.com/docs/guides/storage
- Supabase RLS Docs: https://supabase.com/docs/guides/auth/row-level-security
- Integration Guide: See `INTEGRATION_README.md`
