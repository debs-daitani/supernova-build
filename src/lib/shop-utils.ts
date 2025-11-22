// Shop utility functions

import { PLATFORM_FEES, PAYOUT_SETTINGS } from './shop-config'

// Generate slug from product name
export function generateProductSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

// Make slug unique
export function makeUniqueProductSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug
  let counter = 1

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

// Calculate platform fee
export function calculatePlatformFee(amount: number, tier: 'BOLD' | 'BADASS'): number {
  const feeRate = PLATFORM_FEES[tier] || 0
  return amount * feeRate
}

// Calculate seller payout (total - platform fee)
export function calculateSellerPayout(amount: number, tier: 'BOLD' | 'BADASS'): number {
  const fee = calculatePlatformFee(amount, tier)
  return amount - fee
}

// Check if funds are cleared (available for payout)
export function areFundsCleared(saleDate: Date): boolean {
  const clearanceDate = new Date(saleDate)
  clearanceDate.setDate(clearanceDate.getDate() + PAYOUT_SETTINGS.CLEARANCE_DAYS)
  return new Date() >= clearanceDate
}

// Calculate available balance (cleared funds)
export function calculateAvailableBalance(sales: { amount: number; date: Date }[]): number {
  return sales
    .filter((sale) => areFundsCleared(sale.date))
    .reduce((sum, sale) => sum + sale.amount, 0)
}

// Calculate pending balance (not yet cleared)
export function calculatePendingBalance(sales: { amount: number; date: Date }[]): number {
  return sales
    .filter((sale) => !areFundsCleared(sale.date))
    .reduce((sum, sale) => sum + sale.amount, 0)
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'GBP'): string {
  const symbols: { [key: string]: string } = {
    GBP: '£',
    USD: '$',
    EUR: '€',
  }

  return `${symbols[currency] || currency} ${amount.toFixed(2)}`
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Calculate discount amount
export function calculateDiscount(
  subtotal: number,
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT',
  discountValue: number
): number {
  if (discountType === 'PERCENTAGE') {
    return subtotal * (discountValue / 100)
  }
  return Math.min(discountValue, subtotal)
}

// Apply coupon to cart
export function applyCoupon(
  subtotal: number,
  coupon: {
    discountType: string
    discountValue: number
    minPurchaseAmount?: number
  }
): { discount: number; total: number; error?: string } {
  // Check minimum purchase amount
  if (coupon.minPurchaseAmount && subtotal < coupon.minPurchaseAmount) {
    return {
      discount: 0,
      total: subtotal,
      error: `Minimum purchase of ${formatCurrency(coupon.minPurchaseAmount)} required`,
    }
  }

  const discount = calculateDiscount(
    subtotal,
    coupon.discountType as 'PERCENTAGE' | 'FIXED_AMOUNT',
    coupon.discountValue
  )

  return {
    discount,
    total: subtotal - discount,
  }
}

// Validate coupon code
export function validateCoupon(coupon: {
  code: string
  isActive: boolean
  expiresAt?: Date | null
  maxUses?: number | null
  usedCount: number
}): { valid: boolean; error?: string } {
  if (!coupon.isActive) {
    return { valid: false, error: 'Coupon is not active' }
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, error: 'Coupon has expired' }
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: 'Coupon has reached maximum uses' }
  }

  return { valid: true }
}

// Generate download URL with expiry
export function generateDownloadUrl(productId: string, orderId: string): string {
  // In production, use signed URLs with cloud storage
  const expiryTime = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  const token = Buffer.from(`${productId}:${orderId}:${expiryTime}`).toString('base64url')
  return `/api/shop/download/${token}`
}

// Validate download token
export function validateDownloadToken(token: string): {
  valid: boolean
  productId?: string
  orderId?: string
  error?: string
} {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const [productId, orderId, expiryTime] = decoded.split(':')

    if (Date.now() > parseInt(expiryTime)) {
      return { valid: false, error: 'Download link has expired' }
    }

    return { valid: true, productId, orderId }
  } catch (error) {
    return { valid: false, error: 'Invalid download token' }
  }
}

// Calculate cart total
export function calculateCartTotal(
  items: { price: number; quantity: number }[]
): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// Validate product price
export function validatePrice(price: number): { valid: boolean; error?: string } {
  if (price < 0) {
    return { valid: false, error: 'Price cannot be negative' }
  }

  if (price > 999999) {
    return { valid: false, error: 'Price is too high' }
  }

  return { valid: true }
}

// Calculate average rating
export function calculateAverageRating(
  reviews: { rating: number }[]
): { average: number; count: number } {
  if (reviews.length === 0) {
    return { average: 0, count: 0 }
  }

  const sum = reviews.reduce((total, review) => total + review.rating, 0)
  return {
    average: sum / reviews.length,
    count: reviews.length,
  }
}

// Format rating display
export function formatRating(rating: number): string {
  return `${rating.toFixed(1)} ⭐`
}

// Generate SKU
export function generateSKU(productName: string, variantName?: string): string {
  const base = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 6)

  const variant = variantName
    ? variantName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 3)
    : ''

  const random = Math.random().toString(36).substring(2, 6).toUpperCase()

  return `${base}${variant}${random}`
}

// Check if user can download
export function canDownload(
  downloadCount: number,
  maxDownloads: number,
  expiresAt: Date | null
): { allowed: boolean; error?: string } {
  if (expiresAt && new Date(expiresAt) < new Date()) {
    return { allowed: false, error: 'Download link has expired' }
  }

  if (downloadCount >= maxDownloads) {
    return { allowed: false, error: 'Maximum downloads reached' }
  }

  return { allowed: true }
}

// Calculate sales tax (placeholder - implement based on location)
export function calculateTax(amount: number, taxRate: number = 0): number {
  return amount * taxRate
}

// Get currency symbol
export function getCurrencySymbol(currency: string): string {
  const symbols: { [key: string]: string } = {
    GBP: '£',
    USD: '$',
    EUR: '€',
  }
  return symbols[currency] || currency
}

// Validate email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Generate order number
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${timestamp}-${random}`
}
