export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

/**
 * PayTR Callback Endpoint
 * 
 * PayTR ödeme sonucunu bu endpoint'e POST olarak gönderir.
 * PayTR her zaman "OK" bekler, bu yüzden hata olsa bile "OK" dönüyoruz.
 */
export async function POST(request: NextRequest) {
  try {
    // PayTR form-urlencoded olarak gönderir
    const formData = await request.formData()
    
    const merchantOid = formData.get('merchant_oid') as string | null
    const status = formData.get('status') as string | null
    const totalAmount = formData.get('total_amount') as string | null
    const hash = formData.get('hash') as string | null
    const paymentId = formData.get('payment_id') as string | null

    // Development'ta log, production'da sadece hata durumunda
    if (process.env.NODE_ENV !== 'production') {
      console.log('PayTR Callback received:', {
        merchantOid,
        status,
        totalAmount,
        paymentId: paymentId ? paymentId.substring(0, 10) + '...' : null,
      })
    }

    // TODO: Hash doğrulama
    // TODO: Sipariş bulma ve güncelleme
    // TODO: Order status = 'PAID' veya 'CANCELLED' olarak güncelle

    // PayTR her zaman "OK" bekler
    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    if (process.env.NODE_ENV !== 'production') {
      console.error('PayTR callback error:', error)
    } else {
      console.error('PayTR callback error:', errorMessage)
    }
    
    // PayTR'a hata olsa bile "OK" dön (retry'i önlemek için)
    return new NextResponse('OK', { status: 200 })
  }
}
