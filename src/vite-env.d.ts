/// <reference types="vite/client" />

declare module '@/lib/utils' {
  export function cn(...inputs: any[]): string
  export function formatCurrency(amount: number, currency?: string): string
  export function formatPercentage(value: number, decimals?: number): string
  export function formatNumber(value: number, decimals?: number): string
  export function getStatusColor(status: string): string
}

declare module '@/components/ui/*' {
  const component: any
  export default component
}