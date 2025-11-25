import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { UpdateOrderStatus } from '@/components/admin/UpdateOrderStatus'
import { CreateLabelButton } from '@/components/admin/CreateLabelButton'
import { BulkCreateLabels } from '@/components/admin/BulkCreateLabels'
import { BulkUpdateStatus } from '@/components/admin/BulkUpdateStatus'
import { UpdateOrderStatusButton } from '@/components/admin/UpdateOrderStatusButton'
import { OrderSelectionProvider } from '@/components/admin/OrderSelectionContext'
import { OrderCheckbox } from '@/components/admin/OrderCheckbox'
import { ShippingInfoForm } from '@/components/admin/ShippingInfoForm'
import { getCarrierName } from '@/lib/shipping'
import { Package, User, Mail, Phone, MapPin, Truck, Calendar, DollarSign, FileText, ExternalLink } from 'lucide-react'
import Image from 'next/image'

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                where: { isMain: true },
                take: 1,
              },
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      campaign: {
        select: {
          title: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
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

  const statusColors: { [key: string]: string } = {
    PENDING: 'bg-gray-500',
    AWAITING_PAYMENT: 'bg-yellow-500',
    PAID: 'bg-blue-500',
    PREPARING: 'bg-purple-500',
    SHIPPED: 'bg-indigo-500',
    DELIVERED: 'bg-green-500',
    CANCELLED: 'bg-red-500',
  }

  return (
    <OrderSelectionProvider>
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Siparişler</h1>
            <p className="text-muted-foreground mt-1">Tüm siparişleri görüntüleyin ve yönetin</p>
          </div>
        </div>

        {/* Bulk Create Labels */}
        <BulkCreateLabels
          orders={orders.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            cargoTrackingNo: o.cargoTrackingNo,
          }))}
        />

        {/* Bulk Update Status */}
        <BulkUpdateStatus
          orders={orders.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            status: o.status,
          }))}
        />

        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <OrderCheckbox orderId={order.id} />
                      <CardTitle className="text-xl font-bold text-foreground">
                        #{order.orderNumber}
                      </CardTitle>
                    <Badge
                      className={`${statusColors[order.status] || 'bg-gray-500'} text-white`}
                    >
                      {statusLabels[order.status] || order.status}
                    </Badge>
                    {order.campaign && (
                      <Badge variant="outline" className="text-xs">
                        🎉 {order.campaign.title}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-foreground">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      <span>{order.items.length} ürün</span>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <UpdateOrderStatus
                    order={{
                      id: order.id,
                      status: order.status,
                      shippingCode: order.shippingCode,
                    }}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Müşteri Bilgileri */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Müşteri Bilgileri
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">{order.customerName}</p>
                        {order.user && (
                          <p className="text-xs text-muted-foreground">
                            (Kayıtlı Kullanıcı: {order.user.name})
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <a
                        href={`mailto:${order.customerEmail}`}
                        className="text-primary hover:underline break-all"
                      >
                        {order.customerEmail}
                      </a>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="text-primary hover:underline"
                      >
                        {order.customerPhone}
                      </a>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground break-words">{order.customerAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Kargo Bilgileri */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Kargo Bilgileri
                  </h3>
                  <div className="space-y-3 text-sm">
                    {/* New Shipping Info (shippingCarrier, trackingNumber, trackingUrl) */}
                    {order.shippingCarrier && order.trackingNumber ? (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <p className="text-muted-foreground mb-1 text-xs">Kargo Firması:</p>
                        <p className="font-semibold text-primary mb-2">
                          {getCarrierName(order.shippingCarrier)}
                        </p>
                        <p className="text-muted-foreground mb-1 text-xs">Takip Numarası:</p>
                        <p className="font-mono font-semibold text-primary mb-3">
                          {order.trackingNumber}
                        </p>
                        {order.trackingUrl && (
                          <a
                            href={`/kargo-takip/${order.id}`}
                            target="_blank"
                            className="text-xs text-primary hover:underline flex items-center gap-1 mb-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Kargo Takibi
                          </a>
                        )}
                        <div className="mt-3 pt-3 border-t">
                          <ShippingInfoForm
                            orderId={order.id}
                            currentCarrier={order.shippingCarrier}
                            currentTrackingNumber={order.trackingNumber}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <p className="text-muted-foreground mb-3 text-xs">
                          Kargo bilgileri henüz eklenmedi
                        </p>
                        <ShippingInfoForm
                          orderId={order.id}
                          currentCarrier={order.shippingCarrier}
                          currentTrackingNumber={order.trackingNumber}
                        />
                      </div>
                    )}

                    {/* DHL Shipment Info (Legacy) */}
                    {order.cargoTrackingNo ? (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-muted-foreground mb-1 text-xs">DHL Takip Numarası:</p>
                        <p className="font-mono font-semibold text-primary mb-2">
                          {order.cargoTrackingNo}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={`/kargo-takip?trackingNumber=${order.cargoTrackingNo}`}
                            target="_blank"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Kargo Takibi
                          </a>
                          {order.shipmentLabelUrl && (
                            <a
                              href={order.shipmentLabelUrl}
                              target="_blank"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <FileText className="h-3 w-3" />
                              Etiketi Gör
                            </a>
                          )}
                        </div>
                        {order.cargoCompany && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Kargo: {order.cargoCompany}
                          </p>
                        )}
                        {order.shipmentStatus && (
                          <p className="text-xs text-muted-foreground">
                            Durum: {order.shipmentStatus}
                          </p>
                        )}
                        {/* Kargoya Verildi butonu - PREPARING durumundaki siparişler için */}
                        {order.status === 'PREPARING' && (
                          <div className="mt-3 pt-3 border-t">
                            <UpdateOrderStatusButton
                              orderId={order.id}
                              currentStatus={order.status}
                              targetStatus="SHIPPED"
                              label="Kargoya Verildi Olarak İşaretle"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-muted-foreground italic text-xs">
                          Henüz DHL etiketi oluşturulmamış
                        </p>
                        <CreateLabelButton
                          orderId={order.id}
                          orderNumber={order.orderNumber}
                          hasTrackingNumber={!!order.cargoTrackingNo}
                        />
                      </div>
                    )}
                    {/* Legacy shipping code */}
                    {order.shippingCode && !order.cargoTrackingNo && (
                      <div>
                        <p className="text-muted-foreground mb-1">Eski Takip Kodu:</p>
                        <p className="font-mono font-semibold text-primary bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs">
                          {order.shippingCode}
                        </p>
                      </div>
                    )}
                    {order.paymentProvider && (
                      <div>
                        <p className="text-muted-foreground mb-1">Ödeme Yöntemi:</p>
                        <p className="font-medium text-foreground">{order.paymentProvider}</p>
                      </div>
                    )}
                    {order.paytrRefCode && (
                      <div>
                        <p className="text-muted-foreground mb-1">Ödeme Referans:</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {order.paytrRefCode}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notlar */}
                {order.notes && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Notlar
                    </h3>
                    <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      {order.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Sipariş Ürünleri */}
              <div className="mt-6 border-t pt-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Sipariş Ürünleri ({order.items.length})
                </h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border"
                    >
                      {/* Ürün Görseli */}
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {item.product.images && item.product.images.length > 0 ? (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Ürün Detayları */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1">
                              {item.product.name}
                            </h4>
                            {item.product.category && (
                              <p className="text-xs text-muted-foreground mb-2">
                                Kategori: {item.product.category.name}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-3 text-sm">
                              <span className="text-muted-foreground">
                                Adet: <span className="font-semibold text-foreground">{item.quantity}</span>
                              </span>
                              <span className="text-muted-foreground">
                                Birim Fiyat: <span className="font-semibold text-foreground">{formatPrice(item.unitPrice)}</span>
                              </span>
                              <span className="text-muted-foreground">
                                Toplam: <span className="font-semibold text-primary">{formatPrice(item.lineTotal)}</span>
                              </span>
                            </div>

                            {/* Kişiselleştirme Bilgileri */}
                            {item.customText && (
                              <div className="mt-3 p-3 bg-white dark:bg-gray-900 border border-primary/20 rounded-lg">
                                <p className="text-xs font-semibold text-primary mb-2">
                                  🎨 Kişiselleştirme Detayları:
                                </p>
                                <div className="space-y-1">
                                  <p className="text-sm text-foreground">
                                    <span className="font-medium">Yazı:</span>{' '}
                                    <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                      "{item.customText}"
                                    </span>
                                  </p>
                                  {item.customFont && (
                                    <p className="text-sm text-foreground">
                                      <span className="font-medium">Font:</span>{' '}
                                      <span
                                        className="font-semibold"
                                        style={{ fontFamily: item.customFont }}
                                      >
                                        {item.customFont}
                                      </span>
                                    </p>
                                  )}
                                  {item.customFont && item.customText && (
                                    <div className="mt-2 p-2 bg-white dark:bg-gray-800 border rounded">
                                      <p
                                        className="text-lg font-bold text-center"
                                        style={{ fontFamily: item.customFont }}
                                      >
                                        {item.customText}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">Henüz sipariş yok</p>
            <p className="text-muted-foreground">
              Müşteriler sipariş verdikçe burada görünecek
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </OrderSelectionProvider>
  )
}
