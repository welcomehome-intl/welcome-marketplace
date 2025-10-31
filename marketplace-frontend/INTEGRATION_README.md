# Welcome Home Property - Frontend Integration Guide

## Overview

This document explains how the Welcome Home Property frontend integrates with the smart contracts deployed on Hedera Testnet and Supabase backend.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (App Router)             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Pages     │  │  Components  │  │    Hooks     │       │
│  │             │  │              │  │              │       │
│  │ /dashboard  │  │  PropertyCard│  │ useAutoKYC   │       │
│  │ /marketplace│  │  PurchaseForm│  │ useAutoFetch │       │
│  │ /admin      │  │  Dashboard   │  │ useAutoApprove│      │
│  │ /kyc        │  │  KYCSubmission│ │ useAutoSync  │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
├──────────────────┬────────────────────┬─────────────────────┤
│                  │                    │                     │
│   Wagmi/Viem     │    Supabase        │    IPFS (Future)   │
│   (Blockchain)   │    (Database)      │    (Storage)       │
│                  │                    │                     │
└──────────────────┴────────────────────┴─────────────────────┘
         │                   │                      │
         ▼                   ▼                      ▼
┌─────────────────┐  ┌─────────────────┐   ┌──────────────┐
│  Hedera Testnet │  │  Supabase DB    │   │ IPFS Network │
│                 │  │                 │   │              │
│  5 Contracts:   │  │  Tables:        │   │  (Planned)   │
│  - AccessControl│  │  - users        │   │              │
│  - PropertyFact.│  │  - properties   │   │              │
│  - Ownership... │  │  - transactions │   │              │
│  - PaymentToken │  │  - notifications│   │              │
│  - Marketplace  │  │                 │   │              │
└─────────────────┘  └─────────────────┘   └──────────────┘
```

## Smart Contract Integration

### Contract Addresses

All contract addresses are managed in `/app/lib/web3/addresses.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  ACCESS_CONTROL: getContractAddress('NEXT_PUBLIC_ACCESS_CONTROL_ADDRESS'),
  OWNERSHIP_REGISTRY: getContractAddress('NEXT_PUBLIC_OWNERSHIP_REGISTRY_ADDRESS'),
  PROPERTY_FACTORY: getContractAddress('NEXT_PUBLIC_PROPERTY_FACTORY_ADDRESS'),
  PAYMENT_TOKEN: getContractAddress('NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS'),
  MARKETPLACE: getContractAddress('NEXT_PUBLIC_MARKETPLACE_ADDRESS'),
}
```

### Contract ABIs

All ABIs are extracted from the smart contract compilation artifacts and stored in `/app/lib/web3/abi.ts`.

### Web3 Hooks

Located in `/app/lib/web3/hooks/`:

#### Auto-Action Hooks (MVP Features)

1. **useAutoKYC** - Auto-approve KYC after document upload
   - User submits KYC with documents
   - Auto-approves using admin private key (MVP only)
   - Updates Supabase user profile

2. **useAutoApprove** - Auto-approve ERC20 tokens before purchases
   - Checks current allowance
   - Only approves if insufficient
   - Supports exact amount or max approval

3. **useAutoFetchProperties** - Auto-fetch properties with Supabase metadata
   - Fetches from PropertyFactory (blockchain)
   - Enriches with Supabase metadata (images, docs)
   - Real-time updates via Supabase subscriptions

4. **useAutoSync** - Auto-sync blockchain data on wallet connect
   - Reads KYC status from AccessControl
   - Reads holdings from OwnershipRegistry
   - Creates/updates Supabase user profile

#### Contract-Specific Hooks

1. **usePropertyFactory** - Property creation and token distribution
   - `createProperty()` - Deploy new property
   - `distributeTokens()` - Primary token distribution

2. **useOwnershipRegistry** - User portfolio tracking
   - `useUserPortfolio()` - Get user's complete portfolio
   - `useUserProperties()` - Get property IDs user owns
   - `useUserBalance()` - Get token balance for a property

## Supabase Integration

### Database Schema

Located in `/database/migrations/001_create_core_schema.sql`:

#### Tables

1. **users** - Wallet-based authentication
   ```sql
   - wallet_address (unique)
   - kyc_status (pending/approved/rejected)
   - email, name, phone
   - created_at, updated_at
   ```

2. **properties** - Off-chain property metadata
   ```sql
   - contract_address (unique)
   - name, description
   - location (JSONB) - flexible structure
   - images (JSONB array) - Supabase storage URLs
   - documents (JSONB array) - legal docs
   ```

3. **transaction_cache** - Transaction tracking
   ```sql
   - tx_hash (unique)
   - user_address
   - transaction_type
   - status (pending/confirmed/failed)
   ```

4. **notifications** - User notifications
   ```sql
   - user_address
   - type (kyc_approved, property_purchased, etc.)
   - title, message
   - read status
   ```

### Storage Buckets

Configured in `/app/lib/supabase/storage.ts`:

- `property-images` - Property photos (5MB limit)
- `property-documents` - Legal docs (10MB limit)
- `kyc-documents` - KYC verification docs (10MB limit, private)
- `user-avatars` - Profile pictures (2MB limit)

### RLS Policies

Using **permissive policies** for wallet-based auth (no Supabase auth.users dependency):

```sql
-- Example: Users table
CREATE POLICY "Anyone can create user profile" ON users
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can view users" ON users
  FOR SELECT TO anon, authenticated USING (true);
