# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Welcome Home International Group** - A blockchain-powered fractional real estate ownership platform targeting the African diaspora. Enables purchasing fractional ownership of properties via tokenization on Hedera, with staking rewards (5% APY), property governance, revenue distributions, and secondary market trading.

## Development Commands

```bash
# Development (uses Turbopack for faster builds)
npm run dev              # Starts dev server on http://localhost:3000

# Production build
npm run build            # Build with Turbopack
npm start               # Start production server

# Linting
npm run lint            # Run ESLint
```

## Environment Setup

**Required:** Create `.env.local` with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Hedera Network Configuration
NEXT_PUBLIC_HEDERA_NETWORK=testnet                        # or 'mainnet'
NEXT_PUBLIC_HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api
NEXT_PUBLIC_HEDERA_MAINNET_RPC_URL=https://mainnet.hashio.io/api

# Smart Contract Addresses (Modular Architecture)
NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS=
NEXT_PUBLIC_KYC_REGISTRY_ADDRESS=
NEXT_PUBLIC_OWNERSHIP_REGISTRY_ADDRESS=
NEXT_PUBLIC_PROPERTY_FACTORY_ADDRESS=
NEXT_PUBLIC_PROPERTY_GOVERNANCE_ADDRESS=
NEXT_PUBLIC_DEMO_PROPERTY_TOKEN_ADDRESS=
NEXT_PUBLIC_DEMO_TOKEN_HANDLER_ADDRESS=

# Optional: WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=

# Optional: IPFS (for property metadata storage)
NEXT_PUBLIC_IPFS_API_URL=/ip4/127.0.0.1/tcp/5001
NEXT_PUBLIC_IPFS_GATEWAY_URL=http://127.0.0.1:8080
NEXT_PUBLIC_IPFS_PROJECT_ID=
NEXT_PUBLIC_IPFS_PROJECT_SECRET=
```

## Architecture

### Hybrid Blockchain + Database Architecture

The platform uses **two data layers**:

1. **Blockchain (Hedera)** - Source of truth for:
   - Ownership records
   - Financial transactions
   - Smart contract state
   - Token balances and transfers

2. **Supabase** - Performance caching layer for:
   - User profiles
   - Indexed transaction history
   - Real-time notifications
   - Query optimization

Smart contract events trigger Supabase updates via event listeners in hooks.

### Modular Smart Contract System

**NEW Architecture** (recently migrated from monolithic contracts):

- `PaymentToken` - ERC20 for platform transactions
- `KYCRegistry` - Accredited investor verification
- `OwnershipRegistry` - Cross-property portfolio tracking
- `PropertyFactory` - Multi-property deployment system
- `PropertyGovernance` - Decentralized voting system
- `PropertyTokenHandler` - Per-property operations (staking, sales, revenue)

Each contract has dedicated React hooks in `/app/lib/web3/hooks/`.

### Critical SSR Hydration Workaround

**Problem:** WalletConnect uses IndexedDB which breaks SSR in Next.js 15.

**Solution:** The `Web3Provider` component delays mounting until client-side:

```typescript
// app/components/providers/web3-provider.tsx
if (!mounted) {
  return <>{children}</>  // Don't render WagmiProvider during SSR
}
```

This prevents hydration mismatches but means wallet state is unavailable during SSR.

### Transaction Caching Strategy

The `TransactionCacheProvider` automatically indexes blockchain transactions to Supabase:

1. Uses `sessionStorage` to prevent re-indexing on every page load
2. Shows loading indicator during initial indexing
3. Enables instant transaction history without repeated RPC calls
4. Syncs smart contract events to database for query performance

### Token Unit Handling (NON-STANDARD)

**CRITICAL:** This system uses **base units**, NOT wei conversion:

```typescript
// Display: "1000 tokens" -> Contract: BigInt(1000)
// DO NOT use parseEther() or parseUnits() for token amounts
// This is intentional for simplified UX
```

Unlike most ERC20 tokens with 18 decimals, this platform uses base units directly.

## Database (Supabase)

### Row Level Security (RLS) Patterns

All tables use **permissive RLS policies** based on `wallet_address`:

- **Users table:** Users can only access their own profile
- **Properties table:** Publicly readable, admin-write only
- **Transactions table:** Users see only their transactions
- **Governance table:** Publicly readable (transparency), user-write only for votes
- **Revenue claims:** User-specific access only

**Known Issue:** The `users` table may have RLS policy violations on INSERT. The error:
```
"code": "42501",
"message": "new row violates row-level security policy for table \"users\""
```
occurs when wallet authentication doesn't properly set the context for RLS checks.

### Database Schema Key Patterns

- **Multi-property support:** `property_id` foreign keys throughout
- **Wallet-based authentication:** No traditional user/password system
- **Event-driven updates:** Smart contract events trigger database inserts
- **Normalized relationships:** Properties → Tokens → Handlers → Revenue/Staking

## Web3 Integration Patterns

### Custom Hook Architecture

Every contract gets a dedicated hook with standardized patterns:

```typescript
// Read operations
const { data, isLoading, error } = useReadContract({
  address: CONTRACT_ADDRESSES.PAYMENT_TOKEN,
  abi: PaymentTokenABI,
  functionName: 'balanceOf',
  args: [address],
})

