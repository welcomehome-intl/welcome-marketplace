"use client"

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../config'
import { PROPERTY_TOKEN_ABI, GOVERNANCE_ABI } from '../abi'
import { Address } from 'viem'

export function useVotingPower(address?: Address) {
  const { data: votingPower } = useReadContract({
    address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'getVotes',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: delegatedTo } = useReadContract({
    address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'delegates',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return {
    votingPower,
    delegatedTo,
    isDelegated: delegatedTo !== address,
  }
}

export function useDelegate() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const delegate = (delegatee: Address) => {
    writeContract({
      address: CONTRACT_ADDRESSES.PROPERTY_TOKEN as Address,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'delegate',
      args: [delegatee],
    })
  }

  return {
    delegate,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

export function useProposal(proposalId?: bigint) {
  const { data: proposalState } = useReadContract({
    address: CONTRACT_ADDRESSES.GOVERNANCE as Address,
    abi: GOVERNANCE_ABI,
    functionName: 'state',
    args: proposalId ? [proposalId] : undefined,
    query: {
      enabled: !!proposalId,
    },
  })

  const getProposalStateText = (state?: number) => {
    if (state === undefined) return 'Unknown'

    const states = [
      'Pending',
      'Active',
      'Canceled',
      'Defeated',
      'Succeeded',
      'Queued',
      'Expired',
      'Executed'
    ]

    return states[state] || 'Unknown'
  }

  return {
    proposalState,
    proposalStateText: getProposalStateText(proposalState),
  }
}

export function useCreateProposal() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const createProposal = (
    targets: Address[],
    values: bigint[],
    calldatas: `0x${string}`[],
    description: string
  ) => {
    writeContract({
      address: CONTRACT_ADDRESSES.GOVERNANCE as Address,
      abi: GOVERNANCE_ABI,
      functionName: 'propose',
      args: [targets, values, calldatas, description],
    })
  }

  return {
    createProposal,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

export function useVoteOnProposal() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const vote = (proposalId: bigint, support: number) => {
    writeContract({
      address: CONTRACT_ADDRESSES.GOVERNANCE as Address,
      abi: GOVERNANCE_ABI,
      functionName: 'castVote',
      args: [proposalId, support],
    })
  }

  const voteFor = (proposalId: bigint) => vote(proposalId, 1)
  const voteAgainst = (proposalId: bigint) => vote(proposalId, 0)
  const abstain = (proposalId: bigint) => vote(proposalId, 2)

  return {
    vote,
    voteFor,
    voteAgainst,
    abstain,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}