```

Verification happens in application layer via wallet signatures.

## Key Integration Patterns

### 1. Enriched Data Pattern

Combine on-chain + off-chain data for complete property information:

```typescript
// blockchain data (PropertyFactory)
const { id, name, symbol, pricePerToken, maxSupply, tokenContract } = property

// off-chain data (Supabase)
const { images, description, location, documents } = supabaseProperty

// merged into EnrichedPropertyInfo
const enrichedProperty = { ...property, ...supabaseProperty }
```

### 2. Auto-Action Flow

Check state → Execute if needed → Wait for confirmation:

```typescript
// Example: Auto-approve token before purchase
const handlePurchase = async () => {
  // Step 1: Check and auto-approve
  await autoApprove({
    tokenAddress: PAYMENT_TOKEN,
    spender: PROPERTY_FACTORY,
    amount: totalCost
  })

  // Step 2: Execute purchase
  await distributeTokens({ propertyId, to: address, amount })
}
```

### 3. Multi-Step Transaction Flow

Clear status indicators for user experience:

```
Upload → Submitting → Approving → Success
  ↓         ↓           ↓           ↓
Idle → Signing TX → Confirming → Complete
```

## Page Implementations

### 1. Admin Property Creation (`/admin`)

**Flow:**
1. Admin fills property form (name, symbol, maxSupply, price, location)
2. Calls `createProperty()` on PropertyFactory
3. PropertyFactory deploys new PropertyToken contract
4. Admin can then upload images/docs to Supabase
5. Admin distributes tokens via `distributeTokens()`

**Components:**
- Property creation form
- Transaction status UI
- Token distribution interface

### 2. Marketplace (`/marketplace`)

**Flow:**
1. Auto-fetch properties from blockchain
2. Enrich with Supabase metadata (images, docs)
3. Display in grid with filters
4. Click property → Navigate to detail page

**Components:**
- PropertyBrowser - Grid of property cards
- Real-time property refresh
- Search and filter utilities

### 3. Property Detail & Purchase (`/property/[id]`)

**Flow:**
1. Fetch property by ID from PropertyFactory
2. Enrich with Supabase metadata
3. Display property details (images, description, metrics)
4. Purchase form:
   - Enter token quantity
   - Auto-approve payment token
   - Call distributeTokens
   - Show transaction progress

**Components:**
- PropertyDetail - Property information
- PurchaseForm - Complete purchase flow with auto-approval

### 4. KYC Verification (`/kyc`)

**Flow:**
1. User uploads documents to Supabase storage
2. User submits KYC with document URLs
3. Auto-approve KYC using admin wallet (MVP only)
4. Update Supabase kyc_status to 'approved'
5. Show verification badge in header

**Components:**
- Document upload UI
- Auto-approval flow with progress indicators
- Success confirmation

### 5. Dashboard (`/dashboard`)

**Flow:**
1. Fetch user portfolio from OwnershipRegistry
2. Get property details from PropertyFactory
3. Enrich with Supabase metadata
4. Display portfolio overview with stats

**Components:**
- Portfolio stats cards
- Property holdings grid
- Quick actions

## Environment Variables

Required in `.env.local`:

```bash
# Hedera Network
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api

