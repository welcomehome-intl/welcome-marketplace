# Smart Contract Architecture - Welcome Home Property Platform

This document provides comprehensive architectural diagrams for the Welcome Home Property tokenization platform smart contracts deployed on Hedera Testnet.

## Table of Contents
1. [Contract Overview & Relationships](#1-contract-overview--relationships)
2. [Contract Interaction Flow](#2-contract-interaction-flow)
3. [Property Creation & Distribution](#3-property-creation--distribution)
4. [Token Transfer Flow](#4-token-transfer-flow)
5. [Marketplace Trading Flow](#5-marketplace-trading-flow)
6. [Access Control & Authorization](#6-access-control--authorization)
7. [Dividend Distribution Flow](#7-dividend-distribution-flow)

---

## 1. Contract Overview & Relationships

```mermaid
classDiagram
    class AccessControl {
        +mapping isKYCVerified
        +mapping isAdmin
        +mapping isPropertyManager
        +mapping kycTimestamp
        +bool systemPaused
        +setAdmin(address, bool)
        +setPropertyManager(address, bool)
        +setKYCStatus(address, bool)
        +batchSetKYC(address[], bool)
        +pauseSystem()
        +unpauseSystem()
        +emergencyTransferOverride()
    }

    class OwnershipRegistry {
        +mapping userTokenBalances
        +mapping userOwnedTokens
        +mapping tokenHolders
        +mapping authorizedUpdaters
        +uint256 totalUniqueHolders
        +uint256 totalTokenTypes
        +updateOwnership(address, address, uint256)
        +setAuthorizedUpdater(address, bool)
        +getTokenHolders(address)
        +getUserTokenBalance(address, address)
    }

    class PropertyFactory {
        +mapping properties
        +mapping propertiesByCreator
        +uint256 nextPropertyId
        +AccessControl accessControl
        +OwnershipRegistry ownershipRegistry
        +createProperty(string, string, uint256, uint256, uint256)
        +distributeTokens(uint256, address, uint256)
        +purchaseTokens(uint256, uint256)
        +updatePropertyMetadata(uint256, string)
        +setPropertyActive(uint256, bool)
    }

    class PropertyToken {
        +uint256 propertyId
        +address propertyFactory
        +AccessControl accessControl
        +OwnershipRegistry ownershipRegistry
        +mapping transferRestrictions
        +bool tradingEnabled
        +uint256 dividendPool
        +mapping lastDividendClaim
        +transfer(address, uint256)
        +distributeDividends()
        +claimDividends()
        +setTradingEnabled(bool)
        +adminTransfer(address, address, uint256)
    }

    class Marketplace {
        +mapping listings
        +mapping offers
        +uint256 nextListingId
        +uint256 nextOfferId
        +uint256 platformFeePercent
        +address feeCollector
        +AccessControl accessControl
        +createListing(address, uint256, uint256)
        +buyFromListing(uint256, uint256)
        +createOffer(uint256, uint256, uint256)
        +acceptOffer(uint256)
        +cancelListing(uint256)
    }

    class Ownable {
        <<OpenZeppelin>>
        +address owner
        +transferOwnership(address)
    }

    class ReentrancyGuard {
        <<OpenZeppelin>>
        +modifier nonReentrant
    }

    class ERC20 {
        <<OpenZeppelin>>
        +mapping balances
        +mapping allowances
        +totalSupply()
        +balanceOf(address)
        +transfer(address, uint256)
        +approve(address, uint256)
    }

    Ownable <|-- AccessControl
    ReentrancyGuard <|-- AccessControl
    ReentrancyGuard <|-- PropertyFactory
    ERC20 <|-- PropertyToken
    ReentrancyGuard <|-- PropertyToken
    ReentrancyGuard <|-- Marketplace

    PropertyFactory --> AccessControl : reads roles & KYC
    PropertyFactory --> OwnershipRegistry : registers tokens
    PropertyFactory ..> PropertyToken : creates instances
    PropertyToken --> AccessControl : checks KYC & pause
    PropertyToken --> OwnershipRegistry : updates on transfer
    Marketplace --> AccessControl : checks KYC & pause
    Marketplace --> PropertyToken : calls transferFrom
    OwnershipRegistry --> AccessControl : checks roles
```

**Key Relationships:**
- **AccessControl** is the central authority for roles and KYC verification
- **OwnershipRegistry** tracks token holders across all PropertyToken contracts
- **PropertyFactory** deploys PropertyToken instances and manages properties
- **PropertyToken** is an ERC20 with KYC-gated transfers and dividend features
- **Marketplace** facilitates P2P trading of property tokens

---

## 2. Contract Interaction Flow

```mermaid
sequenceDiagram
    participant PM as Property Manager
    participant PF as PropertyFactory
    participant PT as PropertyToken
    participant OR as OwnershipRegistry
    participant AC as AccessControl
    participant MP as Marketplace
    participant User

    Note over PM,User: Property Creation Flow
    PM->>AC: Check if Property Manager
    AC-->>PM: Role Confirmed
    PM->>PF: createProperty(name, supply, price)
    PF->>PT: Deploy new PropertyToken
    PT-->>PF: Token Contract Address
    PF->>OR: setAuthorizedUpdater(tokenAddress, true)
    OR-->>PF: Authorized
    PF->>PT: mint(totalSupply, to: factory)
    PT->>OR: updateOwnership(factory, token, balance)
    PF-->>PM: Property Created (ID, Token Address)

    Note over PM,User: Token Distribution Flow
    PM->>PF: distributeTokens(propertyId, investor, amount)
    PF->>AC: isUserKYCed(investor)
    AC-->>PF: KYC Verified
    PF->>PT: transfer(investor, amount)
    PT->>AC: isUserKYCed(investor)
    AC-->>PT: KYC Verified
    PT->>OR: updateOwnership(investor, token, newBalance)
    PT-->>PF: Transfer Complete
    PF-->>PM: Distribution Complete

    Note over User,MP: Token Purchase Flow
    User->>PF: purchaseTokens(propertyId, amount) + HBAR
    PF->>AC: isUserKYCed(user)
    AC-->>PF: KYC Verified
    PF->>PT: transfer(user, amount)
    PT->>OR: updateOwnership(user, token, balance)
    PF-->>User: Tokens Transferred

    Note over User,MP: Marketplace Trading Flow
    User->>PT: approve(marketplace, amount)
    User->>MP: createListing(token, amount, price)
    MP->>PT: transferFrom(user, marketplace, amount)
    PT->>OR: updateOwnership(marketplace, token, balance)

    User->>MP: buyFromListing(listingId) + HBAR
    MP->>AC: isUserKYCed(buyer)
    AC-->>MP: KYC Verified
    MP->>PT: transfer(buyer, amount)
    PT->>OR: updateOwnership(buyer, token, balance)
    MP-->>User: Purchase Complete
```

---

## 3. Property Creation & Distribution

```mermaid
flowchart TD
    Start([Property Manager Initiates]) --> CheckRole{Is Property<br/>Manager?}
    CheckRole -->|No| Reject1[❌ Transaction Reverted:<br/>Not Property Manager]
    CheckRole -->|Yes| CreateProp[Call PropertyFactory.<br/>createProperty]

    CreateProp --> DeployToken[PropertyFactory deploys<br/>new PropertyToken contract]
    DeployToken --> MintTokens[Mint total supply to<br/>PropertyFactory address]
    MintTokens --> RegisterToken[Register PropertyToken as<br/>authorized updater in<br/>OwnershipRegistry]
    RegisterToken --> UpdateRegistry1[OwnershipRegistry records<br/>Factory as initial holder]
    UpdateRegistry1 --> EmitEvent1[Emit PropertyCreated event]
    EmitEvent1 --> PropCreated([✅ Property Created])

    PropCreated --> Distribute{Property Manager<br/>Distributes Tokens?}
    Distribute -->|Yes| CheckKYC{Recipient<br/>KYC Verified?}
    CheckKYC -->|No| Reject2[❌ Transaction Reverted:<br/>Recipient Not KYC Verified]
    CheckKYC -->|Yes| TransferTokens[PropertyFactory.transfer<br/>to investor]

    TransferTokens --> UpdateRegistry2[PropertyToken notifies<br/>OwnershipRegistry]
    UpdateRegistry2 --> UpdateBalances[Update user balances<br/>and holder lists]
    UpdateBalances --> EmitEvent2[Emit TokensDistributed event]
    EmitEvent2 --> Complete([✅ Distribution Complete])

    Distribute -->|No| Purchase{User Purchases<br/>Directly?}
    Purchase -->|Yes| CheckKYC2{Buyer<br/>KYC Verified?}
    CheckKYC2 -->|No| Reject3[❌ Transaction Reverted:<br/>Buyer Not KYC Verified]
    CheckKYC2 -->|Yes| CheckPayment{Payment<br/>Sufficient?}
    CheckPayment -->|No| Reject4[❌ Transaction Reverted:<br/>Insufficient Payment]
    CheckPayment -->|Yes| ExecutePurchase[Transfer tokens to buyer<br/>Update OwnershipRegistry]
    ExecutePurchase --> EmitEvent3[Emit TokensPurchased event]
    EmitEvent3 --> Complete

    style CheckRole fill:#e1f5ff
    style CheckKYC fill:#e1f5ff
    style CheckKYC2 fill:#e1f5ff
    style CheckPayment fill:#e1f5ff
    style Reject1 fill:#ffebee
    style Reject2 fill:#ffebee
    style Reject3 fill:#ffebee
    style Reject4 fill:#ffebee
    style Complete fill:#e8f5e9
    style PropCreated fill:#e8f5e9
```

---

## 4. Token Transfer Flow

```mermaid
sequenceDiagram
    participant Sender
    participant PT as PropertyToken
    participant AC as AccessControl
    participant OR as OwnershipRegistry
    participant Recipient

    Sender->>PT: transfer(recipient, amount)

    Note over PT: Transfer Validations
    PT->>PT: Check sender balance >= amount

    PT->>AC: isUserKYCed(recipient)
    AC-->>PT: KYC Status
    alt Recipient Not KYC Verified
        PT-->>Sender: ❌ Revert: Recipient not KYC verified
    end

    PT->>PT: Check tradingEnabled
    alt Trading Disabled
        PT-->>Sender: ❌ Revert: Trading disabled
    end

    PT->>AC: isSystemPaused()
    AC-->>PT: Pause Status
    alt System Paused
        PT-->>Sender: ❌ Revert: System paused
    end

    PT->>PT: Check transferRestrictions[sender]
    alt Sender Restricted
        PT-->>Sender: ❌ Revert: User transfer restricted
    end

    Note over PT: Execute Transfer
    PT->>PT: balances[sender] -= amount
    PT->>PT: balances[recipient] += amount

    Note over PT: Update Registry
    PT->>OR: updateOwnership(sender, token, newBalance)
    OR->>OR: Update userTokenBalances[sender]
    OR->>OR: Update/remove from tokenHolders if needed
    OR->>OR: Update totalUniqueHolders if needed
    OR-->>PT: Update Complete

    PT->>OR: updateOwnership(recipient, token, newBalance)
    OR->>OR: Update userTokenBalances[recipient]
    OR->>OR: Add to tokenHolders if new
    OR->>OR: Update totalUniqueHolders if needed
    OR-->>PT: Update Complete

    PT->>PT: Emit Transfer event
    PT-->>Sender: ✅ Transfer Successful

    Note over Recipient: Recipient can now<br/>claim dividends proportional<br/>to new balance
```

---

## 5. Marketplace Trading Flow

```mermaid
flowchart TD
    Start([Seller Wants to Sell Tokens]) --> CheckKYC1{Seller<br/>KYC Verified?}
    CheckKYC1 -->|No| Reject1[❌ Transaction Reverted:<br/>Seller Not KYC Verified]
    CheckKYC1 -->|Yes| ApproveTokens[Seller approves Marketplace<br/>to spend tokens]

    ApproveTokens --> CreateListing[Seller calls createListing<br/>token, amount, pricePerToken]
    CreateListing --> TransferToMP[Marketplace transfers tokens<br/>from seller to marketplace]
    TransferToMP --> StoreListing[Store listing details:<br/>ID, seller, token, amount, price]
    StoreListing --> EmitEvent1[Emit ListingCreated event]
    EmitEvent1 --> ListingActive([✅ Listing Active])

    ListingActive --> BuyerAction{Buyer Action?}

    BuyerAction -->|Direct Purchase| CheckKYC2{Buyer<br/>KYC Verified?}
    CheckKYC2 -->|No| Reject2[❌ Transaction Reverted:<br/>Buyer Not KYC Verified]
    CheckKYC2 -->|Yes| CheckPayment{Payment<br/>Sufficient?}
    CheckPayment -->|No| Reject3[❌ Transaction Reverted:<br/>Insufficient Payment]
    CheckPayment -->|Yes| CalcFee[Calculate platform fee<br/>2.5% of total price]

    CalcFee --> TransferFee[Transfer fee to<br/>fee collector]
    TransferFee --> TransferPayment[Transfer remaining HBAR<br/>to seller]
    TransferPayment --> TransferTokens1[Transfer tokens from<br/>marketplace to buyer]
    TransferTokens1 --> UpdateRegistry1[Update OwnershipRegistry<br/>for buyer]
    UpdateRegistry1 --> DeactivateListing1[Mark listing as inactive]
    DeactivateListing1 --> EmitEvent2[Emit TokensPurchased event]
    EmitEvent2 --> Complete1([✅ Purchase Complete])

    BuyerAction -->|Make Offer| CheckKYC3{Buyer<br/>KYC Verified?}
    CheckKYC3 -->|No| Reject4[❌ Transaction Reverted:<br/>Buyer Not KYC Verified]
    CheckKYC3 -->|Yes| StoreOffer[Store offer details:<br/>ID, buyer, listing, amount, price]
    StoreOffer --> EmitEvent3[Emit OfferCreated event]
    EmitEvent3 --> OfferActive([✅ Offer Active])

    OfferActive --> SellerAction{Seller Accepts<br/>Offer?}
    SellerAction -->|No| OfferWaits[Offer remains active<br/>or buyer cancels]
    SellerAction -->|Yes| ValidateOffer{Offer Still<br/>Valid?}
    ValidateOffer -->|No| Reject5[❌ Transaction Reverted:<br/>Offer Inactive or Invalid]
    ValidateOffer -->|Yes| CheckPayment2{Buyer Payment<br/>Escrowed?}
    CheckPayment2 -->|No| Reject6[❌ Transaction Reverted:<br/>Insufficient Payment]
    CheckPayment2 -->|Yes| ExecuteOffer[Execute same flow as<br/>direct purchase]
    ExecuteOffer --> Complete2([✅ Offer Accepted])

    BuyerAction -->|Cancel Listing| ValidateSeller{Caller is<br/>Seller?}
    ValidateSeller -->|No| Reject7[❌ Transaction Reverted:<br/>Not Listing Owner]
    ValidateSeller -->|Yes| ReturnTokens[Return tokens to seller]
    ReturnTokens --> DeactivateListing2[Mark listing as inactive]
    DeactivateListing2 --> EmitEvent4[Emit ListingCancelled event]
    EmitEvent4 --> Complete3([✅ Listing Cancelled])

    style CheckKYC1 fill:#e1f5ff
    style CheckKYC2 fill:#e1f5ff
    style CheckKYC3 fill:#e1f5ff
    style CheckPayment fill:#e1f5ff
    style CheckPayment2 fill:#e1f5ff
    style ValidateOffer fill:#e1f5ff
    style ValidateSeller fill:#e1f5ff
    style Reject1 fill:#ffebee
    style Reject2 fill:#ffebee
    style Reject3 fill:#ffebee
    style Reject4 fill:#ffebee
    style Reject5 fill:#ffebee
    style Reject6 fill:#ffebee
    style Reject7 fill:#ffebee
    style Complete1 fill:#e8f5e9
    style Complete2 fill:#e8f5e9
    style Complete3 fill:#e8f5e9
```

---

## 6. Access Control & Authorization

```mermaid
graph TB
    subgraph "Role Hierarchy"
        Owner[Owner<br/>Highest Authority] --> Admin1[Admin]
        Owner --> Admin2[Admin]
        Admin1 --> PM1[Property Manager]
        Admin1 --> PM2[Property Manager]
        Admin2 --> PM3[Property Manager]
    end

    subgraph "Owner Permissions"
        Owner --> SetAdmin[Set/Revoke<br/>Admin Role]
        Owner --> TransferOwnership[Transfer<br/>Ownership]
    end

    subgraph "Admin Permissions"
        Admin1 --> SetPM[Set/Revoke Property<br/>Manager Role]
        Admin1 --> SetKYC[Set KYC<br/>Status]
        Admin1 --> BatchKYC[Batch KYC<br/>100 users max]
        Admin1 --> PauseSystem[Pause/Unpause<br/>System]
        Admin1 --> EmergencyTransfer[Emergency<br/>Transfer Override]
        Admin1 --> SetMarketplaceFee[Set Marketplace<br/>Fee]
    end

    subgraph "Property Manager Permissions"
        PM1 --> CreateProperty[Create<br/>Property]
        PM1 --> DistributeTokens[Distribute<br/>Tokens]
        PM1 --> UpdateMetadata[Update Property<br/>Metadata]
        PM1 --> SetPropertyStatus[Set Property<br/>Active/Inactive]
        PM1 --> DistributeDividends[Distribute<br/>Dividends]
    end

    subgraph "KYC Verification Flow"
        User[User Submits KYC] --> AdminReview{Admin<br/>Reviews}
        AdminReview -->|Approved| SetKYCTrue[setKYCStatus<br/>user, true]
        AdminReview -->|Rejected| SetKYCFalse[setKYCStatus<br/>user, false]
        SetKYCTrue --> RecordTimestamp[Record<br/>kycTimestamp]
        SetKYCTrue --> CanTrade[✅ User Can Trade<br/>& Receive Tokens]
        SetKYCFalse --> CannotTrade[❌ User Cannot Trade<br/>or Receive Tokens]
    end

    subgraph "Emergency Controls"
        Emergency[Emergency Situation] --> AdminPause[Admin Calls<br/>pauseSystem]
        AdminPause --> SystemPaused[All Operations<br/>Halted]
        SystemPaused --> CheckPause{Check<br/>whenNotPaused<br/>Modifier}
        CheckPause --> BlockOps[Block:<br/>- Token Transfers<br/>- Property Creation<br/>- Marketplace Trading<br/>- Token Distribution]
        AdminResolve[Admin Resolves Issue] --> AdminUnpause[Admin Calls<br/>unpauseSystem]
        AdminUnpause --> SystemActive[✅ System Active<br/>Operations Resume]
    end

    style Owner fill:#b71c1c,color:#fff
    style Admin1 fill:#d32f2f,color:#fff
    style Admin2 fill:#d32f2f,color:#fff
    style PM1 fill:#f44336,color:#fff
    style PM2 fill:#f44336,color:#fff
    style PM3 fill:#f44336,color:#fff
    style User fill:#90caf9
    style CanTrade fill:#e8f5e9
    style CannotTrade fill:#ffebee
    style SystemActive fill:#e8f5e9
    style BlockOps fill:#ffebee
```

**Authorization Flow for Common Operations:**

| Operation | Required Role | Additional Checks |
|-----------|---------------|-------------------|
| Create Property | Property Manager | System not paused |
| Distribute Tokens | Property Manager | Recipient KYC verified, System not paused |
| Purchase Tokens | Any User | Buyer KYC verified, Sufficient payment, System not paused |
| Transfer Tokens | Token Owner | Recipient KYC verified, Trading enabled, System not paused, Sender not restricted |
| Create Listing | Token Owner | Seller KYC verified, Tokens approved, System not paused |
| Buy from Listing | Any User | Buyer KYC verified, Sufficient payment, System not paused |
| Set KYC Status | Admin | Valid address |
| Pause System | Admin | N/A |
| Distribute Dividends | Property Manager | System not paused |

---

## 7. Dividend Distribution Flow

```mermaid
sequenceDiagram
    participant PM as Property Manager
    participant PT as PropertyToken
    participant User1 as Token Holder 1
    participant User2 as Token Holder 2
    participant User3 as Token Holder 3

    Note over PM,User3: Dividend Distribution Phase
    PM->>PT: distributeDividends() + HBAR
    PT->>PT: dividendPool += msg.value
    PT->>PT: totalDividendsDistributed += msg.value
    PT->>PT: lastDividendTimestamp = now
    PT->>PT: Emit DividendsDistributed event
    PT-->>PM: ✅ Dividends Deposited

    Note over User1,User3: Token Holders Notified<br/>via Event

    Note over User1,User3: Claim Phase - Proportional Distribution
    User1->>PT: claimDividends()
    PT->>PT: Calculate User1 Share<br/>(balance / totalSupply) * dividendPool
    alt User1 has no tokens
        PT-->>User1: ❌ Revert: No tokens held
    end
    alt User1 already claimed recently
        PT-->>User1: ❌ Revert: Already claimed
    end
    PT->>PT: dividendPool -= user1Share
    PT->>PT: lastDividendClaim[user1] = now
    PT->>User1: Transfer HBAR (user1Share)
    PT->>PT: Emit DividendsClaimed event
    PT-->>User1: ✅ Dividends Received

    User2->>PT: claimDividends()
    PT->>PT: Calculate User2 Share<br/>(balance / totalSupply) * dividendPool
    PT->>PT: dividendPool -= user2Share
    PT->>PT: lastDividendClaim[user2] = now
    PT->>User2: Transfer HBAR (user2Share)
    PT->>PT: Emit DividendsClaimed event
    PT-->>User2: ✅ Dividends Received

    Note over User3: User3 hasn't claimed yet<br/>Dividends remain in pool

    Note over PT: Dividend Pool Tracking
    PT->>PT: Remaining dividendPool for unclaimed shares
    PT->>PT: Track totalDividendsDistributed historically

    Note over User3: User3 can claim anytime<br/>Proportional share reserved
    User3->>PT: claimDividends() [Later]
    PT->>PT: Calculate User3 Share
    PT->>PT: dividendPool -= user3Share
    PT->>User3: Transfer HBAR (user3Share)
    PT-->>User3: ✅ Dividends Received
```

**Dividend Calculation Example:**

```
Property: 1,000,000 tokens issued
Dividend Deposit: 100 HBAR

Token Holder Balances:
- User1: 300,000 tokens (30%)
- User2: 200,000 tokens (20%)
- User3: 500,000 tokens (50%)

Dividend Shares:
- User1: 100 * 0.30 = 30 HBAR
- User2: 100 * 0.20 = 20 HBAR
- User3: 100 * 0.50 = 50 HBAR

Total: 100 HBAR (distributed proportionally)
```

**Key Features:**
- Dividends are **proportional** to token holdings
- Users **claim** dividends (pull pattern, not push)
- Unclaimed dividends remain in pool
- Tracks last claim timestamp to prevent double claims
- Property manager can distribute multiple times
- Historical tracking via `totalDividendsDistributed`

---

## System Architecture Summary

### Contract Responsibilities

| Contract | Primary Responsibility | Key Pattern |
|----------|------------------------|-------------|
| **AccessControl** | Authorization & Compliance | Role-Based Access Control |
| **OwnershipRegistry** | Cross-Contract Tracking | Authorized Updater Pattern |
| **PropertyFactory** | Property Lifecycle Management | Factory Pattern |
| **PropertyToken** | Token Operations & Dividends | ERC20 + Extensions |
| **Marketplace** | Secondary Trading | Order Book Pattern |

### Security Mechanisms

1. **ReentrancyGuard**: All payable functions protected
2. **Role-Based Access**: Three-tier hierarchy (Owner > Admin > Property Manager)
3. **KYC Gating**: All token transfers require recipient verification
4. **Emergency Pause**: System-wide halt capability
5. **Admin Override**: Emergency transfer capability with event logging
6. **Transfer Restrictions**: Per-user transfer restrictions for compliance
7. **Authorized Updaters**: Registry only accepts updates from verified contracts

### Event Architecture

All state-changing operations emit events for:
- Frontend real-time updates
- Transaction indexing
- Audit trails
- Analytics

Key events:
- `PropertyCreated`, `TokensDistributed`, `TokensPurchased`
- `Transfer` (ERC20), `DividendsDistributed`, `DividendsClaimed`
- `ListingCreated`, `OfferCreated`, `OfferAccepted`
- `KYCStatusUpdated`, `SystemPauseStatusChanged`

### Deployment Information

**Network**: Hedera Testnet (Chain ID: 296)
**RPC**: https://testnet.hashio.io/api
**Explorer**: https://hashscan.io/testnet

**Deployed Contracts**:
- AccessControl: `0xDDAE60c136ea61552c1e6acF3c7Ab8beBd02eF69`
- OwnershipRegistry: `0x4Eb9F441eA43141572BC49a4e8Fdf53f44B5C99C`
- PropertyFactory: `0x366e65Ca8645086478454c89C3616Ba0bAf15A35`
- Marketplace: `0x74347e6046819f6cbc64eb301746c7AaDA614Dec`

**Note**: PropertyToken contracts are deployed dynamically per property by PropertyFactory.

---

## Design Principles

1. **Separation of Concerns**: Each contract has a single, well-defined responsibility
2. **Modularity**: Contracts interact via interfaces, not tight coupling
3. **Upgradability Consideration**: While not upgradeable, architecture supports future proxy patterns
4. **Gas Optimization**: Efficient storage patterns, minimal cross-contract calls
5. **Security First**: Multiple layers of validation and access control
6. **Event-Driven**: Comprehensive event emissions for off-chain indexing
7. **Compliance Ready**: KYC gating and role management for regulatory requirements

---

**Document Version**: 1.0
**Last Updated**: October 31, 2025
**Solidity Version**: 0.8.19
**Framework**: Foundry
