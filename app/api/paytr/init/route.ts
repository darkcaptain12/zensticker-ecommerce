export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface PaytrInitRequest {
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
    name: string
    price: number
    quantity?: number
  }>
}

interface PaytrInitResponse {
  ok: boolean
  token?: string
  orderNumber?: string
  error?: string
}

interface PaytrApiResponse {
  status: string
  token?: string
  reason?: string
}

/**
 * Get client IP address (Vercel compatible)
 */
function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    return xff.split(',')[0].trim()
  }
  return '127.0.0.1'
}

/**
 * Build user_basket as base64 encoded JSON array
 */
function buildUserBasket(items: Array<{ name: string; price: number; quantity?: number }>): string {
  const basket = items.map((item) => [
    String(item.name).substring(0, 255),
    Math.round(item.price * 100).toString(),
    String(item.quantity || 1),
  ])
  return Buffer.from(JSON.stringify(basket), 'utf-8').toString('base64')
}

/**
 * Create PayTR token (HMAC-SHA256 hash)
 */
function createPaytrToken(
  merchant_id: string,
  user_ip: string,
  merchant_oid: string,
  email: string,
  payment_amount: string,
  user_basket: string,
  no_installment: string,
  max_installment: string,
  currency: string,
  test_mode: string,
  merchant_key: string,
  merchant_salt: string
): string {
  const hashStr =
    String(merchant_id) +
    String(user_ip) +
    String(merchant_oid) +
    String(email) +
    String(payment_amount) +
    String(user_basket) +
    String(no_installment) +
    String(max_installment) +
    String(currency) +
    String(test_mode);

  const paytrTokenStr = hashStr + String(merchant_salt);

  return crypto.createHmac('sha256', merchant_key).update(paytrTokenStr).digest('base64');
}

/**
 * Build PayTR POST parameters
 */
function buildPaytrParams(
  merchant_id: string,
  merchant_key: string,
  merchant_salt: string,
  user_ip: string,
  merchant_oid: string,
  email: string,
  payment_amount: string,
  user_basket: string,
  no_installment: string,
  max_installment: string,
  currency: string,
  test_mode: string,
  merchant_ok_url: string,
  merchant_fail_url: string,
  user_name: string,
  user_address: string,
  user_phone: string,
  user_city: string,
  user_country: string,
  paytr_token: string
): URLSearchParams {
  const params = new URLSearchParams()
  params.append('merchant_id', String(merchant_id))
  params.append('merchant_key', String(merchant_key))
  params.append('merchant_salt', String(merchant_salt))
  params.append('user_ip', String(user_ip))
  params.append('merchant_oid', String(merchant_oid))
  params.append('email', String(email))
  params.append('payment_amount', String(payment_amount))
  params.append('user_basket', String(user_basket))
  params.append('no_installment', String(no_installment))
  params.append('max_installment', String(max_installment))
  params.append('currency', String(currency))
  params.append('test_mode', String(test_mode))
  params.append('merchant_ok_url', String(merchant_ok_url))
  params.append('merchant_fail_url', String(merchant_fail_url))
  params.append('user_name', String(user_name))
  params.append('user_address', String(user_address))
  params.append('user_phone', String(user_phone))
  params.append('user_city', String(user_city))
  params.append('user_country', String(user_country))
  params.append('lang', 'tr')
  params.append('debug_on', '1')
  params.append('paytr_token', String(paytr_token))
  return params
}

