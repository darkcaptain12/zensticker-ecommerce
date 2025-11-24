export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    // 1) ENV değişkenlerini oku ve trim et
    const merchant_id = (process.env.PAYTR_MERCHANT_ID || '').trim()
    const merchant_key = (process.env.PAYTR_MERCHANT_KEY || '').trim()
    const merchant_salt = (process.env.PAYTR_MERCHANT_SALT || '').trim()
    const test_mode = ((process.env.PAYTR_TEST_MODE || '1').trim() === '0' ? '0' : '1')

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

    // Zorunlu alan kontrolleri
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

    // 3) Siparişi DB'ye kaydet
    const orderNumber = generateOrderNumber()

    // PayTR tarafında kullanılacak merchant_oid (sadece alfanumerik)
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
        paytrRefCode: merchant_oid,
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

    // 4) user_ip'yi al
    const forwarded = req.headers.get('x-forwarded-for') ?? ''
    const user_ip = (
      forwarded.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      '127.0.0.1'
    ).toString()

    // 5) Sepeti PayTR formatında oluştur
    const basket = items.map((item: any) => [
      String(item.name || '').substring(0, 64), // Ürün adı max 64 karakter
      Number(item.salePrice || item.price).toFixed(2), // Birim fiyat TL string (ör: "85.00")
      String(item.quantity),
    ])

    const user_basket = Buffer.from(JSON.stringify(basket), 'utf8').toString('base64')

    // Ödeme tutarı kuruş cinsinden string (ör: 350.00 -> "35000")
    const payment_amount = Math.round(Number(total) * 100).toString()

    // 6) Sabitler
    const no_installment = '0'
    const max_installment = '0'
    const currency = 'TL'
    const timeout_limit = '30'
    const debug_on = '1'
    const lang = 'tr'
    const iframe_v2 = '1'
    const iframe_v2_dark = '0'

    const merchant_ok_url = 'https://zensticker.com.tr/odeme/paytr-success'
    const merchant_fail_url = 'https://zensticker.com.tr/odeme/paytr-fail'

    // Kullanıcı bilgileri (PayTR limitlerine göre kısaltılmış)
    const user_name = String(customerName).substring(0, 60)
    const user_address = String(customerAddress).substring(0, 400)
    const user_phone = String(customerPhone).replace(/\s/g, '').substring(0, 20)

    // 7) HASH (paytr_token) hesabı - PayTR dokümanındaki SIRAYLA
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

    // Debug log
    console.log('PayTR Hash Calculation Debug:', {
      merchant_id,
      user_ip,
      merchant_oid,
      email: customerEmail,
      payment_amount,
      user_basket: user_basket.substring(0, 100) + '...',
      user_basket_length: user_basket.length,
      no_installment,
      max_installment,
      currency,
      test_mode,
      hashStr_preview: hashStr.substring(0, 150) + '...',
      hashStr_length: hashStr.length,
      merchant_salt_length: merchant_salt.length,
      merchant_key_length: merchant_key.length,
      paytr_token_preview: paytr_token.substring(0, 50) + '...',
      paytr_token_length: paytr_token.length,
    })

    // 8) PayTR get-token isteği (x-www-form-urlencoded)
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
      iframe_v2,
      iframe_v2_dark,
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
      console.error('PayTR get-token error:', {
        status: result.status,
        reason: result.reason,
        merchant_id,
        merchant_oid,
        payment_amount,
        user_basket_preview: user_basket.substring(0, 50) + '...',
        hashStr_preview: hashStr.substring(0, 100) + '...',
      })

      // Ödeme başlatılamazsa siparişi sil
      await prisma.order
        .delete({ where: { id: order.id } })
        .catch(() => {})

      return NextResponse.json(
        { status: 'error', reason: result.reason || 'Ödeme başlatılamadı' },
        { status: 400 }
      )
    }

    const token = result.token as string

    // Siparişi token ile güncelle
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
