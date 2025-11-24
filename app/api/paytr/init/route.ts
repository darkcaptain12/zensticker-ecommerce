export const dynamic = 'force-dynamic'

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
      campaignDiscount,
    } = body

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !customerAddress) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Tüm alanlar doldurulmalıdır' 
        },
        { status: 400 }
      )
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Sepetiniz boş' 
        },
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
        campaignId: campaignDiscount?.id || null,
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

    // Get user IP (PayTR requires real IP)
    const userIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      '127.0.0.1'

    // Format basket for PayTR (base64 encoded JSON array of [product_name, price_in_kurus, quantity])
    const basket = formatBasket(
      items.map((item: any) => [
        item.name.substring(0, 64), // PayTR limits product name to 64 chars
        Math.round((item.salePrice || item.price) * 100), // Convert to kuruş
        item.quantity,
      ])
    )

    // Initialize PayTR payment
    const paytrResponse = await initPayTRPayment({
      email: customerEmail,
      paymentAmount: total,
      merchantOid: orderNumber,
      userIp,
      userBasket: basket,
      userName: customerName.substring(0, 64), // PayTR limit
      userAddress: customerAddress.substring(0, 200), // PayTR limit
      userPhone: customerPhone.replace(/\s/g, ''), // Remove spaces from phone
    })

    if (paytrResponse.status === 'success' && paytrResponse.token) {
      // Update order with PayTR token
      await prisma.order.update({
        where: { id: order.id },
        data: { paytrToken: paytrResponse.token },
      })

      const iframeUrl = `https://www.paytr.com/odeme/guvenli/${paytrResponse.token}`

      return NextResponse.json({
        status: 'ok',
        token: paytrResponse.token,
        iframeUrl,
        orderId: order.id,
        orderNumber,
      })
    } else {
      // Delete the order if payment initialization failed
      await prisma.order.delete({
        where: { id: order.id },
      }).catch(() => {
        // Ignore delete errors
      })

      return NextResponse.json(
        { 
          status: 'error',
          message: paytrResponse.reason || 'Ödeme başlatılamadı' 
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('PayTR init error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Bir hata oluştu' 
      },
      { status: 500 }
    )
  }
}
