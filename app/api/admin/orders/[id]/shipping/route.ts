export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateTrackingUrl } from '@/lib/shipping'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { shippingCarrier, trackingNumber } = body

    // Validate input
    if (!shippingCarrier || !trackingNumber) {
      return NextResponse.json(
        { error: 'Kargo firması ve takip numarası gereklidir' },
        { status: 400 }
      )
    }

    // Generate tracking URL
    const trackingUrl = generateTrackingUrl(shippingCarrier, trackingNumber)

    if (!trackingUrl) {
      return NextResponse.json(
        { error: 'Geçersiz kargo firması' },
        { status: 400 }
      )
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        shippingCarrier,
        trackingNumber,
        trackingUrl,
      },
    })

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    })
  } catch (error: any) {
    console.error('Update shipping info error:', error)
    return NextResponse.json(
      { error: error.message || 'Kargo bilgileri güncellenemedi' },
      { status: 500 }
    )
  }
}

