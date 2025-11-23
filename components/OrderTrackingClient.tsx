'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Package, Search, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

interface OrderItem {
  product: {
    name: string
    images: Array<{ url: string }>
  }
  quantity: number
  unitPrice: number
}

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  shippingCode: string | null
  createdAt: Date
  items: OrderItem[]
}

interface OrderTrackingClientProps {
  userOrders: Order[] | null
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

const statusIcons: { [key: string]: any } = {
  PENDING: Clock,
  AWAITING_PAYMENT: Clock,
  PAID: CheckCircle,
  PREPARING: Clock,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
}

const statusColors: { [key: string]: string } = {
  PENDING: 'text-orange-600 bg-orange-50',
  AWAITING_PAYMENT: 'text-yellow-600 bg-yellow-50',
  PAID: 'text-blue-600 bg-blue-50',
  PREPARING: 'text-purple-600 bg-purple-50',
  SHIPPED: 'text-indigo-600 bg-indigo-50',
  DELIVERED: 'text-green-600 bg-green-50',
  CANCELLED: 'text-red-600 bg-red-50',
}

export function OrderTrackingClient({ userOrders }: OrderTrackingClientProps) {
  const { data: session } = useSession()
  const [trackingNumber, setTrackingNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber.trim()) {
      setError('Lütfen sipariş numarası veya kargo takip numarası girin')
      return
    }

    setLoading(true)
    setError('')
    setSearchedOrder(null)

    try {
      const response = await fetch(`/api/kargo-takip?q=${encodeURIComponent(trackingNumber)}`)
      const data = await response.json()

      if (data.success && data.order) {
        setSearchedOrder(data.order)
      } else {
        setError(data.error || 'Sipariş bulunamadı')
      }
    } catch (error) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const renderOrderCard = (order: Order) => {
    const StatusIcon = statusIcons[order.status] || Package
    const statusColor = statusColors[order.status] || 'text-gray-600 bg-gray-50'

    return (
      <Card key={order.id} className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5" />
                Sipariş #{order.orderNumber}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${statusColor}`}>
              <StatusIcon className="h-4 w-4" />
              <span className="font-semibold text-sm">
                {statusLabels[order.status] || order.status}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Kargo Takip Numarası */}
            {order.shippingCode ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Kargo Takip Numarası</p>
                    <p className="font-bold text-lg text-blue-700">{order.shippingCode}</p>
                  </div>
                  <a
                    href={`https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${order.shippingCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    <Truck className="h-5 w-5" />
                    Kargo Firmasından Takip Et
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Kargo takip numarası henüz atanmadı. Siparişiniz hazırlandığında takip numarası otomatik olarak eklenecektir.
                </p>
              </div>
            )}

            {/* Ürünler */}
            <div>
              <h3 className="font-semibold mb-3">Ürünler</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    {item.product.images && item.product.images.length > 0 && (
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">
                        Adet: {item.quantity} × {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Toplam */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-lg">Toplam Tutar</p>
                <p className="font-bold text-xl text-primary">
                  {formatPrice(order.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Kargo Takip</h1>

      {/* Giriş yapmış kullanıcılar için sipariş listesi */}
      {session && userOrders && userOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Siparişlerim</h2>
          {userOrders.map(renderOrderCard)}
        </div>
      )}

      {/* Giriş yapmamış kullanıcılar veya manuel sorgulama */}
      {(!session || searchedOrder) && (
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle>
              {session ? 'Manuel Sorgulama' : 'Sipariş Sorgula'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <Label htmlFor="trackingNumber">
                  Sipariş Numarası veya Kargo Takip Numarası
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="trackingNumber"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="ZEN-XXXXX-XXXX veya kargo takip numarası"
                  />
                  <Button type="submit" disabled={loading}>
                    <Search className="h-4 w-4 mr-2" />
                    {loading ? 'Aranıyor...' : 'Sorgula'}
                  </Button>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sorgulanan sipariş */}
      {searchedOrder && renderOrderCard(searchedOrder)}

      {/* Giriş yapmamış kullanıcılar için bilgilendirme */}
      {!session && !userOrders && !searchedOrder && !loading && !error && (
        <div className="text-center py-12">
          <Package className="h-24 w-24 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">
            Sipariş numaranızı veya kargo takip numaranızı girerek sorgulama yapabilirsiniz.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Daha kolay takip için{' '}
            <Link href="/giris" className="text-primary hover:underline">
              giriş yapın
            </Link>
            {' '}ve siparişlerinizi otomatik görüntüleyin.
          </p>
        </div>
      )}

      {/* Giriş yapmış ama siparişi olmayan kullanıcılar */}
      {session && userOrders && userOrders.length === 0 && !searchedOrder && (
        <div className="text-center py-12">
          <Package className="h-24 w-24 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">
            Henüz siparişiniz bulunmamaktadır.
          </p>
          <Link href="/">
            <Button>Alışverişe Başla</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

