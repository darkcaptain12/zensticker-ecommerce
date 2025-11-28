import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Truck, Heart } from 'lucide-react'
import { getCarrierName } from '@/lib/shipping'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/giris')
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
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
      <h1 className="text-3xl font-bold mb-8">Profilim</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hesap Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>Ad Soyad:</strong> {session.user.name}
              </p>
              <p>
                <strong>E-posta:</strong> {session.user.email}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Menü</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/profil/favoriler">
                <Button variant="ghost" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Favorilerim
                </Button>
              </Link>
              <Link href="/profil/adresler">
                <Button variant="ghost" className="w-full justify-start">
                  Adreslerim
                </Button>
              </Link>
              <Link href="/profil/ayarlar">
                <Button variant="ghost" className="w-full justify-start">
                  Hesap Ayarları
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Siparişlerim</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-gray-600">Henüz siparişiniz bulunmamaktadır.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(order.totalAmount)}</p>
                          <p className="text-sm text-gray-600">
                            {statusLabels[order.status] || order.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {order.items.length} ürün
                        </p>
                      </div>
                      {/* Kargo Bilgileri */}
                      {order.shippingCarrier && order.trackingNumber ? (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">
                            Kargo Firması: <span className="font-semibold text-foreground">{getCarrierName(order.shippingCarrier)}</span>
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Takip No: <span className="font-mono font-semibold text-primary">{order.trackingNumber}</span>
                          </p>
                          <Link href={`/kargo-takip/${order.id}`}>
                            <Button variant="default" size="sm" className="w-full">
                              <Truck className="h-4 w-4 mr-2" />
                              Kargomu Takip Et
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <p className="text-sm text-muted-foreground italic">
                            Kargo bilgisi henüz eklenmedi.
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        <Link href={`/siparis-tesekkur/${order.orderNumber}`}>
                          <Button variant="outline" size="sm">
                            Detayları Gör
                          </Button>
                        </Link>
                        {/* Legacy tracking link */}
                        {order.cargoTrackingNo && !order.shippingCarrier && (
                          <Link href={`/kargo-takip?trackingNumber=${order.cargoTrackingNo}`}>
                            <Button variant="default" size="sm">
                              <Truck className="h-4 w-4 mr-2" />
                              Kargoyu Takip Et
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

