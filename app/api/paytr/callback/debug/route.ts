export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PayTR Callback Debug Endpoint
 * Bu endpoint callback'in çalışıp çalışmadığını ve son siparişleri kontrol eder
 */
export async function GET(request: NextRequest) {
  try {
    // Son 20 siparişi getir (tüm durumlar)
    const recentOrders = await prisma.order.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        paytrRefCode: true,
        paytrToken: true,
        customerEmail: true,
        customerName: true,
      },
    })

    // AWAITING_PAYMENT durumundaki siparişleri say
    const awaitingPaymentCount = await prisma.order.count({
      where: { status: 'AWAITING_PAYMENT' },
    })

    // PAID durumundaki siparişleri say
    const paidCount = await prisma.order.count({
      where: { status: 'PAID' },
    })

    // Son 24 saatteki AWAITING_PAYMENT siparişleri
    const recentAwaiting = await prisma.order.findMany({
      where: {
        status: 'AWAITING_PAYMENT',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      select: {
        orderNumber: true,
        createdAt: true,
        totalAmount: true,
        customerEmail: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      success: true,
      message: 'Callback debug endpoint',
      callbackUrl: `${process.env.NEXTAUTH_URL || 'https://www.zensticker.com.tr'}/api/paytr/callback`,
      stats: {
        totalOrders: recentOrders.length,
        awaitingPayment: awaitingPaymentCount,
        paid: paidCount,
      },
      recentOrders: recentOrders.map(order => ({
        orderNumber: order.orderNumber,
        cleanedOrderNumber: order.orderNumber.replace(/[^A-Za-z0-9]/g, ''),
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        hasPaytrRefCode: !!order.paytrRefCode,
        hasPaytrToken: !!order.paytrToken,
      })),
      recentAwaitingPayment: recentAwaiting.map(order => ({
        orderNumber: order.orderNumber,
        cleanedOrderNumber: order.orderNumber.replace(/[^A-Za-z0-9]/g, ''),
        createdAt: order.createdAt,
        totalAmount: order.totalAmount,
        customerEmail: order.customerEmail,
      })),
      note: 'PayTR callback URL\'yi kontrol edin: https://www.zensticker.com.tr/api/paytr/callback',
    })
  } catch (error) {
    console.error('Callback debug error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

