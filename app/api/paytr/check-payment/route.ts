export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PayTR Payment Check Endpoint
 * Success sayfasından çağrılır, sipariş durumunu kontrol eder ve günceller
 */
export async function POST(request: NextRequest) {
  try {
    const { orderNumber } = await request.json()

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: 'orderNumber is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Checking payment for order: ${orderNumber}`)

    // Siparişi bul (items ile birlikte, varyantlar dahil)
    let order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                stock: true,
                name: true,
              },
            },
            variant: {
              select: {
                id: true,
                stock: true,
                name: true,
                value: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      // Temizlenmiş orderNumber ile dene
      const allRecentOrders = await prisma.order.findMany({
        where: {
          status: 'AWAITING_PAYMENT',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        select: {
          orderNumber: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })

      for (const recentOrder of allRecentOrders) {
        const cleanedOrderNumber = recentOrder.orderNumber.replace(/[^A-Za-z0-9]/g, '')
        const cleanedInput = orderNumber.replace(/[^A-Za-z0-9]/g, '')
        if (cleanedOrderNumber === cleanedInput) {
          order = await prisma.order.findUnique({
            where: { orderNumber: recentOrder.orderNumber },
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      stock: true,
                      name: true,
                    },
                  },
                  variant: {
                    select: {
                      id: true,
                      stock: true,
                      name: true,
                      value: true,
                    },
                  },
                },
              },
            },
          })
          break
        }
      }
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Eğer zaten PAID ise, hiçbir şey yapma
    if (order.status === 'PAID') {
      return NextResponse.json({
        success: true,
        message: 'Order already paid',
        order: {
          orderNumber: order.orderNumber,
          status: order.status,
        },
      })
    }

    // Eğer AWAITING_PAYMENT ise, PAID olarak güncelle ve stok azalt
    if (order.status === 'AWAITING_PAYMENT') {
      console.log(`💰 Updating order ${order.orderNumber} from AWAITING_PAYMENT to PAID`)

      await prisma.$transaction(async (tx) => {
        // Siparişi PAID olarak güncelle
        await tx.order.update({
          where: { id: order!.id },
          data: {
            status: 'PAID',
          },
        })

        // Her ürün için stok azalt (varyant varsa varyant stokunu, yoksa ürün stokunu)
        for (const item of order!.items) {
          const product = item.product
          const variant = item.variant
          const quantity = item.quantity

          if (variant) {
            // Varyantlı ürün - varyant stokunu azalt
            const updatedVariant = await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                stock: {
                  decrement: quantity,
                },
              },
            })

            if (updatedVariant.stock < 0) {
              await tx.productVariant.update({
                where: { id: variant.id },
                data: { stock: 0 },
              })
            }
          } else {
            // Varyantsız ürün - ürün stokunu azalt
            const updatedProduct = await tx.product.update({
              where: { id: product.id },
              data: {
                stock: {
                  decrement: quantity,
                },
              },
            })

            if (updatedProduct.stock < 0) {
              await tx.product.update({
                where: { id: product.id },
                data: { stock: 0 },
              })
            }
          }
        }
      })

      console.log(`✅ Order ${order.orderNumber} updated to PAID successfully`)

      return NextResponse.json({
        success: true,
        message: 'Order updated to PAID',
        order: {
          orderNumber: order.orderNumber,
          status: 'PAID',
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Order status checked',
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
      },
    })
  } catch (error) {
    console.error('Payment check error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

