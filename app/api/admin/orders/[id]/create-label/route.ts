export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createDhlShipmentForOrder } from '@/lib/shipping/dhlClient'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Load order with all necessary data
    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order already has a tracking number
    if (order.cargoTrackingNo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order already has a tracking number',
          shipment: {
            trackingNumber: order.cargoTrackingNo,
            cargoCompany: order.cargoCompany || 'DHL',
            status: order.shipmentStatus || 'label_created',
            labelUrl: order.shipmentLabelUrl || '',
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            createdAt: order.createdAt,
            lastSync: order.shipmentLastSync || undefined,
          },
        },
        { status: 400 }
      )
    }

    // Create DHL shipment (mock for now)
    const result = await createDhlShipmentForOrder(order)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create shipment label' },
        { status: 500 }
      )
    }

    // Update order with shipment information
    // Automatically set status to PREPARING if order is PENDING, PAID, or AWAITING_PAYMENT
    const shouldSetToPreparing = ['PENDING', 'PAID', 'AWAITING_PAYMENT'].includes(order.status)
    
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        cargoCompany: result.shipment.cargoCompany,
        cargoTrackingNo: result.shipment.trackingNumber,
        shipmentStatus: result.shipment.status,
        shipmentLabelUrl: result.shipment.labelUrl,
        shipmentLastSync: result.shipment.lastSync || new Date(),
        // Automatically set to PREPARING when label is created
        ...(shouldSetToPreparing && { status: 'PREPARING' }),
      },
    })

    return NextResponse.json({
      success: true,
      shipment: {
        trackingNumber: result.shipment.trackingNumber,
        cargoCompany: result.shipment.cargoCompany,
        status: result.shipment.status,
        labelUrl: result.shipment.labelUrl,
        externalTrackingUrl: result.shipment.externalTrackingUrl,
        orderNumber: result.shipment.orderNumber,
        customerName: result.shipment.customerName,
        createdAt: result.shipment.createdAt,
        lastSync: result.shipment.lastSync,
      },
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        cargoTrackingNo: updatedOrder.cargoTrackingNo,
        shipmentStatus: updatedOrder.shipmentStatus,
      },
    })
  } catch (error) {
    console.error('Error creating label:', error)
    return NextResponse.json(
      { error: 'Failed to create shipment label' },
      { status: 500 }
    )
  }
}

