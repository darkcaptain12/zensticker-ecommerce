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
    // PayTR PHP örneği: base64_encode(hash_hmac('sha256', $hash_str.$merchant_salt, $merchant_key, true))
    // Hash string: merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode
    // Sonra merchant_salt eklenir ve HMAC-SHA256 ile hash'lenir (binary output, sonra base64)
    const hashStr =
      String(merchant_id) +
      String(user_ip) +
      String(merchant_oid) +
      String(customerEmail) +
      String(payment_amount) +
      String(user_basket) +
      String(no_installment) +
      String(max_installment) +
      String(currency) +
      String(test_mode)

    // PayTR hash calculation: base64_encode(hash_hmac('sha256', hashStr + merchant_salt, merchant_key, true))
    // Node.js'te: createHmac zaten binary output verir, digest('base64') ile base64'e çeviririz
    const paytr_token = crypto
      .createHmac('sha256', merchant_key)
      .update(hashStr + merchant_salt, 'utf8')
      .digest('base64')

    // Debug logging for troubleshooting
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

    // 8) PayTR'a POST isteği
    // PayTR requires all values as strings
    const postData = new URLSearchParams()
    postData.append('merchant_id', merchant_id)
    postData.append('user_ip', user_ip)
    postData.append('merchant_oid', merchant_oid)
    postData.append('email', customerEmail)
    postData.append('payment_amount', payment_amount)
    postData.append('user_basket', user_basket)
    postData.append('no_installment', no_installment)
    postData.append('max_installment', max_installment)
    postData.append('currency', currency)
    postData.append('test_mode', test_mode)
    postData.append('paytr_token', paytr_token)
    postData.append('user_name', user_name)
    postData.append('user_address', user_address)
    postData.append('user_phone', user_phone)
    postData.append('merchant_ok_url', merchant_ok_url)
    postData.append('merchant_fail_url', merchant_fail_url)
    postData.append('timeout_limit', timeout_limit)
    postData.append('debug_on', debug_on)
    postData.append('lang', lang)

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