// Write operations
const { writeContract, isPending } = useWriteContract()
const { isSuccess } = useWaitForTransactionReceipt({ hash })
```

Hooks located in:
- `/app/lib/web3/hooks/` - Web3/blockchain hooks
- `/app/lib/supabase/hooks/` - Supabase data hooks

### Mock Data Fallback Strategy

Many hooks use **silent fallback to mock data** when contracts are unavailable:

```typescript
if (!publicClient || !factoryAddress) {
  setProperties(MOCK_PROPERTIES)  // Development mode
}
```

This enables frontend development without deployed contracts, but can hide deployment issues. Check browser console for connection errors.

### Hedera Network Configuration

The platform uses Hedera (not Ethereum):
- **Chain ID:** 296 (testnet), 295 (mainnet)
- **Block time:** ~3 seconds (consensus time)
- **Native currency:** HBAR (displayed with 18 decimals for MetaMask compatibility, but uses 8 decimals natively)
- **Explorer:** HashScan (https://hashscan.io/testnet)

## IPFS Integration

Property metadata and documents stored on IPFS using singleton pattern:

```typescript
IPFSService.getInstance()  // Single instance across app
```

Configuration via environment variables with graceful degradation if IPFS unavailable.

## File Organization

```
/app                         # Next.js 15 App Router
  /(auth)                    # Auth routes (sign-in, sign-up)
  /(dashboard)               # Protected dashboard routes
  /components                # Shared UI components
    /providers               # Context providers (Web3, Supabase, Transactions)
    /ui                      # Shadcn UI primitives
  /lib
    /web3                    # Blockchain logic
      /hooks                 # Contract interaction hooks
      /abis                  # Smart contract ABIs
    /supabase                # Database logic
      /hooks                 # Database query hooks
    /types                   # TypeScript definitions

/frontend                    # LEGACY Vite React app (consider removing)
/supabase                    # Database migrations and types
```

**Note:** The codebase has TWO frontends (Next.js in `/app` and Vite in `/frontend`). The Next.js app is primary.

## Known Issues

### Current Errors in Logs

1. **RLS Policy Violations:** Users table INSERT operations failing (see Database section)
2. **SSR Hydration Mismatches:** Wallet connection state differs between server/client (partially fixed)
3. **WalletConnect Multiple Initialization:** "WalletConnect Core is already initialized" warnings
4. **HTTP 406 Errors:** Supabase REST API rejecting some requests (check Accept headers)

### Build Configuration Concerns

The `next.config.ts` has:
```typescript
ignoreBuildErrors: true
ignoreDuringBuilds: true
```

This allows deployment with TypeScript/ESLint errors, which is concerning for production.

### Testing Infrastructure

**CRITICAL:** No testing infrastructure exists:
- No test files (*.test.ts, *.spec.ts)
- No Jest/Vitest configuration
- No CI/CD testing pipeline

For a financial platform handling real assets, this is a significant production risk.

## Working with Smart Contracts

### Contract Deployment Workflow

1. Deploy contracts to Hedera testnet using Hardhat/Foundry
2. Update contract addresses in `.env.local`
3. Verify ABIs in `/app/lib/web3/abis/` match deployed contracts
4. Test contract interactions in browser console before UI integration
5. Monitor transactions on HashScan explorer

### Debugging Contract Interactions

```typescript
// Enable detailed logging in error-utils.ts
console.error('Error details:', serializeError(error))
console.error('Raw error object:', error)
```

Common issues:
- **"execution reverted":** Contract logic rejection (check require statements)
- **"insufficient funds":** Need HBAR for gas fees
- **"nonce too low":** Stale transaction, refresh wallet state
- **RPC errors:** Check Hedera RPC URL and network connectivity

## User Permissions and Access Control

The `useUserPermissions()` hook combines:
- KYC verification status (from Supabase)
- Wallet connection state (from Wagmi)
- Admin role checks (from smart contracts)

Used for:
- Admin panel access (`/admin` route)
- Property management permissions
- Investment limit enforcement
- Governance proposal creation

## Development Workflow Recommendations

1. **Start Supabase locally** (if using local instance) before running dev server
2. **Check wallet connection** in browser console if Web3 hooks return null
3. **Verify contract addresses** match deployed contracts on HashScan
4. **Monitor RLS policy errors** in browser console (common during development)
5. **Use React DevTools** to inspect provider state (Web3Provider, TransactionCacheProvider)
6. **Test with MetaMask** connected to Hedera testnet (chain ID 296)

## Code Conventions

- **TypeScript:** Strictly typed (but build errors ignored - fix before production)
- **Component naming:** PascalCase for components, kebab-case for files
- **Hook naming:** `use-` prefix, located in `/lib/*/hooks/`
- **Error handling:** Centralized in `error-utils.ts` with structured logging
- **State management:** React Context for global state, TanStack Query for server state
- **Styling:** Tailwind CSS with shadcn/ui components
