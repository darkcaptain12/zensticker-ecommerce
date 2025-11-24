export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createDhlShipmentsBulk } from '@/lib/shipping/dhlClient'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { orderIds } = await request.json()

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: 'orderIds must be a non-empty array' },
        { status: 400 }
      )
    }

    // Load all orders
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
      },
    })

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'No orders found' },
        { status: 404 }
      )
    }

    // Create shipments for all orders
    const result = await createDhlShipmentsBulk(orders)

    // Update orders in database
    const updatePromises = result.shipments.map((shipment) =>
      prisma.order.updateMany({
        where: {
          orderNumber: shipment.orderNumber,
          cargoTrackingNo: null, // Only update if no tracking number exists
        },
        data: {
          cargoCompany: shipment.cargoCompany,
          cargoTrackingNo: shipment.trackingNumber,
          shipmentStatus: shipment.status,
          shipmentLabelUrl: shipment.labelUrl,
          shipmentLastSync: shipment.lastSync || new Date(),
        },
      })
    )

    await Promise.all(updatePromises)

    // Automatically set status to PREPARING when label is created (if order is PENDING, PAID, or AWAITING_PAYMENT)
    await prisma.order.updateMany({
      where: {
        id: { in: orderIds },
        status: { in: ['PENDING', 'PAID', 'AWAITING_PAYMENT'] },
      },
      data: {
        status: 'PREPARING',
      },
    })

    return NextResponse.json({
      success: result.success,
      shipments: result.shipments,
      ...(result.errors && result.errors.length > 0 && { errors: result.errors }),
    })
  } catch (error) {
    console.error('Error creating bulk labels:', error)
    return NextResponse.json(
      { error: 'Failed to create shipment labels' },
      { status: 500 }
    )
  }
}

