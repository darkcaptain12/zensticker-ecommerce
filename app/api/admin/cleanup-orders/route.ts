export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

/**
 * Manual cleanup endpoint for admin panel
 * Allows admins to manually trigger order cleanup
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('🧹 Starting manual order cleanup...')

    // Fetch all orders with their items before deletion
    const ordersToDelete = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    // Create log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      deletedBy: session.user.email,
      deletedOrders: ordersToDelete.length,
      orders: ordersToDelete.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentProvider: order.paymentProvider,
        shippingCarrier: order.shippingCarrier,
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((item) => ({
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
          customText: item.customText,
          customFont: item.customFont,
        })),
      })),
    }

    // Save log to file
    const logsDir = path.join(process.cwd(), 'logs')
    if (!existsSync(logsDir)) {
      await mkdir(logsDir, { recursive: true })
    }

    const logFileName = `order-cleanup-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`
    const logFilePath = path.join(logsDir, logFileName)
    await writeFile(logFilePath, JSON.stringify(logEntry, null, 2), 'utf-8')

    console.log(`📝 Log saved to: ${logFilePath}`)

    // Delete order items first (foreign key constraint)
    const deletedItems = await prisma.orderItem.deleteMany({})
    console.log(`✅ ${deletedItems.count} sipariş kalemi silindi`)

    // Delete orders
    const deletedOrders = await prisma.order.deleteMany({})
    console.log(`✅ ${deletedOrders.count} sipariş silindi`)

    return NextResponse.json({
      success: true,
      message: 'Siparişler başarıyla temizlendi',
      deletedOrders: deletedOrders.count,
      deletedItems: deletedItems.count,
      logFile: logFileName,
    })
  } catch (error: any) {
    console.error('❌ Order cleanup error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Siparişler temizlenirken bir hata oluştu',
      },
      { status: 500 }
    )
  }
}

