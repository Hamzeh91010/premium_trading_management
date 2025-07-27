import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'running':
    case 'active':
    case 'online':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'stopped':
    case 'inactive':
    case 'offline':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'error':
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'warning':
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200'
  }
}