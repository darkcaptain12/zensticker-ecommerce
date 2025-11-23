import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { initPayTRPayment, formatBasket } from '@/lib/paytr'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items,
      total,
      notes,
    } = body

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !customerAddress) {
      return NextResponse.json(
        { error: 'Tüm alanlar doldurulmalıdır' },
        { status: 400 }
      )
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Sepetiniz boş' },
        { status: 400 }
      )
    }

    // Create order
    const orderNumber = generateOrderNumber()
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

    // Get user IP
    const userIp =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1'

    // Format basket for PayTR
    const basket = formatBasket(
      items.map((item: any) => [
        item.name,
        (item.salePrice || item.price) * 100, // PayTR expects kuruş
        item.quantity,
      ])
    )

    // Initialize PayTR payment
    const paytrResponse = await initPayTRPayment({
      merchantId: process.env.PAYTR_MERCHANT_ID || '',
      merchantKey: process.env.PAYTR_MERCHANT_KEY || '',
      merchantSalt: process.env.PAYTR_MERCHANT_SALT || '',
      email: customerEmail,
      paymentAmount: total,
      merchantOid: orderNumber,
      userIp,
      userBasket: basket,
      testMode: process.env.PAYTR_TEST_MODE || '1',
    })

    if (paytrResponse.status === 'success' && paytrResponse.token) {
      // Update order with PayTR token
      await prisma.order.update({
        where: { id: order.id },
        data: { paytrToken: paytrResponse.token },
      })

      return NextResponse.json({
        success: true,
        token: paytrResponse.token,
        orderNumber,
      })
    } else {
      return NextResponse.json(
        { error: paytrResponse.reason || 'Ödeme başlatılamadı' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('PayTR init error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

