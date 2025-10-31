"use client"

import { useState, useEffect, useCallback } from 'react'
import { usePublicClient, useWalletClient, useAccount } from 'wagmi'
import { Address, formatUnits } from 'viem'
import { CONTRACT_ADDRESSES } from '../config'
import { logError } from '../error-utils'

// Property Governance ABI
const PROPERTY_GOVERNANCE_ABI = [
  {
    "inputs": [],
    "name": "proposalCount",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256"}],
    "name": "proposals",
    "outputs": [
      {"type": "uint256", "name": "id"},
      {"type": "uint256", "name": "propertyId"},
      {"type": "address", "name": "proposer"},
      {"type": "string", "name": "title"},
      {"type": "string", "name": "description"},
      {"type": "string", "name": "ipfsHash"},
      {"type": "uint8", "name": "proposalType"},
      {"type": "uint8", "name": "status"},
      {"type": "uint256", "name": "forVotes"},
      {"type": "uint256", "name": "againstVotes"},
      {"type": "uint256", "name": "abstainVotes"},
      {"type": "uint256", "name": "totalVotes"},
      {"type": "uint256", "name": "startTime"},
      {"type": "uint256", "name": "endTime"},
      {"type": "uint256", "name": "quorumRequired"},
      {"type": "uint256", "name": "majorityRequired"},
      {"type": "bool", "name": "executed"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256"}],
    "name": "getProposal",
    "outputs": [
      {"type": "uint256", "name": "id"},
      {"type": "uint256", "name": "propertyId"},
      {"type": "address", "name": "proposer"},
      {"type": "string", "name": "title"},
      {"type": "string", "name": "description"},
      {"type": "string", "name": "ipfsHash"},
      {"type": "uint8", "name": "proposalType"},
      {"type": "uint8", "name": "status"},
      {"type": "uint256", "name": "forVotes"},
      {"type": "uint256", "name": "againstVotes"},
      {"type": "uint256", "name": "abstainVotes"},
      {"type": "uint256", "name": "totalVotes"},
      {"type": "uint256", "name": "startTime"},
      {"type": "uint256", "name": "endTime"},
      {"type": "uint256", "name": "quorumRequired"},
      {"type": "uint256", "name": "majorityRequired"},
      {"type": "bool", "name": "executed"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256"}],
    "name": "getPropertyProposals",
    "outputs": [{"type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256"}],
    "name": "getActiveProposals",
    "outputs": [{"type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"type": "uint256", "name": "propertyId"},
      {"type": "string", "name": "title"},
      {"type": "string", "name": "description"},
      {"type": "string", "name": "ipfsHash"},
      {"type": "uint8", "name": "proposalType"}
    ],
    "name": "createProposal",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"type": "uint256", "name": "proposalId"},
      {"type": "uint8", "name": "support"}
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256"}],
    "name": "executeProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"type": "uint256", "name": "proposalId"},
      {"type": "address", "name": "voter"}
    ],
    "name": "getVoterInfo",
    "outputs": [
      {"type": "bool", "name": "hasVoted"},
      {"type": "uint8", "name": "support"},
      {"type": "uint256", "name": "votes"},
      {"type": "uint256", "name": "timestamp"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export enum ProposalType {
  MAINTENANCE = 0,
  IMPROVEMENT = 1,
  REFINANCE = 2,
  SALE = 3,
  MANAGEMENT = 4,
  DIVIDEND = 5,
  OTHER = 6
}

export enum ProposalStatus {
  PENDING = 0,
  ACTIVE = 1,
  SUCCEEDED = 2,
  DEFEATED = 3,
  EXECUTED = 4,
  EXPIRED = 5
}

export enum VoteSupport {
  AGAINST = 0,
  FOR = 1,
  ABSTAIN = 2
}

export interface Proposal {
  id: number
  propertyId: number
  proposer: Address
  title: string
  description: string
  ipfsHash: string
  proposalType: ProposalType
  status: ProposalStatus
  forVotes: bigint
  againstVotes: bigint
  abstainVotes: bigint
  totalVotes: bigint
  startTime: bigint
  endTime: bigint
  quorumRequired: bigint
  majorityRequired: bigint
  executed: boolean
}

export interface VoterInfo {
  hasVoted: boolean
  support: VoteSupport
  votes: bigint
  timestamp: bigint
}

export function usePropertyGovernance() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [proposalCount, setProposalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()

  // Fetch all proposals
  const fetchProposals = useCallback(async () => {
    if (!publicClient) return

    setIsLoading(true)
    setError(null)

    try {
      const governanceAddress = CONTRACT_ADDRESSES.PROPERTY_GOVERNANCE as Address
      if (!governanceAddress || governanceAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('Property Governance contract not deployed yet')
      }

      // Get total proposal count
      const count = await publicClient.readContract({
        address: governanceAddress,
        abi: PROPERTY_GOVERNANCE_ABI,
        functionName: 'proposalCount',
      }) as bigint

      const totalCount = Number(count)
      setProposalCount(totalCount)

      if (totalCount === 0) {
        setProposals([])
        return
      }

      // Fetch all proposals
      const allProposals: Proposal[] = []

      for (let i = 0; i < totalCount; i++) {
        try {
          const proposal = await publicClient.readContract({
            address: governanceAddress,
            abi: PROPERTY_GOVERNANCE_ABI,
            functionName: 'getProposal',
            args: [BigInt(i)],
          }) as any

          allProposals.push({
            id: Number(proposal[0]),
            propertyId: Number(proposal[1]),
            proposer: proposal[2],
            title: proposal[3],
            description: proposal[4],
            ipfsHash: proposal[5],
            proposalType: proposal[6],
            status: proposal[7],
            forVotes: proposal[8],
            againstVotes: proposal[9],
            abstainVotes: proposal[10],
            totalVotes: proposal[11],
            startTime: proposal[12],
            endTime: proposal[13],
            quorumRequired: proposal[14],
            majorityRequired: proposal[15],
            executed: proposal[16],
          })
        } catch (proposalError) {
          console.warn(`Failed to fetch proposal ${i}:`, proposalError)
        }
      }

      setProposals(allProposals)

    } catch (err) {
      logError('Error fetching proposals', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch proposals')
    } finally {
      setIsLoading(false)
    }
  }, [publicClient])

  // Get proposals for specific property
  const getPropertyProposals = useCallback(async (propertyId: number): Promise<Proposal[]> => {
    if (!publicClient) return []

    try {
      const governanceAddress = CONTRACT_ADDRESSES.PROPERTY_GOVERNANCE as Address
      if (!governanceAddress) return []

      const proposalIds = await publicClient.readContract({
        address: governanceAddress,
        abi: PROPERTY_GOVERNANCE_ABI,
        functionName: 'getPropertyProposals',
        args: [BigInt(propertyId)],
      }) as bigint[]

      const propertyProposals: Proposal[] = []

      for (const proposalId of proposalIds) {
        try {
          const proposal = await publicClient.readContract({
            address: governanceAddress,
            abi: PROPERTY_GOVERNANCE_ABI,
            functionName: 'getProposal',
            args: [proposalId],
          }) as any

          propertyProposals.push({
            id: Number(proposal[0]),
            propertyId: Number(proposal[1]),
            proposer: proposal[2],
            title: proposal[3],
            description: proposal[4],
            ipfsHash: proposal[5],
            proposalType: proposal[6],
            status: proposal[7],
            forVotes: proposal[8],
            againstVotes: proposal[9],
            abstainVotes: proposal[10],
            totalVotes: proposal[11],
            startTime: proposal[12],
            endTime: proposal[13],
            quorumRequired: proposal[14],
            majorityRequired: proposal[15],
            executed: proposal[16],
          })
        } catch (err) {
          console.warn(`Failed to fetch proposal ${proposalId}:`, err)
        }
      }

      return propertyProposals
    } catch (err) {
      logError('Error fetching property proposals', err)
      return []
    }
  }, [publicClient])

  // Create new proposal
  const createProposal = useCallback(async (
    propertyId: number,
    title: string,
    description: string,
    ipfsHash: string,
    proposalType: ProposalType
  ) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected')
    }

    try {
      const governanceAddress = CONTRACT_ADDRESSES.PROPERTY_GOVERNANCE as Address
      if (!governanceAddress) {
        throw new Error('Property Governance contract not deployed')
      }

      const tx = await walletClient.writeContract({
        address: governanceAddress,
        abi: PROPERTY_GOVERNANCE_ABI,
        functionName: 'createProposal',
        args: [
          BigInt(propertyId),
          title,
          description,
          ipfsHash,
          proposalType
        ],
      })

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: tx })
      }

      // Refresh proposals
      await fetchProposals()

      return tx
    } catch (err) {
      logError('Error creating proposal', err)
      throw err
    }
  }, [walletClient, address, publicClient, fetchProposals])

  // Vote on proposal
  const vote = useCallback(async (proposalId: number, support: VoteSupport) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected')
    }

    try {
      const governanceAddress = CONTRACT_ADDRESSES.PROPERTY_GOVERNANCE as Address
      if (!governanceAddress) {
        throw new Error('Property Governance contract not deployed')
      }

      const tx = await walletClient.writeContract({
        address: governanceAddress,
        abi: PROPERTY_GOVERNANCE_ABI,
        functionName: 'vote',
        args: [BigInt(proposalId), support],
      })

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: tx })
      }

      // Refresh proposals
      await fetchProposals()

      return tx
    } catch (err) {
      logError('Error voting on proposal', err)
      throw err
    }
  }, [walletClient, address, publicClient, fetchProposals])

  // Execute proposal
  const executeProposal = useCallback(async (proposalId: number) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected')
    }

    try {
      const governanceAddress = CONTRACT_ADDRESSES.PROPERTY_GOVERNANCE as Address
      if (!governanceAddress) {
        throw new Error('Property Governance contract not deployed')
      }

      const tx = await walletClient.writeContract({
        address: governanceAddress,
        abi: PROPERTY_GOVERNANCE_ABI,
        functionName: 'executeProposal',
        args: [BigInt(proposalId)],
      })

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: tx })
      }

      // Refresh proposals
      await fetchProposals()

      return tx
    } catch (err) {
      logError('Error executing proposal', err)
      throw err
    }
  }, [walletClient, address, publicClient, fetchProposals])

  // Get voter information for a proposal
  const getVoterInfo = useCallback(async (proposalId: number, voterAddress?: Address): Promise<VoterInfo | null> => {
    if (!publicClient) return null

    const voter = voterAddress || address
    if (!voter) return null

    try {
      const governanceAddress = CONTRACT_ADDRESSES.PROPERTY_GOVERNANCE as Address
      if (!governanceAddress) return null

      const voterInfo = await publicClient.readContract({
        address: governanceAddress,
        abi: PROPERTY_GOVERNANCE_ABI,
        functionName: 'getVoterInfo',
        args: [BigInt(proposalId), voter],
      }) as [boolean, number, bigint, bigint]

      return {
        hasVoted: voterInfo[0],
        support: voterInfo[1],
        votes: voterInfo[2],
        timestamp: voterInfo[3],
      }
    } catch (err) {
      logError('Error fetching voter info', err)
      return null
    }
  }, [publicClient, address])

  // Get active proposals for property
  const getActiveProposals = useCallback(async (propertyId: number): Promise<Proposal[]> => {
    if (!publicClient) return []

    try {
      const governanceAddress = CONTRACT_ADDRESSES.PROPERTY_GOVERNANCE as Address
      if (!governanceAddress) return []

      const activeProposalIds = await publicClient.readContract({
        address: governanceAddress,
        abi: PROPERTY_GOVERNANCE_ABI,
        functionName: 'getActiveProposals',
        args: [BigInt(propertyId)],
      }) as bigint[]

      const activeProposals: Proposal[] = []

      for (const proposalId of activeProposalIds) {
        try {
          const proposal = await publicClient.readContract({
            address: governanceAddress,
            abi: PROPERTY_GOVERNANCE_ABI,
            functionName: 'getProposal',
            args: [proposalId],
          }) as any

          activeProposals.push({
            id: Number(proposal[0]),
            propertyId: Number(proposal[1]),
            proposer: proposal[2],
            title: proposal[3],
            description: proposal[4],
            ipfsHash: proposal[5],
            proposalType: proposal[6],
            status: proposal[7],
            forVotes: proposal[8],
            againstVotes: proposal[9],
            abstainVotes: proposal[10],
            totalVotes: proposal[11],
            startTime: proposal[12],
            endTime: proposal[13],
            quorumRequired: proposal[14],
            majorityRequired: proposal[15],
            executed: proposal[16],
          })
        } catch (err) {
          console.warn(`Failed to fetch active proposal ${proposalId}:`, err)
        }
      }

      return activeProposals
    } catch (err) {
      logError('Error fetching active proposals', err)
      return []
    }
  }, [publicClient])

  // Initialize
  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  return {
    proposals,
    proposalCount,
    isLoading,
    error,
    fetchProposals,
    getPropertyProposals,
    getActiveProposals,
    createProposal,
    vote,
    executeProposal,
    getVoterInfo,
    // Helper functions
    getProposalTypeLabel: (type: ProposalType) => {
      const labels = {
        [ProposalType.MAINTENANCE]: 'Maintenance',
        [ProposalType.IMPROVEMENT]: 'Improvement',
        [ProposalType.REFINANCE]: 'Refinance',
        [ProposalType.SALE]: 'Sale',
        [ProposalType.MANAGEMENT]: 'Management',
        [ProposalType.DIVIDEND]: 'Dividend',
        [ProposalType.OTHER]: 'Other'
      }
      return labels[type] || 'Unknown'
    },
    getProposalStatusLabel: (status: ProposalStatus) => {
      const labels = {
        [ProposalStatus.PENDING]: 'Pending',
        [ProposalStatus.ACTIVE]: 'Active',
        [ProposalStatus.SUCCEEDED]: 'Succeeded',
        [ProposalStatus.DEFEATED]: 'Defeated',
        [ProposalStatus.EXECUTED]: 'Executed',
        [ProposalStatus.EXPIRED]: 'Expired'
      }
      return labels[status] || 'Unknown'
    }
  }
}