export async function POST(req: NextRequest): Promise<NextResponse<PaytrInitResponse>> {
  try {
    // Validate environment variables
    const merchant_id = process.env.PAYTR_MERCHANT_ID?.trim()
    const merchant_key = process.env.PAYTR_MERCHANT_KEY?.trim()
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT?.trim()
    const test_mode_env = process.env.PAYTR_TEST_MODE?.trim()
    const baseUrl = process.env.NEXTAUTH_URL?.trim()

    if (!merchant_id || !merchant_key || !merchant_salt || !baseUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: 'PAYTR configuration is missing on server',
        },
        { status: 500 }
      )
    }

    // Parse request body
    const body: PaytrInitRequest = await req.json()

    // Validate required fields
    if (
      !body.orderNumber ||
      !body.amount ||
      !body.email ||
      !body.userName ||
      !body.userPhone ||
      !body.userAddress ||
      !body.userCity ||
      !body.basketItems ||
      body.basketItems.length === 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    // Get client IP
    const user_ip = getClientIp(req)

    // Compute PayTR values
    const payment_amount = Math.round(body.amount * 100).toString()
    const installment = body.installment || 0
    const no_installment = '0'
    const max_installment = installment > 0 ? String(installment) : '0'
    const currency = 'TL'
    const test_mode = test_mode_env === '1' ? '1' : '0'

    // Build URLs
    const baseUrlClean = baseUrl.replace(/\/$/, '')
    const merchant_ok_url = `${baseUrlClean}/odeme/paytr-success`
    const merchant_fail_url = `${baseUrlClean}/odeme/paytr-fail`

    // Build user basket
    const user_basket = buildUserBasket(body.basketItems)

    // Prepare user fields
    const user_name = String(body.userName).substring(0, 60)
    const user_address = String(body.userAddress).substring(0, 400)
    const user_phone = String(body.userPhone).replace(/\s/g, '').substring(0, 20)
    const user_city = String(body.userCity).substring(0, 50)
    const user_country = String(body.userCountry || 'Türkiye').substring(0, 50)

    // PayTR merchant_oid sadece alfanumerik olmalı
    let merchant_oid = String(body.orderNumber || '').replace(/[^A-Za-z0-9]/g, '')

    if (!merchant_oid) {
      merchant_oid = 'ZS' + Date.now().toString()
    }

    // Create PayTR token
    const paytr_token = createPaytrToken(
      merchant_id,
      user_ip,
      merchant_oid,
      body.email,
      payment_amount,
      user_basket,
      no_installment,
      max_installment,
      currency,
      test_mode,
      merchant_key,
      merchant_salt
    )

    // Build POST parameters
    const params = buildPaytrParams(
      merchant_id,
      merchant_key,
      merchant_salt,
      user_ip,
      merchant_oid,
      body.email,
      payment_amount,
      user_basket,
      no_installment,
      max_installment,
      currency,
      test_mode,
      merchant_ok_url,
      merchant_fail_url,
      user_name,
      user_address,
      user_phone,
      user_city,
      user_country,
      paytr_token
    )

    // Make request to PayTR
    const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const statusCode = response.status
    const statusText = response.statusText
    const raw = await response.text()

    console.log('PayTR HTTP status:', statusCode, statusText)
    console.log('PayTR raw response:', raw)

    let data: PaytrApiResponse | null = null

    // Gövde tamamen boşsa, direkt HTTP hata bilgisi dön
    if (!raw || raw.trim().length === 0) {
      console.error('PayTR boş yanıt döndürdü. HTTP:', statusCode, statusText)
      return NextResponse.json(
        {
          ok: false,
          error: `PayTR boş yanıt döndürdü (HTTP ${statusCode} ${statusText})`,
        },
        { status: 400 }
      )
    }

    // Öncelikle JSON olarak parse etmeyi dene
    try {
      data = JSON.parse(raw) as PaytrApiResponse
    } catch (e) {
      console.warn('PayTR get-token JSON parse edilemedi, URLSearchParams deneniyor. Raw:', raw)
    }

    // JSON değilse, URL-encoded formatta olabilir: status=success&token=...
    if (!data) {
      try {
        const paramsResp = new URLSearchParams(raw)
        const status = paramsResp.get('status') || ''
        const token = paramsResp.get('token') || undefined
        const reason = paramsResp.get('reason') || paramsResp.get('err_msg') || undefined

        if (status) {
          data = { status, token, reason }
        }
      } catch (e) {
        console.warn('PayTR get-token URLSearchParams parse edilemedi. Raw:', raw)
      }
    }

    // Hâlâ veri yoksa, en azından ham cevabı reason olarak göster
    if (!data) {
      console.error('PayTR get-token unknown response, fallback failed. Raw:', raw)
      data = {
        status: 'failed',
        reason: raw || 'PayTR boş/okunamayan yanıt döndürdü',
      }
    }

    if (data.status === 'success' && data.token) {
      return NextResponse.json({
        ok: true,
        token: data.token,
        orderNumber: body.orderNumber,
      })
    } else {
      const errorReason = data.reason || 'PayTR token alınamadı'
      console.error('PayTR get-token error:', errorReason, 'raw:', raw)
      return NextResponse.json(
        {
          ok: false,
          error: errorReason,
        },
        { status: 400 }
      )
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('PayTR init error:', errorMessage)
    return NextResponse.json(
      {
        ok: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}