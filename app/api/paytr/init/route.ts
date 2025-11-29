export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import type { PaytrInitRequest, PaytrInitResponse } from '@/types/paytr'

interface PaytrApiResponse {
  status: string
  token?: string
  reason?: string
}

/**
 * Basket -> base64(JSON)
 * Örnek: [["Ürün","18.00","1"], ...]
 */
function buildUserBasket(items: Array<{ name: string; price: number; quantity?: number }>): string {
  const basket = items.map((item) => [
    String(item.name).substring(0, 255),
    Number(item.price).toFixed(2),          // PayTR örneği: 2 ondalık
    String(item.quantity || 1),
  ])
  return Buffer.from(JSON.stringify(basket), 'utf-8').toString('base64')
}

/**
 * PayTR token üretimi (HMAC-SHA256)
 * Sıra dokümandakiyle bire bir:
 * merchant_id + user_ip + merchant_oid + email + payment_amount +
 * user_basket + no_installment + max_installment + currency + test_mode
 * Sonra + merchant_salt, HMAC-SHA256(merchant_key) ve base64
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
    String(test_mode)

  const paytrTokenStr = hashStr + String(merchant_salt)

  return crypto.createHmac('sha256', merchant_key).update(paytrTokenStr).digest('base64')
}

/**
 * PayTR POST parametreleri
 * NodeJS örneğine çok yakın
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

  // PayTR Node örneği merchant_key ve merchant_salt'ı da gönderiyor
  params.append('merchant_id', merchant_id)
  params.append('merchant_key', merchant_key)
  params.append('merchant_salt', merchant_salt)

  params.append('user_ip', user_ip)
  params.append('merchant_oid', merchant_oid)
  params.append('email', email)
  params.append('payment_amount', payment_amount)
  params.append('user_basket', user_basket)

  const timeout_limit = '30'
  const debug_on = '1'   // sorun çözülene kadar 1, sonra 0 yap
  const lang = 'tr'

  params.append('no_installment', no_installment)
  params.append('max_installment', max_installment)
  params.append('currency', currency)
  params.append('test_mode', test_mode)
  params.append('merchant_ok_url', merchant_ok_url)
  params.append('merchant_fail_url', merchant_fail_url)
  params.append('user_name', user_name)
  params.append('user_address', user_address)
  params.append('user_phone', user_phone)
  params.append('user_city', user_city)
  params.append('user_country', user_country)
  params.append('timeout_limit', timeout_limit)
  params.append('debug_on', debug_on)
  params.append('lang', lang)
  params.append('paytr_token', paytr_token)

  return params
}

export async function POST(req: NextRequest): Promise<NextResponse<PaytrInitResponse>> {
  try {
    const merchant_id = process.env.PAYTR_MERCHANT_ID?.trim()
    const merchant_key = process.env.PAYTR_MERCHANT_KEY?.trim()
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT?.trim()
    const test_mode_env = process.env.PAYTR_TEST_MODE?.trim()
    const baseUrl = process.env.NEXTAUTH_URL?.trim()

    if (!merchant_id || !merchant_key || !merchant_salt || !baseUrl) {
      return NextResponse.json(
        { ok: false, error: 'PAYTR configuration is missing on server' },
        { status: 500 }
      )
    }

    const body: PaytrInitRequest = await req.json()

    // Development ortamında detaylı log
    if (process.env.NODE_ENV === 'development') {
      console.log('PAYTR INIT BODY:', {
        orderNumber: body.orderNumber,
        amount: body.amount,
        amountType: typeof body.amount,
        email: body.email,
        userName: body.userName,
        userPhone: body.userPhone,
        userAddress: body.userAddress?.substring(0, 50) + '...',
        userCity: body.userCity,
        basketItemsCount: body.basketItems?.length || 0,
        basketItems: body.basketItems?.map(item => ({
          name: item.name?.substring(0, 30),
          price: item.price,
          quantity: item.quantity || 1,
        })),
      })
    }

    // Geliştirilmiş validasyon - her alanı ayrı ayrı kontrol et
    const missingFields: string[] = []

    // orderNumber: string, trim sonrası boş olmamalı
    if (!body.orderNumber || typeof body.orderNumber !== 'string' || body.orderNumber.trim().length === 0) {
      missingFields.push('orderNumber')
    }

    // amount: null/undefined olmamalı ve Number.isFinite TRUE olmalı (0 geçerli)
    if (body.amount == null || !Number.isFinite(body.amount)) {
      missingFields.push('amount')
    }

    // email: string ve trim sonrası boş olmamalı
    if (!body.email || typeof body.email !== 'string' || body.email.trim().length === 0) {
      missingFields.push('email')
    }

    // userName: string ve trim sonrası boş olmamalı
    if (!body.userName || typeof body.userName !== 'string' || body.userName.trim().length === 0) {
      missingFields.push('userName')
    }

    // userPhone: string ve trim sonrası boş olmamalı
    if (!body.userPhone || typeof body.userPhone !== 'string' || body.userPhone.trim().length === 0) {
      missingFields.push('userPhone')
    }

    // userAddress: string ve trim sonrası boş olmamalı
    if (!body.userAddress || typeof body.userAddress !== 'string' || body.userAddress.trim().length === 0) {
      missingFields.push('userAddress')
    }

    // userCity: string ve trim sonrası boş olmamalı
    if (!body.userCity || typeof body.userCity !== 'string' || body.userCity.trim().length === 0) {
      missingFields.push('userCity')
    }

    // basketItems: dizi ve length > 0 olmalı
    if (!Array.isArray(body.basketItems) || body.basketItems.length === 0) {
      missingFields.push('basketItems')
    }

    // Eksik alanlar varsa detaylı hata döndür
    if (missingFields.length > 0) {
      const errorMessage = `Missing required fields: ${missingFields.join(', ')}`
      if (process.env.NODE_ENV === 'development') {
        console.error('PAYTR VALIDATION ERROR:', errorMessage, {
          receivedAmount: body.amount,
          receivedAmountType: typeof body.amount,
          receivedOrderNumber: body.orderNumber,
          receivedBasketItemsLength: body.basketItems?.length,
        })
      }
      return NextResponse.json(
        { ok: false, error: errorMessage },
        { status: 400 }
      )
    }

    // Canlıda IP farklılıklarını elemek için sabit IP kullanıyoruz
    // (PayTR için yeterli, hash ile uyumlu olduğu sürece sorun yok)
    const user_ip = '127.0.0.1'

    // amount'ı number'a çevir ve kuruş cinsine çevir (PayTR kuruş bekliyor)
    // amount zaten validasyon geçti, ama yine de güvenlik için Number() kullan
    const amountNumber = Number(body.amount)
    if (!Number.isFinite(amountNumber) || amountNumber < 0) {
      const errorMsg = `Invalid amount: ${body.amount} (must be a positive number)`
      if (process.env.NODE_ENV === 'development') {
        console.error('PAYTR AMOUNT ERROR:', errorMsg)
      }
      return NextResponse.json(
        { ok: false, error: errorMsg },
        { status: 400 }
      )
    }

    const payment_amount = Math.round(amountNumber * 100).toString()
    
    // Development ortamında amount kontrolü logla
    if (process.env.NODE_ENV === 'development') {
      console.log('PAYTR AMOUNT CALCULATION:', {
        originalAmount: body.amount,
        amountNumber,
        payment_amount_kurus: payment_amount,
        payment_amount_tl: (Number(payment_amount) / 100).toFixed(2),
      })
    }
    const installment = body.installment || 0
    const no_installment = '0'
    const max_installment = installment > 0 ? String(installment) : '0'
    const currency = 'TL'
    const test_mode = test_mode_env === '1' ? '1' : '0'

    const baseUrlClean = baseUrl.replace(/\/$/, '')
    // Success URL'ine orderNumber ekle (sipariş bilgilerini göstermek için)
    const merchant_ok_url = `${baseUrlClean}/odeme/paytr-success?orderNumber=${encodeURIComponent(body.orderNumber)}`
    const merchant_fail_url = `${baseUrlClean}/odeme/paytr-fail`

    const user_basket = buildUserBasket(body.basketItems)

    const user_name = String(body.userName).substring(0, 60)
    const user_address = String(body.userAddress).substring(0, 400)
    const user_phone = String(body.userPhone).replace(/\s/g, '').substring(0, 20)
    const user_city = String(body.userCity).substring(0, 50)
    const user_country = String(body.userCountry || 'Türkiye').substring(0, 50)

    let merchant_oid = String(body.orderNumber || '').replace(/[^A-Za-z0-9]/g, '')
    if (!merchant_oid) {
      merchant_oid = 'ZS' + Date.now().toString()
    }

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

    // PayTR response logları - her zaman logla (production'da da önemli)
    console.log('PayTR HTTP status:', statusCode, statusText)
    console.log('PayTR raw response:', raw)
    
    // Development ortamında daha detaylı log
    if (process.env.NODE_ENV === 'development') {
      console.log('PayTR Request Summary:', {
        merchant_oid: merchant_oid,
        payment_amount: payment_amount,
        email: body.email,
        basketItemsCount: body.basketItems.length,
      })
    }

    let data: PaytrApiResponse | null = null

    if (!raw || raw.trim().length === 0) {
      console.error('PayTR boş yanıt döndürdü. HTTP:', statusCode, statusText)
      return NextResponse.json(
        { ok: false, error: `PayTR boş yanıt döndürdü (HTTP ${statusCode} ${statusText})` },
        { status: 400 }
      )
    }

    try {
      data = JSON.parse(raw) as PaytrApiResponse
    } catch {
      console.warn('PayTR get-token JSON parse edilemedi, URLSearchParams deneniyor. Raw:', raw)
    }

    if (!data) {
      try {
        const paramsResp = new URLSearchParams(raw)
        const status = paramsResp.get('status') || ''
        const token = paramsResp.get('token') || undefined
        const reason = paramsResp.get('reason') || paramsResp.get('err_msg') || undefined

        if (status) {
          data = { status, token, reason }
        }
      } catch {
        console.warn('PayTR get-token URLSearchParams parse edilemedi. Raw:', raw)
      }
    }

    if (!data) {
      console.error('PayTR get-token unknown response, fallback failed. Raw:', raw)
      data = {
        status: 'failed',
        reason: raw || 'PayTR boş/okunamayan yanıt döndürdü',
      }
    }

    if (data.status === 'success' && data.token) {
      // PayTR token başarılı - siparişi veritabanına kaydet
      try {
        // Kullanıcıyı email ile bul (varsa)
        const user = await prisma.user.findUnique({
          where: { email: body.email },
          select: { id: true },
        })

        // Campaign kontrolü - subtotal'e göre aktif kampanya bul
        const subtotal = body.basketItems.reduce(
          (sum, item) => sum + (item.price * (item.quantity || 1)),
          0
        )
        
        let campaignId: string | null = null
        if (subtotal > 0) {
          const now = new Date()
          const campaign = await prisma.campaign.findFirst({
            where: {
              isActive: true,
              type: 'GENERAL',
              startDate: { lte: now },
              endDate: { gte: now },
              minPurchaseAmount: { lte: subtotal },
            },
            orderBy: [
              { minPurchaseAmount: 'desc' },
              { discountPercent: 'desc' },
            ],
            select: { id: true },
          })
          campaignId = campaign?.id || null
        }

        // Siparişi PENDING olarak kaydet
        // Eğer aynı orderNumber ile sipariş varsa güncelle (idempotent)
        // NOT: PayTR merchant_oid temizlenmiş haliyle gönderiliyor, callback'te eşleştirme yapılacak
        const order = await prisma.order.upsert({
          where: { orderNumber: body.orderNumber },
          update: {
            // Sipariş zaten varsa güncelleme yapma (callback'te güncellenecek)
            paytrToken: data.token,
          },
          create: {
            orderNumber: body.orderNumber, // Orijinal orderNumber (örn: ZEN-ABC123-XYZ)
            userId: user?.id || null,
            customerName: body.userName,
            customerEmail: body.email,
            customerPhone: body.userPhone,
            customerAddress: body.userAddress,
            status: 'AWAITING_PAYMENT', // PayTR'ye gönderildi, ödeme bekleniyor
            totalAmount: amountNumber,
            paymentProvider: 'PAYTR',
            paytrToken: data.token,
            campaignId: campaignId,
            items: {
              create: body.basketItems.map((item) => ({
                productId: item.productId,
                variantId: item.variantId || null, // Varyant ID'si (varsa)
                quantity: item.quantity || 1,
                unitPrice: item.price,
                lineTotal: item.price * (item.quantity || 1),
                customText: item.customText || null,
                customFont: item.customFont || null,
              })),
            },
          },
        })

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Order created:', {
            orderNumber: order.orderNumber,
            orderId: order.id,
            status: order.status,
            totalAmount: order.totalAmount,
            itemsCount: body.basketItems.length,
          })
        }

        return NextResponse.json({
          ok: true,
          token: data.token,
          orderNumber: body.orderNumber,
        })
      } catch (orderError) {
        // Sipariş kaydı başarısız olsa bile token'ı döndür (kullanıcı ödeme yapabilsin)
        // Callback'te sipariş kontrolü yapılacak
        console.error('❌ Order creation error (but token is valid):', orderError)
        
        if (process.env.NODE_ENV === 'development') {
          console.error('Order creation details:', {
            orderNumber: body.orderNumber,
            email: body.email,
            error: orderError instanceof Error ? orderError.message : 'Unknown error',
          })
        }

        // Token geçerli olduğu için başarılı döndür, ama logla
        return NextResponse.json({
          ok: true,
          token: data.token,
          orderNumber: body.orderNumber,
        })
      }
    } else {
      const errorReason = data.reason || 'PayTR token alınamadı'
      console.error('PayTR get-token error:', errorReason, 'raw:', raw)
      return NextResponse.json(
        { ok: false, error: errorReason },
        { status: 400 }
      )
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('PayTR init error:', errorMessage)
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    )
  }
}