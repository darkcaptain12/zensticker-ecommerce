import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Sorgu parametresi gerekli' },
        { status: 400 }
      )
    }

    // Search by order number or shipping code
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { contains: query, mode: 'insensitive' } },
          { shippingCode: { contains: query, mode: 'insensitive' } },
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

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        shippingCode: order.shippingCode,
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
    })
  } catch (error) {
    console.error('Order tracking error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