# Contract Addresses (from deployment)
NEXT_PUBLIC_ACCESS_CONTROL_ADDRESS=0x...
NEXT_PUBLIC_OWNERSHIP_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_PROPERTY_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# MVP Auto-Approval (WARNING: Production should use backend service)
ADMIN_PRIVATE_KEY=0x...
```

## Deployment Checklist

### 1. Smart Contracts

- [ ] Deploy all 5 contracts to Hedera Testnet
- [ ] Verify contracts on HashScan
- [ ] Save contract addresses
- [ ] Test all contract functions

### 2. Frontend Setup

- [ ] Update `.env.local` with contract addresses
- [ ] Update `.env.local` with Supabase credentials
- [ ] Run database migrations
- [ ] Create Supabase storage buckets
- [ ] Configure RLS policies

### 3. Testing

- [ ] Test wallet connection
- [ ] Test KYC submission and auto-approval
- [ ] Test property creation (admin)
- [ ] Test property purchase flow
- [ ] Test portfolio dashboard

### 4. Production Considerations

**Security:**
- [ ] Move KYC approval to backend service (remove ADMIN_PRIVATE_KEY from env)
- [ ] Implement rate limiting
- [ ] Add transaction replay protection
- [ ] Audit smart contracts

**Performance:**
- [ ] Batch blockchain calls
- [ ] Implement caching strategy
- [ ] Optimize image loading
- [ ] Add CDN for static assets

**Features:**
- [ ] Implement secondary marketplace
- [ ] Add dividend distribution
- [ ] Implement property governance
- [ ] Add transaction history

## Common Issues & Troubleshooting

### Issue: Hydration Mismatch Error

**Cause:** Wallet connection state differs between server and client

**Solution:** Use `mounted` state before rendering wallet-dependent UI:
```typescript
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])

if (!mounted) return <PlaceholderUI />
```

### Issue: Transaction Fails Silently

**Cause:** Insufficient allowance or gas

**Solution:** Always check and auto-approve:
```typescript
await autoApprove({ tokenAddress, spender, amount })
```

### Issue: Property Images Not Loading

**Cause:** Supabase bucket not public or wrong URL

**Solution:**
1. Make property-images bucket public in Supabase
2. Use `getPublicUrl()` helper
3. Add error fallback to DEFAULT_PROPERTY_IMAGE

### Issue: KYC Not Updating in UI

**Cause:** Profile not refreshed after auto-approval

**Solution:** Call `refreshProfile()` after KYC approval completes

## Next Steps

1. **Deploy Smart Contracts** - Deploy to Hedera Testnet and get addresses
2. **Configure Environment** - Update `.env.local` with real addresses
3. **Run Migrations** - Set up Supabase database schema
4. **Test Integration** - Go through complete user flow
5. **Production Prep** - Move sensitive operations to backend

## Support

For issues or questions:
- Smart Contracts: See `/home/mrima/welcome/buner-welcome/CLAUDE.md`
- Frontend: See this document
- Supabase: Check `/database/migrations/` for schema

## Security Notes

⚠️ **MVP Simplifications - DO NOT USE IN PRODUCTION:**

1. **Auto-KYC Approval**: Uses admin private key in environment variables
   - **Production**: Implement backend service with proper verification workflow

2. **Permissive RLS Policies**: Anyone can insert/select data
   - **Production**: Implement proper RLS with wallet signature verification

3. **No Rate Limiting**: API calls are unlimited
   - **Production**: Implement rate limiting per wallet address

4. **No Transaction Replay Protection**: Transactions can be replayed
   - **Production**: Add nonce-based replay protection

## License

Proprietary - Welcome Home Property International Group
