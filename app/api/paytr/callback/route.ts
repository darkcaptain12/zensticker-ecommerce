import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPayTRCallback } from '@/lib/paytr'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const merchantOid = formData.get('merchant_oid') as string
    const status = formData.get('status') as string
    const totalAmount = formData.get('total_amount') as string
    const hash = formData.get('hash') as string
    const failedReason = formData.get('failed_reason_code') as string

    // Find order
    const order = await prisma.order.findUnique({
      where: { orderNumber: merchantOid },
    })

    if (!order) {
      return new NextResponse('Order not found', { status: 404 })
    }

    // Verify hash
    const isValid = verifyPayTRCallback(
      process.env.PAYTR_MERCHANT_SALT || '',
      merchantOid,
      status,
      totalAmount,
      hash
    )

    if (!isValid) {
      console.error('Invalid PayTR callback hash')
      return new NextResponse('Invalid hash', { status: 400 })
    }

    // Update order status
    if (status === 'success') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paytrRefCode: formData.get('payment_id') as string,
        },
      })
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
        },
      })
    }

    return new NextResponse('OK')
  } catch (error) {
    console.error('PayTR callback error:', error)
    return new NextResponse('Error', { status: 500 })
  }
}

