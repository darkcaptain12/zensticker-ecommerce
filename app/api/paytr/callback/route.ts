export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PayTR Callback Endpoint
 * 
 * PayTR ödeme sonucunu bu endpoint'e POST olarak gönderir.
 * PayTR her zaman "OK" bekler, bu yüzden hata olsa bile "OK" dönüyoruz.
 */
export async function POST(request: NextRequest) {
  // Her zaman log (production'da da) - TÜM LOGLAR
  const timestamp = new Date().toISOString()
  console.log('='.repeat(80))
  console.log(`🔔 PayTR Callback endpoint called at ${timestamp}`)
  console.log('='.repeat(80))
  
  try {
    // PayTR form-urlencoded olarak gönderir
    const formData = await request.formData()
    
    const merchantOid = formData.get('merchant_oid') as string | null
    const status = formData.get('status') as string | null
    const totalAmount = formData.get('total_amount') as string | null
    const hash = formData.get('hash') as string | null
    const paymentId = formData.get('payment_id') as string | null

    // Her zaman log (production'da da) - TÜM VERİLER
    console.log('📥 PayTR Callback received:', {
        merchantOid,
        status,
        totalAmount,
      paymentId: paymentId || null,
      hash: hash || null,
      timestamp: new Date().toISOString(),
      allFormData: Object.fromEntries(formData.entries()), // Tüm form verilerini logla
    })

    // merchant_oid yoksa işlem yapma
    if (!merchantOid) {
      console.warn('PayTR Callback: merchant_oid missing')
      return new NextResponse('OK', { status: 200 })
    }

    // PayTR init'te merchant_oid temizleniyor: replace(/[^A-Za-z0-9]/g, '')
    // Bu yüzden callback'te gelen merchant_oid'de `-` karakteri yok
    // Örneğin: orderNumber = "ZEN-ABC123-XYZ" -> merchant_oid = "ZENABC123XYZ"
    console.log(`🔍 Searching for order with merchant_oid: ${merchantOid}`)
    
    // Önce orijinal merchant_oid ile ara (temizlenmiş hali)
    let order = await prisma.order.findUnique({
      where: { orderNumber: merchantOid },
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
    
    // Eğer bulunamadıysa, merchant_oid'in temizlenmiş hali olabilir
    // PayTR init'te: merchant_oid = String(body.orderNumber || '').replace(/[^A-Za-z0-9]/g, '')
    // Yani orderNumber'daki `-` karakterleri kaldırılıyor
    if (!order) {
      console.log(`⚠️ Order not found with exact merchant_oid. Trying to find by cleaned orderNumber...`)
      
      // Tüm siparişleri al ve merchant_oid ile eşleşenleri bul
      const allRecentOrders = await prisma.order.findMany({
        where: {
          status: 'AWAITING_PAYMENT', // Sadece ödeme bekleyen siparişleri kontrol et
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Son 24 saat
          },
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
      
      // Her orderNumber'ı temizle ve merchant_oid ile karşılaştır
      for (const recentOrder of allRecentOrders) {
        const cleanedOrderNumber = recentOrder.orderNumber.replace(/[^A-Za-z0-9]/g, '')
        if (cleanedOrderNumber === merchantOid) {
          console.log(`✅ Found order by cleaned orderNumber: ${recentOrder.orderNumber} -> ${cleanedOrderNumber}`)
          // Siparişi tekrar bul (items ile birlikte)
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
    
    console.log(`🔍 Order search result:`, order ? {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      itemsCount: order.items.length,
    } : 'NOT FOUND')

    if (!order) {
      console.error(`❌ PayTR Callback: Order not found for merchant_oid: ${merchantOid}`)
      console.error('Recent AWAITING_PAYMENT orders:', await prisma.order.findMany({
        where: {
          status: 'AWAITING_PAYMENT',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        select: { orderNumber: true, status: true, createdAt: true },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }))
      // PayTR'a yine de "OK" dön
      return new NextResponse('OK', { status: 200 })
    }

    console.log(`✅ Order found: ${order.orderNumber}, Current status: ${order.status}, New status will be: ${status === 'success' ? 'PAID' : 'CANCELLED'}`)

    // PayTR status'una göre sipariş durumunu güncelle
    // PayTR status: "success" = ödeme başarılı, diğerleri = başarısız/iptal
    console.log(`🔄 Processing order status update. Status from PayTR: ${status}`)
    
    if (status === 'success') {
      console.log(`💰 Payment successful! Updating order ${order.orderNumber} to PAID...`)
      
      // Ödeme başarılı - Transaction içinde siparişi PAID yap ve stok azalt
      await prisma.$transaction(async (tx) => {
        // Siparişi PAID olarak güncelle
        const updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'PAID',
            paytrRefCode: paymentId || null,
          },
        })
        
        console.log(`✅ Order status updated to PAID:`, {
          orderId: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          status: updatedOrder.status,
          totalAmount: updatedOrder.totalAmount,
        })

        // Her ürün için stok azalt (varyant varsa varyant stokunu, yoksa ürün stokunu)
        for (const item of order.items) {
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

            // Stok negatif olmamalı (güvenlik için)
            if (updatedVariant.stock < 0) {
              console.warn(
                `⚠️ Variant stock went negative for ${product.name} - ${variant.name}: ${variant.value} (${variant.id}). Stock: ${updatedVariant.stock}, Quantity ordered: ${quantity}`
              )
              // Negatif stoku 0'a çek
              await tx.productVariant.update({
                where: { id: variant.id },
                data: { stock: 0 },
              })
            }

            if (process.env.NODE_ENV === 'development') {
              console.log(`📦 Variant stock reduced for ${product.name} - ${variant.name}: ${variant.value}:`, {
                variantId: variant.id,
                oldStock: variant.stock,
                quantity,
                newStock: updatedVariant.stock < 0 ? 0 : updatedVariant.stock,
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

            // Stok negatif olmamalı (güvenlik için)
            if (updatedProduct.stock < 0) {
              console.warn(
                `⚠️ Stock went negative for product ${product.name} (${product.id}). Stock: ${updatedProduct.stock}, Quantity ordered: ${quantity}`
              )
              // Negatif stoku 0'a çek (gerçek senaryoda bu durum olmamalı)
              await tx.product.update({
                where: { id: product.id },
                data: { stock: 0 },
              })
            }

            if (process.env.NODE_ENV === 'development') {
              console.log(`📦 Stock reduced for product ${product.name}:`, {
                productId: product.id,
                oldStock: product.stock,
                quantity,
                newStock: updatedProduct.stock < 0 ? 0 : updatedProduct.stock,
              })
            }
          }
        }
      })

      // Her zaman log - BAŞARILI
      console.log('='.repeat(80))
      console.log(`✅✅✅ ORDER UPDATED TO PAID SUCCESSFULLY ✅✅✅`)
      console.log(`Order Number: ${order.orderNumber}`)
      console.log(`Order ID: ${order.id}`)
      console.log(`Payment ID: ${paymentId}`)
      console.log(`Total Amount: ${totalAmount}`)
      console.log(`Items Count: ${order.items.length}`)
      console.log(`Timestamp: ${new Date().toISOString()}`)
      console.log('='.repeat(80))
    } else {
      // Ödeme başarısız veya iptal edildi - sadece durumu güncelle (stok azaltma)
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          paytrRefCode: paymentId || null,
        },
      })

      // Her zaman log
      console.log(`❌ Order cancelled: ${merchantOid}`, {
        orderId: order.id,
        status,
        paymentId,
        timestamp: new Date().toISOString(),
      })
    }

    // TODO: Hash doğrulama (PayTR dokümantasyonuna göre hash kontrolü yapılabilir)
    // Şu an için hash kontrolü yapmıyoruz, ama production'da eklenebilir

    // PayTR her zaman "OK" bekler
    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : 'No stack trace'
    
    // Her zaman detaylı hata logu
    console.error('='.repeat(80))
    console.error('❌❌❌ PAYTR CALLBACK ERROR ❌❌❌')
    console.error(`Error Message: ${errorMessage}`)
    console.error(`Error Stack: ${errorStack}`)
    console.error(`Timestamp: ${new Date().toISOString()}`)
    console.error('='.repeat(80))
    
    // PayTR'a hata olsa bile "OK" dön (retry'i önlemek için)
    return new NextResponse('OK', { status: 200 })
  }
}
