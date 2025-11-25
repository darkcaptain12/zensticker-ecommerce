export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import axios from 'axios'

export async function POST(request: NextRequest) {
  try {
    // ENV değişkenlerini al ve trim et
    const merchant_id = (process.env.PAYTR_MERCHANT_ID || '').trim()
    const merchant_key = (process.env.PAYTR_MERCHANT_KEY || '').trim()
    const merchant_salt = (process.env.PAYTR_MERCHANT_SALT || '').trim()
    const test_mode = (process.env.PAYTR_TEST_MODE || '1').trim()

    if (!merchant_id || !merchant_key || !merchant_salt) {
      return NextResponse.json(
        { status: 'error', reason: 'PayTR credentials are not configured' },
        { status: 500 }
      )
    }

    // Request body'den bilgileri al
    const body = await request.json()
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items,
      total,
    } = body

    // Validation
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

    // IP tespiti
    const forwarded = request.headers.get('x-forwarded-for') || ''
    let user_ip = (
      forwarded.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      '127.0.0.1'
    ).toString()

    // IPv6 localhost'u IPv4'e çevir
    if (user_ip === '::1' || user_ip === '::ffff:127.0.0.1') {
      user_ip = '127.0.0.1'
    }

    // merchant_oid oluştur
    const merchant_oid = `ORD${Date.now()}${Math.floor(Math.random() * 10000)}`

    // Sepet oluştur (basitleştirilmiş - tek satır)
    // Fiyat TL cinsinden 2 haneli string (örnek: 25 -> "25.00")
    const basketPrice = Number(total).toFixed(2)
    const basket = [['ZenSticker Toplam Ödeme', basketPrice, '1']]
    const user_basket = Buffer.from(JSON.stringify(basket), 'utf-8').toString('base64')

    // payment_amount (kuruş cinsinden string)
    const payment_amount = Math.round(Number(total) * 100).toString()

    // Diğer PayTR alanları
    const no_installment = '0'
    const max_installment = '0'
    const currency = 'TL'
    const merchant_ok_url = 'https://zensticker.com.tr/odeme/paytr-success'
    const merchant_fail_url = 'https://zensticker.com.tr/odeme/paytr-fail'
    const user_name = String(customerName).substring(0, 60)
    const user_address = String(customerAddress).substring(0, 400)
    const user_phone = String(customerPhone).replace(/\s/g, '').substring(0, 20)

    // Hash (paytr_token) hesabı - PayTR dokümanındaki sıraya göre
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

    // HMAC-SHA256 ile hash oluştur
    const paytr_token = crypto
      .createHmac('sha256', merchant_key)
      .update(hashStr + merchant_salt)
      .digest('base64')

    // PayTR get-token isteği
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
      timeout_limit: '30',
      debug_on: '1',
    })

    const response = await axios.post(
      'https://www.paytr.com/odeme/api/get-token',
      postData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    const result = response.data

    if (result.status !== 'success') {
      console.error('PayTR get-token error:', result)
      return NextResponse.json(
        {
          status: 'error',
          reason: result.reason || 'PAYTR token alınamadı',
        },
        { status: 400 }
      )
    }

    // Başarılı
    const token = result.token
    const iframeUrl = `https://www.paytr.com/odeme/guvenli/${token}`

    return NextResponse.json({
      status: 'success',
      token,
      iframeUrl,
      merchant_oid,
    })
  } catch (error: any) {
    console.error('PayTR init error:', error)
    return NextResponse.json(
      {
        status: 'error',
        reason: error.message || 'Bir hata oluştu',
      },
      { status: 500 }
    )
  }
}
