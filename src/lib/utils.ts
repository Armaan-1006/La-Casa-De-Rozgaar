import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatPercentage(num: number): string {
  return num.toFixed(1) + '%'
}

export function formatCurrency(amount: string): string {
  return amount
}

export function getMatchColor(score: number): string {
  if (score >= 85) return 'text-emerald-400'
  if (score >= 70) return 'text-yellow-400'
  return 'text-orange-400'
}

export function getMatchBgColor(score: number): string {
  if (score >= 85) return 'bg-emerald-400/20 border-emerald-400/30'
  if (score >= 70) return 'bg-yellow-400/20 border-yellow-400/30'
  return 'bg-orange-400/20 border-orange-400/30'
}

export function getTrendColor(trend: string): string {
  if (trend.startsWith('+')) return 'text-emerald-400'
  if (trend.startsWith('-')) return 'text-red-400'
  return 'text-warm-ivory/60'
}

export function getTrendIcon(trend: string): string {
  if (trend.startsWith('+')) return '↑'
  if (trend.startsWith('-')) return '↓'
  return '→'
}
