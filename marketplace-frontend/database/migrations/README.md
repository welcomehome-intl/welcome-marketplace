# Database Migrations

## Quick Start

### Running the Core Schema Migration

The `001_create_core_schema.sql` migration creates all required tables for the MVP:

1. **Go to your Supabase Dashboard**
   - Navigate to: https://app.supabase.com/project/YOUR_PROJECT/sql/new

2. **Copy the migration SQL**
   - Open `001_create_core_schema.sql`
   - Copy the entire contents

3. **Run the migration**
   - Paste into the SQL Editor
   - Click "Run" button
   - Wait for "Success" message

4. **Verify the tables were created**
   - Go to: Database > Tables
   - You should see: `users`, `properties`, `transaction_cache`, `notifications`

### Update Your Environment Variables

After running the migration, update your `.env.local` file with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these values in: Supabase Dashboard > Settings > API

## What Gets Created

### Tables

1. **users**
   - Wallet-based user profiles
   - KYC status tracking
   - No dependency on `auth.users`

2. **properties**
   - Off-chain property metadata
   - Images, documents, location
   - Linked to on-chain contracts via `contract_address`

3. **transaction_cache**
   - Blockchain transaction tracking
   - Caches on-chain data for faster queries
   - Status tracking (pending/confirmed/failed)

4. **notifications**
   - User notifications
   - Read/unread status
   - Linked to wallet addresses

### Row Level Security (RLS)

All tables have RLS enabled with permissive policies for MVP:

- **users**: Anyone can create/read/update (wallet verification happens in app)
- **properties**: Public read, anyone can create (admin check in app)
- **transaction_cache**: Public read/write (for blockchain event indexing)
- **notifications**: Users can see all, update their own

### Indexes

Optimized indexes on:
- `users.wallet_address` (unique, for fast lookups)
- `properties.contract_address` (unique, for linking on-chain data)
- `transaction_cache.tx_hash` (unique, prevents duplicates)
- `transaction_cache.user_address` (for user transaction history)
- `notifications.user_address` (for user notifications)

## Troubleshooting

### Error: "relation already exists"

If you see errors about tables already existing:

1. Check if tables were created from previous migrations
2. Verify table structure matches expected schema
3. If structure is different, drop old tables first:

```sql
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS transaction_cache CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

Then rerun `001_create_core_schema.sql`.

### Error: "permission denied for schema public"

Your Supabase user needs permissions. This shouldn't happen in Supabase Cloud, but if it does:

```sql
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated;
```

### Testing the Migration

After running the migration, test it with these queries:

```sql
-- Test users table
INSERT INTO users (wallet_address, name, email)
VALUES ('0xTEST123', 'Test User', 'test@example.com');

SELECT * FROM users WHERE wallet_address = '0xTEST123';

-- Test properties table
INSERT INTO properties (contract_address, name, description)
VALUES ('0xPROPERTY123', 'Test Property', 'A test property');

SELECT * FROM properties;

-- Clean up
DELETE FROM users WHERE wallet_address = '0xTEST123';
DELETE FROM properties WHERE contract_address = '0xPROPERTY123';
```

## Next Steps

After running this migration:

1. Update `.env.local` with Supabase credentials
2. Restart your Next.js dev server
3. Test wallet connection (should auto-create user profile)
4. Verify no more RLS policy errors in console

## Additional Migrations

The `multi_property_support.sql` file contains advanced features for future phases:
- Governance proposals
- Staking
- Revenue distribution
- Marketplace listings

These are NOT required for MVP. Run them later when needed.
