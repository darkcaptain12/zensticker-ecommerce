export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    if (process.env.NODE_ENV === 'development') {
      console.log('PayTR Callback received:', {
        merchantOid,
        status,
        totalAmount,
        paymentId: paymentId ? paymentId.substring(0, 10) + '...' : null,
        hash: hash ? hash.substring(0, 20) + '...' : null,
      })
    }

    // merchant_oid yoksa işlem yapma
    if (!merchantOid) {
      console.warn('PayTR Callback: merchant_oid missing')
      return new NextResponse('OK', { status: 200 })
    }

    // Siparişi orderNumber ile bul
    const order = await prisma.order.findUnique({
      where: { orderNumber: merchantOid },
    })

    if (!order) {
      console.warn(`PayTR Callback: Order not found for merchant_oid: ${merchantOid}`)
      // PayTR'a yine de "OK" dön
      return new NextResponse('OK', { status: 200 })
    }

    // PayTR status'una göre sipariş durumunu güncelle
    // PayTR status: "success" = ödeme başarılı, diğerleri = başarısız/iptal
    if (status === 'success') {
      // Ödeme başarılı - siparişi PAID olarak güncelle
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paytrRefCode: paymentId || null,
          // totalAmount zaten kaydedilmiş, PayTR'den gelen total_amount ile kontrol edebiliriz
          // Ama şimdilik mevcut totalAmount'u koruyoruz
        },
      })

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Order updated to PAID: ${merchantOid}`, {
          orderId: order.id,
          paymentId,
          totalAmount,
        })
      }
    } else {
      // Ödeme başarısız veya iptal edildi
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          paytrRefCode: paymentId || null,
        },
      })

      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ Order cancelled: ${merchantOid}`, {
          orderId: order.id,
          status,
          paymentId,
        })
      }
    }

    // TODO: Hash doğrulama (PayTR dokümantasyonuna göre hash kontrolü yapılabilir)
    // Şu an için hash kontrolü yapmıyoruz, ama production'da eklenebilir

    // PayTR her zaman "OK" bekler
    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    console.error('PayTR callback error:', errorMessage)
    
    if (process.env.NODE_ENV === 'development') {
      console.error('PayTR callback full error:', error)
    }
    
    // PayTR'a hata olsa bile "OK" dön (retry'i önlemek için)
    return new NextResponse('OK', { status: 200 })
  }
}
