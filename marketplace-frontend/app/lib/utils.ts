import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatHbar(amount: number | string | bigint): string {
  const numAmount = typeof amount === 'bigint' ? Number(amount) / 100000000 : Number(amount) / 100000000
  return `${numAmount.toLocaleString()} HBAR`
}

export function formatTokens(amount: number | string | bigint, symbol: string = 'tokens'): string {
  const numAmount = typeof amount === 'bigint' ? Number(amount) : Number(amount)
  return `${numAmount.toLocaleString()} ${symbol}`
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}