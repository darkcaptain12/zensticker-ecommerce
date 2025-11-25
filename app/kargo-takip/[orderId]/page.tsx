export const dynamic = 'force-dynamic'

import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { getCarrierName } from '@/lib/shipping'
import { Truck, Package, Calendar, DollarSign } from 'lucide-react'

export default async function KargoTakipPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/giris')
  }

  const { orderId } = await params

  // Fetch order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
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

  if (!order) {
    notFound()
  }

  // Check if user owns this order
  if (order.userId && order.userId !== session.user.id) {
    redirect('/profil')
  }

  // Also check by email for guest orders
  if (!order.userId && order.customerEmail !== session.user.email) {
    redirect('/profil')
  }

  const statusLabels: { [key: string]: string } = {
    PENDING: 'Beklemede',
    AWAITING_PAYMENT: 'Ödeme Bekleniyor',
    PAID: 'Ödendi',
    PREPARING: 'Hazırlanıyor',
    SHIPPED: 'Kargoya Verildi',
    DELIVERED: 'Teslim Edildi',
    CANCELLED: 'İptal Edildi',
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Kargo Takibi</h1>

      {/* Order Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sipariş Özeti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Sipariş No</p>
                <p className="font-semibold">{order.orderNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Sipariş Tarihi</p>
                <p className="font-semibold">
                  {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                <p className="font-semibold">{formatPrice(order.totalAmount)}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">Durum:</p>
            <p className="font-semibold">
              {statusLabels[order.status] || order.status}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Info */}
      {order.trackingUrl ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Kargo Takip Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Kargo Firması: <span className="font-semibold text-foreground">{getCarrierName(order.shippingCarrier)}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Takip Numarası: <span className="font-mono font-semibold text-primary">{order.trackingNumber}</span>
              </p>
            </div>

            {/* Iframe for tracking */}
            <div className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
              <iframe
                src={order.trackingUrl}
                className="w-full h-[600px] border-0"
                loading="lazy"
                title="Kargo Takip"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>

            <p className="text-xs text-muted-foreground mt-4 italic">
              Kargo durumunuz, resmi kargo firmasının sayfasından çekilmektedir.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">
              Kargo bilgisi bulunamadı
            </p>
            <p className="text-muted-foreground">
              Bu sipariş için kargo bilgisi henüz eklenmemiş.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

