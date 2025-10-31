# Welcome Home Property - Smart Contracts

A comprehensive real estate tokenization platform built on Hedera Testnet, enabling fractional property ownership through blockchain-based tokens with advanced features including KYC compliance, dividend distribution, and secondary market trading.

## Overview

Welcome Home Property transforms real estate investment by allowing property owners to tokenize their assets and investors to purchase fractional ownership through ERC20 tokens. The platform provides institutional-grade features including regulatory compliance (KYC), automated dividend distribution, role-based access control, and a fully-featured secondary marketplace.

## Architecture

The platform consists of five interconnected smart contracts, each serving a specific purpose:

```
AccessControl (Central Authority)
    ├── OwnershipRegistry (Token Holder Tracking)
    ├── PropertyFactory (Property & Token Management)
    │   └── PropertyToken (ERC20 with Extensions)
    └── Marketplace (Secondary Trading)
```

## Smart Contract Features

### 1. AccessControl

Central authorization and compliance management contract.

**Core Features:**
- **Role Management**: Three-tier hierarchy (Owner > Admin > Property Manager)
- **KYC Verification**: Individual and batch verification with timestamps
- **System Controls**: Emergency pause functionality for all platform operations
- **Transfer Override**: Emergency admin transfer capability for crisis management

**Key Functions:**
- `setAdmin(address, bool)` - Grant or revoke admin privileges
- `setPropertyManager(address, bool)` - Manage property manager roles
- `setKYCStatus(address, bool)` - Verify individual user KYC
- `batchSetKYC(address[], bool)` - Batch KYC verification (up to 100 users)
- `pauseSystem()` / `unpauseSystem()` - Emergency system pause
- `emergencyTransferOverride()` - Force token transfers in emergencies

**Access Levels:**
- **Owner**: Set admins, owns the contract
- **Admin**: Manage KYC, property managers, system pause
- **Property Manager**: Create properties, distribute tokens

### 2. OwnershipRegistry

Cross-contract token holder tracking system for analytics and ownership verification.

**Core Features:**
- **Centralized Tracking**: Maintains ownership records across all property tokens
- **Authorized Updaters**: Only registered PropertyToken contracts can update records
- **Holder Enumeration**: Efficient lookup of all holders for any property token
- **Balance Tracking**: Real-time balance tracking per token per holder
- **Analytics Data**: Total unique holders and token types across platform

**Key Functions:**
- `updateOwnership(address user, address token, uint256 balance)` - Update holder records
- `setAuthorizedUpdater(address, bool)` - Register PropertyToken contracts
- `getTokenHolders(address token)` - Retrieve all holders of a property
- `getUserTokenBalance(address user, address token)` - Query user balances

**Integration:**
Automatically updated by PropertyToken contracts on every transfer, mint, or burn operation.

### 3. PropertyFactory

Property creation and primary token distribution management.

**Core Features:**
- **Property Creation**: Deploy new PropertyToken contracts with full configuration
- **Token Distribution**: Primary offering distribution to KYC-verified investors
- **Metadata Management**: IPFS URI storage for property details
- **Price Management**: Dynamic price per token configuration
- **Status Control**: Enable/disable properties for trading
- **Purchase Mechanism**: Direct token purchase from factory with HBAR

**Key Functions:**
- `createProperty(name, symbol, totalSupply, price, metadataURI)` - Deploy new property
- `distributeTokens(propertyId, address, amount)` - Primary distribution to investors
- `purchaseTokens(propertyId, amount)` - Buy tokens from primary offering
- `updatePropertyMetadata(propertyId, metadataURI)` - Update property information
- `setPropertyActive(propertyId, bool)` - Enable/disable property
- `updatePropertyPrice(propertyId, newPrice)` - Adjust token price

**Property Structure:**
Each property includes:
- Unique ID and name
- ERC20 token contract address
- Total value and supply
- Price per token (in tinybars)
- Active status
- Creator address
- Creation timestamp
- IPFS metadata URI

### 4. PropertyToken

ERC20 token with compliance, dividend, and control extensions.

**Core Features:**
- **Standard ERC20**: Full ERC20 compliance with name, symbol, decimals
- **KYC-Gated Transfers**: All recipients must be KYC-verified
- **Dividend Distribution**: Property managers can distribute HBAR dividends
- **Dividend Claims**: Token holders claim proportional dividends
- **Trading Controls**: Enable/disable trading per property
- **Transfer Restrictions**: Per-user transfer restrictions for compliance
- **Admin Overrides**: Emergency transfer capability for admins
- **Ownership Tracking**: Automatic registry updates on all transfers

**Key Functions:**
- `transfer(address, uint256)` - Transfer tokens (KYC-gated)
- `distributeDividends()` - Property manager deposits dividends
- `claimDividends()` - Token holders claim their share
- `setTradingEnabled(bool)` - Enable/disable token trading
- `setTransferRestriction(address, bool)` - Restrict specific users
- `adminTransfer(from, to, amount)` - Emergency admin transfer

**Dividend Mechanism:**
- Property manager deposits HBAR to contract
- Dividends tracked per token holder
- Users claim at any time
- Proportional to token holdings

**Transfer Rules:**
All transfers require:
1. Recipient is KYC-verified
2. Trading is enabled for the token
3. System is not paused
4. User is not transfer-restricted

