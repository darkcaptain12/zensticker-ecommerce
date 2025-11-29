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
  try {
    // PayTR form-urlencoded olarak gönderir
    const formData = await request.formData()
    
    const merchantOid = formData.get('merchant_oid') as string | null
    const status = formData.get('status') as string | null
    const totalAmount = formData.get('total_amount') as string | null
    const hash = formData.get('hash') as string | null
    const paymentId = formData.get('payment_id') as string | null

    // Development'ta log, production'da sadece hata durumunda
    if (process.env.NODE_ENV === 'development') {
      console.log('PayTR Callback received:', {
        merchantOid,
        status,
        totalAmount,
        paymentId: paymentId ? paymentId.substring(0, 10) + '...' : null,
        hash: hash ? hash.substring(0, 20) + '...' : null,
      })
    }

    // merchant_oid yoksa işlem yapma
    if (!merchantOid) {
      console.warn('PayTR Callback: merchant_oid missing')
      return new NextResponse('OK', { status: 200 })
    }

    // Siparişi orderNumber ile bul (items ile birlikte, varyantlar dahil)
    const order = await prisma.order.findUnique({
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

    if (!order) {
      console.warn(`PayTR Callback: Order not found for merchant_oid: ${merchantOid}`)
      // PayTR'a yine de "OK" dön
      return new NextResponse('OK', { status: 200 })
    }

    // PayTR status'una göre sipariş durumunu güncelle
    // PayTR status: "success" = ödeme başarılı, diğerleri = başarısız/iptal
    if (status === 'success') {
      // Ödeme başarılı - Transaction içinde siparişi PAID yap ve stok azalt
      await prisma.$transaction(async (tx) => {
        // Siparişi PAID olarak güncelle
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'PAID',
            paytrRefCode: paymentId || null,
          },
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

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Order updated to PAID and stock reduced: ${merchantOid}`, {
          orderId: order.id,
          paymentId,
          totalAmount,
          itemsCount: order.items.length,
        })
      }
    } else {
      // Ödeme başarısız veya iptal edildi - sadece durumu güncelle (stok azaltma)
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          paytrRefCode: paymentId || null,
        },
      })

      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ Order cancelled: ${merchantOid}`, {
          orderId: order.id,
          status,
          paymentId,
        })
      }
    }

    // TODO: Hash doğrulama (PayTR dokümantasyonuna göre hash kontrolü yapılabilir)
    // Şu an için hash kontrolü yapmıyoruz, ama production'da eklenebilir

    // PayTR her zaman "OK" bekler
    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    console.error('PayTR callback error:', errorMessage)
    
    if (process.env.NODE_ENV === 'development') {
      console.error('PayTR callback full error:', error)
    }
    
    // PayTR'a hata olsa bile "OK" dön (retry'i önlemek için)
    return new NextResponse('OK', { status: 200 })
  }
}
