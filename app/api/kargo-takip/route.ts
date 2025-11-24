export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDhlShipmentStatus } from '@/lib/shipping/dhlClient'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderNumber = searchParams.get('orderNumber')
    const trackingNumber = searchParams.get('trackingNumber')
    const query = searchParams.get('q') // Legacy support

    // Determine which query parameter to use
    const searchValue = orderNumber || trackingNumber || query

    if (!searchValue) {
      return NextResponse.json(
        { error: 'Sipariş numarası veya takip numarası gerekli' },
        { status: 400 }
      )
    }

    // Search by order number, tracking number, or legacy shipping code
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { contains: searchValue, mode: 'insensitive' } },
          { cargoTrackingNo: { contains: searchValue, mode: 'insensitive' } },
          { shippingCode: { contains: searchValue, mode: 'insensitive' } }, // Legacy support
        ],
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: {
                  where: { isMain: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      )
    }

    // Build shipment info if tracking number exists
    let shipmentInfo = null
    if (order.cargoTrackingNo) {
      // Get latest status from DHL (mock for now)
      const statusResponse = await getDhlShipmentStatus(order.cargoTrackingNo)

      shipmentInfo = {
        trackingNumber: order.cargoTrackingNo,
        cargoCompany: order.cargoCompany || 'DHL',
        status: order.shipmentStatus || statusResponse.status,
        labelUrl: order.shipmentLabelUrl || `/api/admin/mock-label/${order.cargoTrackingNo}`,
        externalTrackingUrl: `https://www.dhl.com/en/express/tracking.html?AWB=${order.cargoTrackingNo}`,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        createdAt: order.createdAt,
        lastSync: order.shipmentLastSync || new Date(),
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        shippingCode: order.shippingCode, // Legacy
        cargoTrackingNo: order.cargoTrackingNo,
        cargoCompany: order.cargoCompany,
        shipmentStatus: order.shipmentStatus,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          product: {
            name: item.product.name,
            images: item.product.images || [],
          },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
      shipment: shipmentInfo,
    })
  } catch (error) {
    console.error('Order tracking error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

