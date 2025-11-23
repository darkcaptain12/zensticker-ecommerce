import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { UpdateOrderStatus } from '@/components/admin/UpdateOrderStatus'

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
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
    orderBy: { createdAt: 'desc' },
    take: 50,
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
    <div>
      <h1 className="text-3xl font-bold mb-8">Siparişler</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{order.orderNumber}</h3>
                  <p className="text-sm text-gray-600">
                    {order.customerName} - {order.customerEmail}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                  <p className="text-sm">
                    {order.items.length} ürün - {formatPrice(order.totalAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <UpdateOrderStatus order={order} />
                  {order.shippingCode && (
                    <p className="text-sm text-gray-600 mt-2">
                      Kargo: {order.shippingCode}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

