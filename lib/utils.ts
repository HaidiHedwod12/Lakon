import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely format numbers to prevent hydration errors
 * Uses Indonesian locale format (1.234) consistently
 */
export function formatNumber(value: number, isClient: boolean = false): string {
  if (isClient) {
    return value.toLocaleString('id-ID')
  }
  return value.toString()
}

/**
 * Format currency in Indonesian Rupiah
 */
export function formatCurrency(value: number, isClient: boolean = false): string {
  if (isClient) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }
  return `Rp ${value.toString()}`
}
