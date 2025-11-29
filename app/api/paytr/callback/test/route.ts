export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PayTR Callback Test Endpoint
 * Bu endpoint callback'in çalışıp çalışmadığını test etmek için kullanılabilir
 */
export async function GET(request: NextRequest) {
  try {
    // Son 10 siparişi getir
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        paytrRefCode: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Callback test endpoint is working',
      recentOrders,
      callbackUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/paytr/callback`,
      note: 'PayTR panelinde bu URL\'yi callback URL olarak ayarlayın',
    })
  } catch (error) {
    console.error('Callback test error:', error)
    return NextResponse.json(
      { success: false, error: 'Test failed' },
      { status: 500 }
    )
  }
}

