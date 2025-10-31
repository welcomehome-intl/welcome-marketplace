export interface Property {
  id: string
  name: string
  location: string
  description: string
  totalSupply: number
  pricePerToken: number
  currentPrice: number
  imageUrl: string
  metadataUri: string
  contractAddress: string
  tokenStandard: 'ERC-20' | 'ERC-721' | 'ERC-1155'
  isActive: boolean
  createdAt: Date
}

export interface PropertyToken {
  propertyId: string
  tokenId?: string
  amount: number
  currentValue: number
  purchasePrice: number
  purchaseDate: Date
  returns: number
  returnsPercentage: number
}

export interface Transaction {
  id: string
  hash: string
  propertyId: string
  propertyName: string
  type: 'buy' | 'sell' | 'transfer'
  amount: number
  tokenAmount: number
  pricePerToken: number
  from: string
  to: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: Date
  blockNumber?: number
  gasUsed?: number
  gasFee?: number
}

export interface UserPortfolio {
  totalBalance: number
  totalInvested: number
  totalReturns: number
  returnsPercentage: number
  properties: PropertyToken[]
  totalSquareMeters: number
}

export interface KYCStatus {
  isVerified: boolean
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  verificationDate?: Date
  provider: string
  nftTokenId?: string
}

export interface WalletState {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  chainId: number | null
  balance: number
  provider: any
}

export interface SmartContractConfig {
  propertyFactory: string
  marketplace: string
  ownershipRegistry: string
  kycRegistry: string
  chainId: number
  rpcUrl: string
  blockExplorer: string
}