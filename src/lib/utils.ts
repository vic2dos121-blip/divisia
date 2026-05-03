import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'EUR', decimals = 0): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export function formatRate(rate: number): string {
  return rate.toFixed(4)
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'dd/MM/yyyy', { locale: es })
}

export function formatDateShort(date: Date | string): string {
  return format(new Date(date), 'dd MMM yy', { locale: es })
}

export const INSTRUMENT_LABELS: Record<string, string> = {
  TARF_EKI: 'TARF con EKI',
  GEARED_FORWARD: 'Geared Forward',
  ACCUMULATOR: 'Accumulator',
  FORWARD: 'Forward',
  OPTION: 'Opción',
  SWAP: 'Swap',
  OTHER: 'Otro',
}

export const INSTRUMENT_COLORS: Record<string, string> = {
  TARF_EKI: 'bg-purple-100 text-purple-800',
  GEARED_FORWARD: 'bg-blue-100 text-blue-800',
  ACCUMULATOR: 'bg-orange-100 text-orange-800',
  FORWARD: 'bg-green-100 text-green-800',
  OPTION: 'bg-yellow-100 text-yellow-800',
  SWAP: 'bg-cyan-100 text-cyan-800',
  OTHER: 'bg-gray-100 text-gray-800',
}

export const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  closed: 'Cerrado',
  knocked_out: 'Knock-out',
  target_reached: 'Target alcanzado',
  expired: 'Vencido',
}

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  knocked_out: 'bg-red-100 text-red-800',
  target_reached: 'bg-blue-100 text-blue-800',
  expired: 'bg-gray-100 text-gray-600',
}

export const FIXING_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  exercised: 'Ejercido',
  not_exercised: 'No ejercido',
  leveraged: 'Apalancado',
  skipped: 'Saltado',
  knocked_out: 'Knock-out',
}

export const FIXING_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  exercised: 'bg-green-100 text-green-800',
  not_exercised: 'bg-gray-100 text-gray-600',
  leveraged: 'bg-orange-100 text-orange-800',
  skipped: 'bg-gray-100 text-gray-400',
  knocked_out: 'bg-red-100 text-red-800',
}
