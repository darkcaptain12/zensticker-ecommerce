export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

/**
 * Cron job endpoint for cleaning up orders daily
 * This should be called by Vercel Cron Jobs or external cron service
 * 
 * Vercel Cron configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-orders",
 *     "schedule": "0 2 * * *" // Every day at 2 AM
 *   }]
 * }
 * 
 * Or use external service like cron-job.org to call:
 * https://yourdomain.com/api/cron/cleanup-orders?secret=YOUR_SECRET
 */
export async function GET(request: NextRequest) {
  // Security: Check for secret token
  const secret = request.nextUrl.searchParams.get('secret')
  const expectedSecret = process.env.CRON_SECRET || 'your-secret-key-change-this'

  if (secret !== expectedSecret) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    console.log('🧹 Starting daily order cleanup...')

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

    // Save log to file (optional - continue even if it fails)
    let logFileName: string | null = null
    try {
      // Try to use /tmp in serverless environments, fallback to logs directory
      const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
      const logsDir = isServerless 
        ? '/tmp/logs' 
        : path.join(process.cwd(), 'logs')
      
      if (!existsSync(logsDir)) {
        await mkdir(logsDir, { recursive: true })
      }

      logFileName = `order-cleanup-${new Date().toISOString().split('T')[0]}.json`
      const logFilePath = path.join(logsDir, logFileName)
      await writeFile(logFilePath, JSON.stringify(logEntry, null, 2), 'utf-8')

      console.log(`📝 Log saved to: ${logFilePath}`)
    } catch (logError: any) {
      // Log writing failed, but continue with cleanup
      console.warn('⚠️ Log dosyası yazılamadı (devam ediliyor):', logError.message)
      console.log('📝 Log entry:', JSON.stringify(logEntry, null, 2))
    }

    // Delete order items first (foreign key constraint)
    const deletedItems = await prisma.orderItem.deleteMany({})
    console.log(`✅ ${deletedItems.count} sipariş kalemi silindi`)

    // Delete orders
    const deletedOrders = await prisma.order.deleteMany({})
    console.log(`✅ ${deletedOrders.count} sipariş silindi`)

    return NextResponse.json({
      success: true,
      message: 'Orders cleaned up successfully',
      deletedOrders: deletedOrders.count,
      deletedItems: deletedItems.count,
      logFile: logFileName || 'Log file could not be written (check console logs)',
    })
  } catch (error: any) {
    console.error('❌ Order cleanup error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to cleanup orders',
      },
      { status: 500 }
    )
  }
}

