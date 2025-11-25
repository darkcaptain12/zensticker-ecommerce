export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

/**
 * PayTR Callback Endpoint
 * 
 * PayTR ödeme sonucunu bu endpoint'e POST olarak gönderir.
 * 
 * TODO: 
 * - Hash doğrulama yapılacak
 * - Sipariş durumu güncellenecek (PAID veya CANCELLED)
 * - merchant_oid ile sipariş bulunacak
 * - Prisma ile order.update() yapılacak
 */
export async function POST(request: NextRequest) {
  try {
    // PayTR form-urlencoded olarak gönderir
    const formData = await request.formData()
    
    const merchantOid = formData.get('merchant_oid') as string
    const status = formData.get('status') as string
    const totalAmount = formData.get('total_amount') as string
    const hash = formData.get('hash') as string
    const paymentId = formData.get('payment_id') as string

    console.log('PayTR Callback received:', {
      merchantOid,
      status,
      totalAmount,
      paymentId,
    })

    // TODO: Hash doğrulama
    // TODO: Sipariş bulma ve güncelleme
    // TODO: Order status = 'PAID' veya 'CANCELLED' olarak güncelle

    // PayTR her zaman "OK" bekler
    return new NextResponse('OK')
  } catch (error) {
    console.error('PayTR callback error:', error)
    // PayTR'a hata olsa bile "OK" dön (retry'i önlemek için)
    return new NextResponse('OK')
  }
}
