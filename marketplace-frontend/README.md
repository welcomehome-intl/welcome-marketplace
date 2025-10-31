# Welcome Home Property - Frontend Application

A modern web application for real estate tokenization on Hedera blockchain, enabling property browsing, fractional ownership purchases, and portfolio management.

**Live Application**: [https://marketplace.welcomehomeinternationalgroup.com/](https://marketplace.welcomehomeinternationalgroup.com/)

## Overview

Welcome Home Property's frontend provides an intuitive interface for users to invest in tokenized real estate. Built with Next.js 15 and integrated with Hedera Testnet smart contracts, the platform enables seamless interaction with blockchain-based property tokens through a user-friendly web experience.

## Current Implementation (MVP)

The initial release focuses on core functionality to validate market demand while maintaining high-quality user experience:

### Implemented Features

**Property Marketplace**
- Browse all available properties with real-time blockchain data
- View detailed property information (images, location, specifications)
- Property cards displaying token price, total supply, and availability
- Real-time property data fetched from PropertyFactory contract

**Token Purchase System**
- Direct token purchase with HBAR payment
- Hedera-optimized transaction handling (tinybar conversion)
- Transaction feedback with loading states and confirmation
- Real-time balance updates post-purchase
- KYC verification integration

**Portfolio Management**
- Dedicated portfolio page displaying owned properties
- Real-time token balance fetching from PropertyToken contracts
- Ownership percentage calculations
- Property value tracking in HBAR
- "Buy More" functionality for additional purchases
- Auto-refresh every 10 seconds

**Property Creation (Admin)**
- Multi-step property creation form
- Image upload to Supabase Storage
- Metadata management with IPFS URIs
- PropertyFactory integration for on-chain deployment
- Property details (bedrooms, bathrooms, year built, etc.)
- Location and amenity selection

**Wallet Integration**
- Web3 wallet connection via wagmi
- Support for MetaMask, WalletConnect, and other EVM wallets
- Real-time connection status
- Address display and management

**User Interface**
- Modern, responsive design with Tailwind CSS
- Mobile-optimized layouts
- Loading states and error handling
- Interactive property cards
- Dashboard with navigation

## Technology Stack

**Frontend Framework**
- Next.js 15.5.3 (App Router)
- React 19
- TypeScript
- Turbopack for development

**Blockchain Integration**
- wagmi 2.x (React hooks for Ethereum)
- viem (TypeScript Interface for Ethereum)
- Hedera Testnet (Chain ID: 296)

**Database & Storage**
- Supabase (PostgreSQL database)
- Supabase Storage (image and document storage)
- Row-level security policies

**Styling & UI**
- Tailwind CSS
- shadcn/ui components
- Lucide icons
- Custom design system

**State Management**
- React hooks (useState, useEffect)
- Custom hooks for smart contract interactions
- Real-time data fetching with wagmi queries

## Smart Contract Integration

The frontend connects to the following deployed contracts on Hedera Testnet:

| Contract | Address | Integration Status |
|----------|---------|-------------------|
| AccessControl | `0xDDAE60c136ea61552c1e6acF3c7Ab8beBd02eF69` | KYC checks implemented |
| OwnershipRegistry | `0x4Eb9F441eA43141572BC49a4e8Fdf53f44B5C99C` | Not yet integrated |
| PropertyFactory | `0x366e65Ca8645086478454c89C3616Ba0bAf15A35` | Fully integrated |
| PropertyToken | Dynamic (per property) | Balance fetching integrated |
| Marketplace | `0x74347e6046819f6cbc64eb301746c7AaDA614Dec` | Not yet integrated |

**Network Configuration**:
- Network: Hedera Testnet
- Chain ID: 296
- RPC URL: https://testnet.hashio.io/api
- Block Explorer: https://hashscan.io/testnet

## Roadmap: Advanced Features

The smart contracts include advanced features that will be progressively integrated into the frontend as we validate market fit and gather user feedback:

### Phase 2: Enhanced Portfolio (Planned)

**Dividend Management**
- View dividend history per property
- One-click dividend claiming interface
- Cumulative dividend tracking
- Tax reporting data export

**Advanced Analytics**
- Portfolio performance graphs
- ROI calculations
- Property value trends
- Dividend yield analysis

### Phase 3: Secondary Marketplace (Planned)

**Listing Creation**
- Create sell listings for owned tokens
- Set custom prices per token
- Partial or full token sales
- Listing management dashboard

**Marketplace Browsing**
- Browse all active listings
- Filter by property, price, amount
- Compare primary vs secondary prices
- Historical trading data

**Offer System**
- Make offers on listings
- Counter-offer negotiations
- Offer management interface
- Notification system for offers

### Phase 4: Governance & Social (Planned)

**Property Governance**
- Vote on property decisions
- Proposal creation and voting
- Voting power based on token holdings
- Governance history

**Community Features**
- Property discussion forums
- Investor profiles
- Social features for token holders
- Property updates and news

**Enhanced KYC**
- Document upload interface
- KYC status tracking
- Re-verification workflows
- Compliance dashboard

### Phase 5: Mobile & Notifications (Planned)

**Mobile Application**
- Native iOS and Android apps
- Mobile-optimized experiences
- Push notifications

**Real-time Updates**
- WebSocket integration
- Live transaction updates
- Property status changes
- Dividend distribution alerts

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Hedera Testnet account with HBAR
- MetaMask or compatible Web3 wallet

### Installation

```bash
# Clone repository
git clone <repository-url>
cd welcomehome

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with contract addresses and Supabase credentials
```

### Environment Variables

Required variables in `.env.local`:

```bash
# Hedera Network
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api

# Smart Contract Addresses
ACCESS_CONTROL_ADDRESS=0xDDAE60c136ea61552c1e6acF3c7Ab8beBd02eF69
OWNERSHIP_REGISTRY_ADDRESS=0x4Eb9F441eA43141572BC49a4e8Fdf53f44B5C99C
PROPERTY_FACTORY_ADDRESS=0x366e65Ca8645086478454c89C3616Ba0bAf15A35
MARKETPLACE_ADDRESS=0x74347e6046819f6cbc64eb301746c7AaDA614Dec

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

Access the application at [http://localhost:3000](http://localhost:3000)

### Deployment

The application is deployed at [https://marketplace.welcomehomeinternationalgroup.com/](https://marketplace.welcomehomeinternationalgroup.com/)

Deployment is automated via Vercel with the following configuration:
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Environment variables configured in Vercel dashboard

## Project Structure

```
welcomehome/
├── app/
│   ├── (dashboard)/          # Dashboard routes (admin, portfolio)
│   ├── components/           # React components
│   │   ├── admin/           # Admin-specific components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── layout/          # Layout components (header, sidebar)
│   │   ├── marketplace/     # Marketplace components
│   │   ├── property/        # Property-related components
│   │   ├── ui/              # shadcn/ui components
│   │   └── web3/            # Web3 integration components
│   ├── lib/                 # Utility functions and hooks
│   │   ├── supabase/        # Supabase client and hooks
│   │   └── web3/            # Web3 hooks and utilities
│   ├── property/[id]/       # Dynamic property detail pages
│   ├── page.tsx             # Home page (marketplace)
│   └── layout.tsx           # Root layout
├── public/                   # Static assets
└── tailwind.config.ts       # Tailwind configuration
```

## Development Philosophy

**MVP-First Approach**: We are building incrementally, focusing on core user value first before adding complexity. This approach allows us to:
1. Validate market demand quickly
2. Gather user feedback early
3. Iterate based on real usage data
4. Maintain high code quality
5. Ensure stability before scaling

**Progressive Enhancement**: Advanced smart contract features (dividends, marketplace, governance) will be integrated systematically as user adoption grows and feature requirements are validated through actual usage patterns.

**User-Centric Design**: Every feature addition is evaluated based on user feedback and analytics to ensure we are solving real problems rather than building theoretical features.

## Contributing

This is a hackathon submission. For production deployment, please contact the team.

## License

MIT License

## Support

For issues or questions:
- GitHub Issues: [repository-url]/issues
- Documentation: [docs-url]
- Email: support@welcomehomeintl.com
