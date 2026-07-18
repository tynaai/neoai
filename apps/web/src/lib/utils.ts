import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const vndFormatter = new Intl.NumberFormat('vi-VN')

/** Format a VND amount, e.g. 10990000 -> "10.990.000đ". */
export function formatVnd(amount: number) {
  return `${vndFormatter.format(amount)}đ`
}

/** Compact VND for tight spaces, e.g. 10990000 -> "10,99 triệu". */
export function formatVndShort(amount: number) {
  const millions = amount / 1_000_000
  const rounded = Math.round(millions * 100) / 100
  return `${vndFormatter.format(rounded)} triệu`
}
