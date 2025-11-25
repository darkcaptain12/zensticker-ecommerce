'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const { data: session } = useSession()
  const { items, finalTotal, campaignDiscount, subtotal } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showIframe, setShowIframe] = useState(false)
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    customerName: session?.user?.name || '',
    customerEmail: session?.user?.email || '',
    customerPhone: '',
    customerAddress: '',
  })

  // Sepet boşsa yönlendir
  if (items.length === 0 && !showIframe) {
    router.push('/sepet')
    return null
  }

  // Kargo ücreti hesapla
  const shippingCost = finalTotal >= 200 ? 0 : 25
  const total = finalTotal + shippingCost

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // PayTR init endpoint'ine istek at
      const response = await fetch('/api/paytr/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          customerAddress: formData.customerAddress,
          items: items.map((item) => ({
            name: item.name,
            price: item.salePrice || item.price,
            quantity: item.quantity,
          })),
          total,
        }),
      })

      const data = await response.json()

      if (data.status === 'success' && data.iframeUrl) {
        // Iframe'i göster
        setIframeUrl(data.iframeUrl)
        setShowIframe(true)
      } else {
        alert(data.reason || 'Ödeme başlatılamadı')
        setLoading(false)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Bir hata oluştu')
      setLoading(false)
    }
  }

  // Iframe gösteriliyorsa sadece iframe'i göster
  if (showIframe && iframeUrl) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Ödeme</h1>
        <Card>
          <CardContent className="p-0">
            <iframe
              src={iframeUrl}
              className="w-full"
              style={{ minHeight: '700px', border: 'none' }}
              title="PayTR Ödeme"
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Normal form görünümü
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Ödeme</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>İletişim Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Ad Soyad *</Label>
                  <Input
                    id="customerName"
                    required
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">E-posta *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, customerEmail: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Telefon *</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, customerPhone: e.target.value })
                    }
                    placeholder="05XX XXX XX XX"
                  />
                </div>
                <div>
                  <Label htmlFor="customerAddress">Teslimat Adresi *</Label>
                  <Textarea
                    id="customerAddress"
                    required
                    value={formData.customerAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, customerAddress: e.target.value })
                    }
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Sipariş Özeti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.customText || ''}`} className="flex gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-600">
                          {item.quantity} x {formatPrice(item.salePrice || item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Ara Toplam</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {campaignDiscount && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        🎉 Kampanya İndirimi ({campaignDiscount.title})
                        {campaignDiscount.discountPercent && ` %${campaignDiscount.discountPercent}`}
                      </span>
                      <span>-{formatPrice(campaignDiscount.calculatedDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Kargo</span>
                    <span>{finalTotal >= 200 ? 'Ücretsiz' : '25₺'}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Toplam</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full mt-6"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'İşleniyor...' : 'Ödemeye Geç'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
