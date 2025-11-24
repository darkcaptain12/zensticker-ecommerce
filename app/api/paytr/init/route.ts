export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    // 1) ENV değişkenlerini kullan
    const merchant_id = process.env.PAYTR_MERCHANT_ID!
    const merchant_key = process.env.PAYTR_MERCHANT_KEY!
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT!
    const test_mode = process.env.PAYTR_TEST_MODE ?? '1'

    if (!merchant_id || !merchant_key || !merchant_salt) {
      return NextResponse.json(
        { status: 'error', reason: 'PayTR credentials are not configured' },
        { status: 500 }
      )
    }

    // 2) Body'den bilgileri al
    const body = await req.json()
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items,
      total,
      notes,
      campaignDiscount,
    } = body

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !customerAddress) {
      return NextResponse.json(
        { status: 'error', reason: 'Tüm alanlar doldurulmalıdır' },
        { status: 400 }
      )
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { status: 'error', reason: 'Sepetiniz boş' },
        { status: 400 }
      )
    }

    // Create order in database
    const orderNumber = generateOrderNumber()
    
    // 4) merchant_oid üretimi (alfanumerik)
    const merchant_oid = `ORD${Date.now()}${Math.floor(Math.random() * 10000)}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        totalAmount: total,
        status: 'AWAITING_PAYMENT',
        paymentProvider: 'PAYTR',
        notes,
        campaignId: campaignDiscount?.id || null,
        paytrRefCode: merchant_oid, // Store merchant_oid for callback lookup
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.salePrice || item.price,
            lineTotal: (item.salePrice || item.price) * item.quantity,
            customText: item.customText,
            customFont: item.customFont,
          })),
        },
      },
    })

    // 5) user_ip'yi al
    const forwarded = req.headers.get('x-forwarded-for') ?? ''
    const user_ip = forwarded.split(',')[0]?.trim() || 
                    req.headers.get('x-real-ip') || 
                    req.headers.get('cf-connecting-ip') || 
                    '127.0.0.1'

    // 3) user_basket'i PayTR dokümanındaki gibi oluştur
    const basket = items.map((item: any) => [
      item.name.substring(0, 64), // PayTR limit: 64 chars
      Math.round((item.salePrice || item.price) * 100).toString(), // Fiyat kuruş cinsinden string
      item.quantity.toString(),
    ])

    const user_basket = Buffer.from(JSON.stringify(basket), 'utf-8').toString('base64')

    // Payment amount in kuruş (string)
    const payment_amount = Math.round(total * 100).toString()

    // 6) Sabitler
    const no_installment = '0'
    const max_installment = '0'
    const currency = 'TL'
    const timeout_limit = '30'
    const debug_on = '1'
    const lang = 'tr'
    const merchant_ok_url = 'https://zensticker.com.tr/odeme/paytr-success'
    const merchant_fail_url = 'https://zensticker.com.tr/odeme/paytr-fail'

    // User info (PayTR limits)
    const user_name = customerName.substring(0, 64)
    const user_address = customerAddress.substring(0, 200)
    const user_phone = customerPhone.replace(/\s/g, '')

    // 7) HASH (paytr_token) hesabı - PayTR dokümanına göre
    // Hash string: merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode
    // Sonra merchant_salt eklenir ve HMAC-SHA256 ile hash'lenir
    const hashStr =
      merchant_id +
      user_ip +
      merchant_oid +
      customerEmail +
      payment_amount +
      user_basket +
      no_installment +
      max_installment +
      currency +
      test_mode

    const paytr_token = crypto
      .createHmac('sha256', merchant_key)
      .update(hashStr + merchant_salt)
      .digest('base64')

    // 8) PayTR'a POST isteği
    const postData = new URLSearchParams({
      merchant_id,
      user_ip,
      merchant_oid,
      email: customerEmail,
      payment_amount,
      user_basket,
      no_installment,
      max_installment,
      currency,
      test_mode,
      paytr_token,
      user_name,
      user_address,
      user_phone,
      merchant_ok_url,
      merchant_fail_url,
      timeout_limit,
      debug_on,
      lang,
    })

    const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: postData.toString(),
    })

    const result = await response.json()

    if (result.status !== 'success') {
      console.error('PayTR get-token error:', result)
      
      // Delete the order if payment initialization failed
      await prisma.order.delete({
        where: { id: order.id },
      }).catch(() => {
        // Ignore delete errors
      })

      return NextResponse.json(
        { status: 'error', reason: result.reason || 'Ödeme başlatılamadı' },
        { status: 400 }
      )
    }

    // Başarılı ise
    const token = result.token

    // Update order with PayTR token
    await prisma.order.update({
      where: { id: order.id },
      data: { paytrToken: token },
    })

    return NextResponse.json({
      status: 'success',
      token,
      iframeUrl: `https://www.paytr.com/odeme/guvenli/${token}`,
      merchant_oid,
      orderNumber,
      orderId: order.id,
    })
  } catch (error) {
    console.error('PayTR init error:', error)
    return NextResponse.json(
      {
        status: 'error',
        reason: error instanceof Error ? error.message : 'Bir hata oluştu',
      },
      { status: 500 }
    )
  }
}
