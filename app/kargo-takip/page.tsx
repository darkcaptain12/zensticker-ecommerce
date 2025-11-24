'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Package } from 'lucide-react'
import { ShipmentTrackingCard } from '@/components/shipping/ShipmentTrackingCard'
import Link from 'next/link'

interface ShipmentInfo {
  trackingNumber: string
  cargoCompany: string
  status: string
  labelUrl: string
  externalTrackingUrl?: string
  orderNumber: string
  customerName: string
  createdAt: Date | string
  lastSync?: Date | string
}

export default function OrderTrackingPage() {
  const { data: session } = useSession()
  const [searchValue, setSearchValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [shipment, setShipment] = useState<ShipmentInfo | null>(null)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchValue.trim()) {
      setError('Lütfen sipariş numarası veya takip numarası girin')
      return
    }

    setLoading(true)
    setError('')
    setShipment(null)

    try {
      // Try orderNumber first, then trackingNumber
      const response = await fetch(
        `/api/kargo-takip?orderNumber=${encodeURIComponent(searchValue)}&trackingNumber=${encodeURIComponent(searchValue)}`
      )
      const data = await response.json()

      if (data.success && data.shipment) {
        setShipment(data.shipment)
      } else if (data.success && data.order) {
        // Order found but no shipment yet
        setError('Bu sipariş için henüz kargo etiketi oluşturulmamış.')
      } else {
        setError(data.error || 'Sipariş bulunamadı')
      }
    } catch (error) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Kargo Takip</h1>

      {/* Search Form */}
      <Card className="max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>
            {session ? 'Kargo Takip Sorgula' : 'Sipariş veya Kargo Takip Sorgula'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <Label htmlFor="searchValue">
                Sipariş Numarası veya Kargo Takip Numarası
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="searchValue"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Sipariş numarası veya takip numarası girin"
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

      {/* Shipment Info */}
      {shipment && (
        <div className="max-w-2xl mx-auto">
          <ShipmentTrackingCard
            trackingNumber={shipment.trackingNumber}
            cargoCompany={shipment.cargoCompany}
            status={shipment.status}
            externalTrackingUrl={shipment.externalTrackingUrl}
            labelUrl={shipment.labelUrl}
            orderNumber={shipment.orderNumber}
            customerName={shipment.customerName}
            lastSync={shipment.lastSync}
          />
        </div>
      )}

      {/* Info for logged-in users */}
      {session && !shipment && !loading && !error && (
        <div className="text-center py-12">
          <Package className="h-24 w-24 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">
            Sipariş numaranızı veya kargo takip numaranızı girerek sorgulama yapabilirsiniz.
          </p>
          <p className="text-sm text-gray-500">
            Veya{' '}
            <Link href="/profil" className="text-primary hover:underline">
              profil sayfanızdan
            </Link>
            {' '}siparişlerinizi görüntüleyebilirsiniz.
          </p>
        </div>
      )}

      {/* Info for non-logged-in users */}
      {!session && !shipment && !loading && !error && (
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
    </div>
  )
}
