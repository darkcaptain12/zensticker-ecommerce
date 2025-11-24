export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPayTRCallback } from '@/lib/paytr'

export async function POST(request: NextRequest) {
  try {
    // PayTR sends data as form-urlencoded
    const formData = await request.formData()
    
    const merchantOid = formData.get('merchant_oid') as string
    const status = formData.get('status') as string
    const totalAmount = formData.get('total_amount') as string
    const hash = formData.get('hash') as string
    const paymentId = formData.get('payment_id') as string
    const failedReasonCode = formData.get('failed_reason_code') as string
    const failedReasonMessage = formData.get('failed_reason_message') as string

    if (!merchantOid || !status || !totalAmount || !hash) {
      console.error('PayTR callback: Missing required parameters')
      return new NextResponse('Missing parameters', { status: 400 })
    }

    // Find order by merchant_oid (stored in paytrRefCode field)
    const order = await prisma.order.findFirst({
      where: { paytrRefCode: merchantOid },
    })

    if (!order) {
      console.error(`PayTR callback: Order not found - ${merchantOid}`)
      return new NextResponse('Order not found', { status: 404 })
    }

    // Verify hash according to PayTR documentation
    // hash = HMAC-SHA256(merchant_salt + merchant_oid + status + total_amount, merchant_key)
    const isValid = verifyPayTRCallback(
      merchantOid,
      status,
      totalAmount,
      hash
    )

    if (!isValid) {
      console.error('PayTR callback: Invalid hash verification', {
        merchantOid,
        status,
        totalAmount,
      })
      // Still return OK to PayTR to prevent retries, but don't update order
      return new NextResponse('OK')
    }

    // Update order status based on payment result
    if (status === 'success') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          // Keep merchant_oid in paytrRefCode, add payment_id to paytrToken or notes
          paytrToken: paymentId || order.paytrToken || null,
        },
      })
      console.log(`PayTR callback: Payment successful for order ${merchantOid}`)
    } else {
      // Payment failed
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          notes: order.notes 
            ? `${order.notes}\n\nÖdeme başarısız: ${failedReasonMessage || failedReasonCode || 'Bilinmeyen hata'}`
            : `Ödeme başarısız: ${failedReasonMessage || failedReasonCode || 'Bilinmeyen hata'}`,
        },
      })
      console.log(`PayTR callback: Payment failed for order ${merchantOid}`, {
        failedReasonCode,
        failedReasonMessage,
      })
    }

    // PayTR expects plain text "OK" response
    return new NextResponse('OK')
  } catch (error) {
    console.error('PayTR callback error:', error)
    // Still return OK to prevent PayTR from retrying
    return new NextResponse('OK')
  }
}
