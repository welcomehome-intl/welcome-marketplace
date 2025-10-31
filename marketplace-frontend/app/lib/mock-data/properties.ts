import { parseEther, Address } from 'viem'

// Property types enum values (matches contract)
// RESIDENTIAL = 0, COMMERCIAL = 1, INDUSTRIAL = 2, MIXED_USE = 3, LAND = 4

export interface PropertyInfo {
  id: number
  tokenContract: Address
  handlerContract: Address
  name: string
  symbol: string
  ipfsHash: string
  totalValue: bigint
  maxTokens: bigint
  creator: Address
  createdAt: bigint
  isActive: boolean
  propertyType: number
  location: string
}

// Mock property data for demonstration
export const MOCK_PROPERTIES: PropertyInfo[] = [
  {
    id: 0,
    tokenContract: '0x1234567890123456789012345678901234567890' as Address,
    handlerContract: '0x2345678901234567890123456789012345678901' as Address,
    name: 'Luxury Villa Estate',
    symbol: 'LVILLA',
    ipfsHash: 'QmExample1',
    totalValue: parseEther('850000'),
    maxTokens: parseEther('10000'),
    creator: '0x3456789012345678901234567890123456789012' as Address,
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 30),
    isActive: true,
    propertyType: 0, // RESIDENTIAL
    location: 'Beverly Hills, California, USA'
  },
  {
    id: 1,
    tokenContract: '0x2345678901234567890123456789012345678902' as Address,
    handlerContract: '0x3456789012345678901234567890123456789013' as Address,
    name: 'Modern Downtown Apartment',
    symbol: 'MDAPT',
    ipfsHash: 'QmExample2',
    totalValue: parseEther('450000'),
    maxTokens: parseEther('5000'),
    creator: '0x4567890123456789012345678901234567890123' as Address,
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 25),
    isActive: true,
    propertyType: 0, // RESIDENTIAL
    location: 'Manhattan, New York, USA'
  },
  {
    id: 2,
    tokenContract: '0x3456789012345678901234567890123456789014' as Address,
    handlerContract: '0x4567890123456789012345678901234567890124' as Address,
    name: 'Oceanview Beach House',
    symbol: 'OCEAN',
    ipfsHash: 'QmExample3',
    totalValue: parseEther('1200000'),
    maxTokens: parseEther('15000'),
    creator: '0x5678901234567890123456789012345678901234' as Address,
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 20),
    isActive: true,
    propertyType: 0, // RESIDENTIAL
    location: 'Malibu, California, USA'
  },
  {
    id: 3,
    tokenContract: '0x4567890123456789012345678901234567890125' as Address,
    handlerContract: '0x5678901234567890123456789012345678901235' as Address,
    name: 'Commercial Plaza',
    symbol: 'CPLAZA',
    ipfsHash: 'QmExample4',
    totalValue: parseEther('2500000'),
    maxTokens: parseEther('25000'),
    creator: '0x6789012345678901234567890123456789012345' as Address,
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 15),
    isActive: true,
    propertyType: 1, // COMMERCIAL
    location: 'Downtown Los Angeles, California, USA'
  },
  {
    id: 4,
    tokenContract: '0x5678901234567890123456789012345678901236' as Address,
    handlerContract: '0x6789012345678901234567890123456789012346' as Address,
    name: 'Mountain Retreat Cabin',
    symbol: 'MOUNT',
    ipfsHash: 'QmExample5',
    totalValue: parseEther('380000'),
    maxTokens: parseEther('4000'),
    creator: '0x7890123456789012345678901234567890123456' as Address,
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 12),
    isActive: true,
    propertyType: 0, // RESIDENTIAL
    location: 'Aspen, Colorado, USA'
  },
  {
    id: 5,
    tokenContract: '0x6789012345678901234567890123456789012347' as Address,
    handlerContract: '0x7890123456789012345678901234567890123457' as Address,
    name: 'Urban Loft Complex',
    symbol: 'ULOFT',
    ipfsHash: 'QmExample6',
    totalValue: parseEther('680000'),
    maxTokens: parseEther('8000'),
    creator: '0x8901234567890123456789012345678901234567' as Address,
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 10),
    isActive: true,
    propertyType: 3, // MIXED_USE
    location: 'Seattle, Washington, USA'
  },
  {
    id: 6,
    tokenContract: '0x7890123456789012345678901234567890123458' as Address,
    handlerContract: '0x8901234567890123456789012345678901234568' as Address,
    name: 'Suburban Family Home',
    symbol: 'SFAM',
    ipfsHash: 'QmExample7',
    totalValue: parseEther('520000'),
    maxTokens: parseEther('6000'),
    creator: '0x9012345678901234567890123456789012345678' as Address,
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 8),
    isActive: true,
    propertyType: 0, // RESIDENTIAL
    location: 'Austin, Texas, USA'
  }
]
