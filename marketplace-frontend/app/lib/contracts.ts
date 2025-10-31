import { SmartContractConfig } from '../types/web3'

// Smart contract configuration for Hedera Mainnet
export const HEDERA_MAINNET_CONFIG: SmartContractConfig = {
  propertyFactory: '0x0000000000000000000000000000000000000000', // MinimalPropertyFactory - To be deployed
  marketplace: '0x0000000000000000000000000000000000000000', // PropertyTokenHandler - To be deployed
  ownershipRegistry: '0x0000000000000000000000000000000000000000', // OwnershipRegistry - To be deployed
  kycRegistry: '0x0000000000000000000000000000000000000000', // MockKYCRegistry - To be deployed
  chainId: 295, // Hedera Mainnet chain ID
  rpcUrl: 'https://mainnet.hashio.io/api',
  blockExplorer: 'https://hashscan.io/mainnet',
}

// Testnet configuration (Hedera Testnet for development)
export const HEDERA_TESTNET_CONFIG: SmartContractConfig = {
  propertyFactory: '0x710d1E7F345CA3D893511743A00De2cFC1eAb6De', // MinimalPropertyFactory
  marketplace: '0x71d91F4Ad42aa2f1A118dE372247630D8C3f30cb', // PropertyTokenHandler (includes marketplace)
  ownershipRegistry: '0xEfD59aEdf9f5B2441e161190c6C3E1FB2F8FD21b', // OwnershipRegistry
  kycRegistry: '0xeec63827760aA3d4C1eEC16a9BCFC06D2F15ecad', // MockKYCRegistry
  chainId: 296, // Hedera Testnet chain ID
  rpcUrl: 'https://testnet.hashio.io/api',
  blockExplorer: 'https://hashscan.io/testnet',
}

// Get current network configuration
export function getNetworkConfig(): SmartContractConfig {
  const isMainnet = process.env.NEXT_PUBLIC_HEDERA_NETWORK === 'mainnet'
  return isMainnet ? HEDERA_MAINNET_CONFIG : HEDERA_TESTNET_CONFIG
}

// Smart contract ABIs for frontend integration
export const PROPERTY_FACTORY_ABI = [
  // MinimalPropertyFactory key functions
  'function propertyCount() view returns (uint256)',
  'function propertyCreationFee() view returns (uint256)',
  'function feeCollector() view returns (address)',
  'function getProperty(uint256 propertyId) view returns (tuple(address,address,string,string,string,uint256,uint256,address,uint256,bool,uint8,string))',
  'function getActiveProperties() view returns (tuple(address,address,string,string,string,uint256,uint256,address,uint256,bool,uint8,string)[])',
  'function getCreatorProperties(address creator) view returns (uint256[])',
  'function registerProperty(address,address,string,string,string,uint256,uint256,uint8,string) payable',
  'event PropertyRegistered(uint256 indexed propertyId, address indexed tokenContract, address indexed handlerContract, string name, address creator)'
]

export const MARKETPLACE_ABI = [
  // PropertyTokenHandler marketplace functions
  'function purchaseTokens(uint256 tokenAmount) external',
  'function listTokensForSale(uint256 amount, uint256 pricePerToken) external',
  'function purchaseFromMarketplace(uint256 listingId, uint256 amount) external',
  'function configureSale(uint256,uint256,uint256,uint256) external',
  'function setAccreditedInvestor(address investor, bool status) external',
  'function accreditedInvestors(address) view returns (bool)',
  'function currentSale() view returns (tuple(uint256,uint256,uint256,bool,uint256,uint256,uint256,uint256))',
  'function marketplaceListings(uint256) view returns (tuple(address,uint256,uint256,uint256,bool,uint256,address))',
  'function nextListingId() view returns (uint256)',
  'function stakeTokens(uint256 amount) external',
  'function unstakeTokens(uint256 amount) external',
  'function calculateStakingRewards(address user) view returns (uint256)',
  'function distributeRevenue(uint256 revenueAmount) external',
  'function claimRevenue() external',
  'function getClaimableRevenue(address user) view returns (uint256)',
  'event TokensPurchased(address indexed buyer, uint256 amount, uint256 totalCost)',
  'event TokensListed(uint256 indexed listingId, address indexed seller, uint256 amount, uint256 pricePerToken)'
]

export const OWNERSHIP_REGISTRY_ABI = [
  // OwnershipRegistry key functions
  'function registerProperty(uint256 propertyId, address tokenContract, address handlerContract) external',
  'function updateOwnership(address user, uint256 propertyId, uint256 newBalance) external',
  'function getUserOwnership(address user, uint256 propertyId) view returns (tuple(address,uint256,uint256,uint256,bool))',
  'function getUserPortfolio(address user) view returns (tuple(uint256[],uint256,uint256,uint256,uint256))',
  'function getUserProperties(address user) view returns (uint256[])',
  'function getPropertyHolders(uint256 propertyId) view returns (address[])',
  'function getPropertyStats(uint256 propertyId) view returns (tuple(address,address,uint256,uint256,uint256,uint256,bool))',
  'function getGlobalStats() view returns (uint256,uint256,uint256)',
  'function ownsProperty(address user, uint256 propertyId) view returns (bool)',
  'function getUserBalance(address user, uint256 propertyId) view returns (uint256)',
  'event OwnershipUpdated(address indexed user, uint256 indexed propertyId, address indexed tokenContract, uint256 newBalance, uint256 oldBalance)'
]

export const KYC_REGISTRY_ABI = [
  // MockKYCRegistry functions
  'function submitKYC(string documentHash, uint8 investorType) external',
  'function approveKYC(address user) external',
  'function denyKYC(address user, string reason) external',
  'function isKYCApproved(address user) view returns (bool)',
  'function isAccreditedInvestor(address user) view returns (bool)',
  'function getKYCRecord(address user) view returns (tuple(uint8,uint8,uint256,uint256,address,string,string,uint256,bool))',
  'function getKYCStatus(address user) view returns (uint8)',
  'function getPendingApplications() view returns (address[])',
  'function getApprovedUsers() view returns (address[])',
  'function setAccreditedInvestor(address user, bool status) external',
  'function batchApprove(address[] users, uint8[] investorTypes) external',
  'event KYCSubmitted(address indexed user, string documentHash, uint256 submittedAt)',
  'event KYCApproved(address indexed user, uint8 investorType, address approvedBy, uint256 expiresAt)',
  'event KYCDenied(address indexed user, string reason, address reviewedBy)'
]

// ERC-20 token ABI for property tokens
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
]

// Helper functions for contract interaction
export function getContractAddress(contractName: keyof SmartContractConfig): string {
  const config = getNetworkConfig()
  return config[contractName] as string
}

export function getExplorerUrl(hash: string, type: 'tx' | 'address' = 'tx'): string {
  const config = getNetworkConfig()
  return `${config.blockExplorer}/${type}/${hash}`
}