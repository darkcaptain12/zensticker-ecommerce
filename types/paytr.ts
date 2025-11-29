/**
 * PayTR Entegrasyonu - Ortak Tip Tanımları
 * Hem backend (app/api/paytr/init/route.ts) hem frontend (app/odeme/page.tsx) tarafında kullanılır
 */

export interface PaytrInitRequest {
  orderNumber: string
  amount: number
  email: string
  userName: string
  userPhone: string
  userAddress: string
  userCity: string
  userCountry?: string
  installment?: number
  basketItems: Array<{
    productId: string // Sipariş kaydı için gerekli
    variantId?: string // Varyant ID'si (varsa)
    name: string
    price: number
    quantity?: number
    customText?: string // Özel metin varsa
    customFont?: string // Özel font varsa
  }>
}

export interface PaytrInitResponse {
  ok: boolean
  token?: string
  orderNumber?: string
  error?: string
}

