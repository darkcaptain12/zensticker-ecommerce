import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Package } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default async function OrderThankYouPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isMain: true }, take: 1 },
            },
          },
        },
      },
    },
  })

  if (!order) {
    notFound()
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
      <div className="text-center mb-8">
        <CheckCircle className="h-24 w-24 mx-auto text-green-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Siparişiniz Alındı!</h1>
        <p className="text-gray-600">
          Sipariş numaranız: <strong>{order.orderNumber}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Sipariş Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Durum:</strong> {statusLabels[order.status] || order.status}
            </p>
            <p>
              <strong>Toplam:</strong> {formatPrice(order.totalAmount)}
            </p>
            <p>
              <strong>Tarih:</strong>{' '}
              {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {order.shippingCode && (
              <p>
                <strong>Kargo Takip:</strong> {order.shippingCode}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teslimat Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Ad Soyad:</strong> {order.customerName}
            </p>
            <p>
              <strong>E-posta:</strong> {order.customerEmail}
            </p>
            <p>
              <strong>Telefon:</strong> {order.customerPhone}
            </p>
            <p>
              <strong>Adres:</strong> {order.customerAddress}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sipariş Detayları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                  {item.product.images[0] ? (
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  {item.customText && (
                    <p className="text-sm text-gray-600">
                      Özel Metin: {item.customText}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    {item.quantity} x {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(item.lineTotal)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-lg font-bold">
              <span>Toplam</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        <Link href="/kargo-takip">
          <Button variant="outline">Kargo Takip</Button>
        </Link>
        <Link href="/">
          <Button>Ana Sayfaya Dön</Button>
        </Link>
      </div>
    </div>
  )
}

