import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Package } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

async function OrderSuccessContent({ orderNumber }: { orderNumber: string }) {
  // Önce siparişi bul (temizlenmiş orderNumber ile de dene)
  let order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isMain: true }, take: 1 },
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

  // Eğer bulunamadıysa, temizlenmiş orderNumber ile ara (PayTR merchant_oid formatı)
  if (!order) {
    const cleanedOrderNumber = orderNumber.replace(/[^A-Za-z0-9]/g, '')
    const recentOrders = await prisma.order.findMany({
      where: {
        status: 'AWAITING_PAYMENT',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      select: { orderNumber: true },
      take: 50,
    })
    
    for (const recentOrder of recentOrders) {
      const cleaned = recentOrder.orderNumber.replace(/[^A-Za-z0-9]/g, '')
      if (cleaned === cleanedOrderNumber) {
        order = await prisma.order.findUnique({
          where: { orderNumber: recentOrder.orderNumber },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    images: { where: { isMain: true }, take: 1 },
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

  // Eğer sipariş bulundu ve AWAITING_PAYMENT durumundaysa, PAID yap ve stok azalt
  if (order && order.status === 'AWAITING_PAYMENT') {
    console.log(`🔄 Success page: Updating order ${order.orderNumber} from AWAITING_PAYMENT to PAID`)
    
    try {
      await prisma.$transaction(async (tx) => {
        // Siparişi PAID yap
        await tx.order.update({
          where: { id: order!.id },
          data: { status: 'PAID' },
        })

        // Stok azalt
        for (const item of order!.items) {
          if (item.variant) {
            // Varyantlı ürün
            await tx.productVariant.update({
              where: { id: item.variant.id },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            })
          } else {
            // Varyantsız ürün
            await tx.product.update({
              where: { id: item.product.id },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            })
          }
        }
      })
      
      console.log(`✅ Success page: Order ${order.orderNumber} updated to PAID`)
      
      // Siparişi tekrar yükle (güncellenmiş durumla)
      order = await prisma.order.findUnique({
        where: { orderNumber: order.orderNumber },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { where: { isMain: true }, take: 1 },
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
    } catch (error) {
      console.error(`❌ Success page: Error updating order ${order.orderNumber}:`, error)
    }
  }

  if (!order) {
    // Sipariş bulunamadı ama ödeme başarılı mesajı göster
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Ödeme Başarılı!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Ödemeniz başarıyla tamamlandı. Siparişiniz en kısa sürede hazırlanacaktır.
          </p>
          <p className="text-sm text-gray-500">
            Sipariş No: {orderNumber}
          </p>
          <div className="pt-4">
            <Link href="/">
              <Button className="w-full">Ana Sayfaya Dön</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Ödeme Başarılı!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-gray-600">
            Ödemeniz başarıyla tamamlandı. Siparişiniz en kısa sürede hazırlanacaktır.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">Sipariş No:</span>
              <span className="font-mono">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Toplam Tutar:</span>
              <span className="font-bold text-green-600">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Durum:</span>
              <span className="capitalize">
                {order.status === 'PAID' ? 'Ödendi' : 
                 order.status === 'AWAITING_PAYMENT' ? 'Ödeme Bekleniyor' :
                 order.status === 'PREPARING' ? 'Hazırlanıyor' :
                 order.status}
              </span>
            </div>
          </div>
        </div>

        {order.items.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Sipariş Detayları</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.product.name} x {item.quantity}
                    {item.customText && (
                      <span className="text-gray-500 ml-2">({item.customText})</span>
                    )}
                  </span>
                  <span>{formatPrice(item.lineTotal)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 space-y-2">
          <Link href={`/siparis-tesekkur/${order.orderNumber}`} className="block">
            <Button className="w-full" variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Sipariş Detaylarını Gör
            </Button>
          </Link>
          <Link href="/">
            <Button className="w-full">Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function PaytrSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNumber?: string }>
}) {
  const params = await searchParams
  const orderNumber = params?.orderNumber

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Suspense
          fallback={
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">Yükleniyor...</p>
              </CardContent>
            </Card>
          }
        >
          {orderNumber ? (
            <OrderSuccessContent orderNumber={orderNumber} />
          ) : (
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Ödeme Başarılı!</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  Ödemeniz başarıyla tamamlandı. Siparişiniz en kısa sürede hazırlanacaktır.
                </p>
                <div className="pt-4">
                  <Link href="/">
                    <Button className="w-full">Ana Sayfaya Dön</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </Suspense>
      </div>
    </div>
  )
}