### 5. Marketplace

Secondary market for peer-to-peer token trading.

**Core Features:**
- **Listing System**: Sellers create listings with price and amount
- **Direct Purchase**: Buyers can purchase from listings instantly
- **Offer System**: Buyers make offers, sellers accept/reject
- **Platform Fees**: Configurable platform fee (default 2.5%)
- **KYC-Gated**: All participants must be KYC-verified
- **Price Updates**: Sellers can update listing prices
- **Cancellation**: Both listings and offers can be cancelled

**Key Functions:**
- `createListing(token, amount, pricePerToken)` - Seller creates listing
- `buyFromListing(listingId, amount)` - Direct purchase
- `updateListingPrice(listingId, newPrice)` - Seller updates price
- `cancelListing(listingId)` - Remove listing
- `createOffer(listingId, amount, pricePerToken)` - Buyer makes offer
- `acceptOffer(offerId)` - Seller accepts offer
- `cancelOffer(offerId)` - Buyer cancels offer
- `setPlatformFee(uint256)` - Admin sets platform fee

**Trading Flow:**
1. Seller approves Marketplace contract to spend tokens
2. Seller creates listing with desired price
3. Buyer either purchases directly or makes an offer
4. Platform takes 2.5% fee from seller
5. Tokens transferred to buyer, HBAR to seller

## Deployed Contracts (Hedera Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| AccessControl | `0xDDAE60c136ea61552c1e6acF3c7Ab8beBd02eF69` | Authorization & KYC |
| OwnershipRegistry | `0x4Eb9F441eA43141572BC49a4e8Fdf53f44B5C99C` | Token holder tracking |
| PropertyFactory | `0x366e65Ca8645086478454c89C3616Ba0bAf15A35` | Property creation |
| Marketplace | `0x74347e6046819f6cbc64eb301746c7AaDA614Dec` | Secondary trading |

**Network Details:**
- Network: Hedera Testnet
- Chain ID: 296
- RPC URL: https://testnet.hashio.io/api
- Block Explorer: https://hashscan.io/testnet
- Deployment Date: October 26, 2025
- Deployer: `0xD1B156294aFa63d7d174D06D5A83e547d7a5abA9`

## Technical Specifications

- **Solidity Version**: 0.8.19
- **Development Framework**: Foundry
- **Dependencies**: OpenZeppelin Contracts (ERC20, Ownable, ReentrancyGuard)
- **Testing**: Comprehensive unit and integration tests
- **Security**: ReentrancyGuard on all value transfers, access control on admin functions

## Development

### Prerequisites

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Setup

```bash
# Clone repository
git clone <repository-url>
cd buner-welcome

# Install dependencies
forge install

# Configure environment
cp .env.example .env
# Edit .env with your Hedera testnet private key
```

### Build

```bash
forge build
```

### Test

```bash
# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Run specific test
forge test --match-test testPropertyCreation

# Generate gas report
forge test --gas-report
```

### Deploy

Deployment is handled through atomic scripts to ensure reliability on Hedera:

```bash
# Deploy all contracts
./deploy_all.sh

# Or deploy individually
forge script script/01_deploy_access_control.s.sol --rpc-url $HEDERA_RPC_URL --broadcast --legacy
```

**Note**: Hedera requires `--legacy` flag for EIP-155 transactions.

## Security Features

1. **Reentrancy Protection**: All payable and token transfer functions protected
2. **Access Control**: Multi-level role-based permissions
3. **KYC Compliance**: Mandatory KYC for all token transfers and marketplace participation
4. **Emergency Pause**: System-wide pause capability for crisis management
5. **Input Validation**: Comprehensive validation on all external functions
6. **Event Logging**: Complete audit trail via events

## Key Design Patterns

1. **Modular Architecture**: Separation of concerns across five specialized contracts
2. **Upgradeable Access Control**: Centralized authorization system
3. **Authorized Updater Pattern**: Registry only accepts updates from verified contracts
4. **Factory Pattern**: Dynamic PropertyToken deployment
5. **Emergency Controls**: Admin override capabilities for crisis scenarios

## Integration Guide

### Creating a Property

```solidity
// Property manager calls PropertyFactory
propertyFactory.createProperty(
    "Luxury Penthouse",          // name
    "LUXPEN",                     // symbol
    1000000 * 10**18,            // totalSupply (1M tokens)
    10 * 10**18,                 // pricePerToken (10 HBAR)
    "ipfs://QmPropertyMetadata"  // metadataURI
);
```

### Distributing Tokens

```solidity
// Property manager distributes to KYC-verified investor
propertyFactory.distributeTokens(
    propertyId,
    investorAddress,
    10000 * 10**18  // 10,000 tokens
);
```

### Purchasing Tokens

```solidity
// Investor purchases tokens with HBAR
propertyFactory.purchaseTokens{value: cost}(propertyId, amount);
```

### Distributing Dividends

```solidity
// Property manager distributes rental income
propertyToken.distributeDividends{value: dividendAmount}();
```

### Marketplace Trading

```solidity
// Seller creates listing
propertyToken.approve(marketplaceAddress, amount);
marketplace.createListing(tokenAddress, amount, pricePerToken);

// Buyer purchases
marketplace.buyFromListing{value: totalCost}(listingId, amount);
```

## License

MIT License
