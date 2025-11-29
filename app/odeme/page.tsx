'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Image from 'next/image'
import { formatPrice, generateOrderNumber } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { turkiyeIller, getIlcelerByIl } from '@/lib/turkiye-iller'

export default function CheckoutPage() {
  const { data: session } = useSession()
  const { items, finalTotal, campaignDiscount, subtotal } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showIframe, setShowIframe] = useState(false)
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    customerName: session?.user?.name || '',
    customerEmail: session?.user?.email || '',
    customerPhone: '',
    il: '',
    ilce: '',
    acikAdres: '',
  })
  const [selectedIlceler, setSelectedIlceler] = useState<string[]>([])
  const [shippingSettings, setShippingSettings] = useState<{
    freeShippingThreshold: number | null
    shippingCost: number | null
  }>({ freeShippingThreshold: null, shippingCost: 25 })

  // Client-side mount kontrolü
  useEffect(() => {
    setMounted(true)
  }, [])

  // Site ayarlarını yükle
  useEffect(() => {
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        setShippingSettings({
          freeShippingThreshold: data.freeShippingThreshold ?? null,
          shippingCost: data.shippingCost ?? 25,
        })
      })
      .catch(() => {
        // Default values already set
      })
  }, [])

  // Sepet boşsa yönlendir (sadece client-side)
  useEffect(() => {
    if (mounted && items.length === 0 && !showIframe) {
      router.push('/sepet')
    }
  }, [mounted, items.length, showIframe, router])

  // SSR sırasında veya sepet boşsa loading göster (404 hatası vermemek için)
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  // Client-side'da sepet boşsa yönlendirme yapılacak, bu arada loading göster
  if (items.length === 0 && !showIframe) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600">Yönlendiriliyor...</p>
          </div>
        </div>
      </div>
    )
  }

  // Kargo ücreti hesapla
  const calculateShippingCost = (): number => {
    if (shippingSettings.freeShippingThreshold === null) {
      // Eşik yoksa her zaman ücretsiz
      return 0
    }
    if (finalTotal >= shippingSettings.freeShippingThreshold) {
      return 0
    }
    // shippingCost null/undefined ise 25, değilse number olarak döndür
    const cost = shippingSettings.shippingCost ?? 25
    return Number.isFinite(cost) ? Number(cost) : 0
  }

  const shippingCost = calculateShippingCost()
  // total hesaplaması - NaN kontrolü ile
  const total = Number.isFinite(finalTotal) && Number.isFinite(shippingCost)
    ? Number((finalTotal + shippingCost).toFixed(2))
    : 0

  const handleIlChange = (il: string) => {
    const ilceler = getIlcelerByIl(il)
    setSelectedIlceler(ilceler)
    setFormData({ ...formData, il, ilce: '' }) // İl değişince ilçe sıfırlanır
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasyonlar
    if (!formData.customerPhone.trim()) {
      alert('Lütfen telefon numarası giriniz')
      return
    }

    if (!formData.il || !formData.ilce || !formData.acikAdres.trim()) {
      alert('Lütfen tüm adres bilgilerini doldurunuz')
      return
    }

    // Adres birleştir
    const fullAddress = `${formData.acikAdres}, ${formData.ilce}, ${formData.il}`

    setLoading(true)

    try {
      // Order number oluştur
      const orderNumber = generateOrderNumber()

      // Amount'ı number olarak garantile (NaN kontrolü)
      const paymentAmount = Number.isFinite(total) && total >= 0 ? Number(total) : 0
      
      // Basket items'ı hazırla - price'ları number olarak garantile
      const basketItems = items.map((item) => {
        const itemPrice = item.salePrice || item.price
        const price = Number.isFinite(itemPrice) ? Number(itemPrice) : 0
        const quantity = Number.isFinite(item.quantity) && item.quantity > 0 ? Number(item.quantity) : 1
        
        return {
          productId: item.productId, // Sipariş kaydı için gerekli
          name: String(item.name || '').substring(0, 255), // PayTR max 255 karakter
          price: price,
          quantity: quantity,
          customText: item.customText || undefined,
          customFont: item.customFont || undefined,
        }
      })

      // Development ortamında debug log
      if (process.env.NODE_ENV === 'development') {
        console.log('PayTR Request Payload:', {
          orderNumber,
          amount: paymentAmount,
          amountType: typeof paymentAmount,
          email: formData.customerEmail,
          userName: formData.customerName,
          basketItemsCount: basketItems.length,
          basketItems: basketItems.map(item => ({
            name: item.name.substring(0, 30),
            price: item.price,
            quantity: item.quantity,
          })),
          shippingCost,
          finalTotal,
          total,
        })
      }

      // PayTR init endpoint'ine istek at
      const response = await fetch('/api/paytr/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          amount: paymentAmount, // Number olarak gönder
          email: formData.customerEmail.trim(),
          userName: formData.customerName.trim(),
          userPhone: formData.customerPhone.replace(/\s/g, '').trim(), // Boşlukları kaldır
          userAddress: fullAddress.trim(),
          userCity: formData.il.trim(),
          userCountry: 'Türkiye',
          basketItems: basketItems,
        }),
      })

      const data = await response.json()

      // Development ortamında response log
      if (process.env.NODE_ENV === 'development') {
        console.log('PayTR Response:', {
          status: response.status,
          ok: data.ok,
          hasToken: !!data.token,
          error: data.error,
        })
      }

      if (data.ok && data.token) {
        // PayTR iframe URL'ini oluştur
        const iframeUrl = `https://www.paytr.com/odeme/guvenli/${data.token}`
        setIframeUrl(iframeUrl)
        setShowIframe(true)
      } else {
        const errorMessage = data.error || 'Ödeme başlatılamadı'
        console.error('PayTR Init Error:', errorMessage, {
          status: response.status,
          responseData: data,
        })
        alert(errorMessage)
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
                    placeholder="Telefon numaranız"
                  />
                </div>
                <div>
                  <Label htmlFor="il">İl *</Label>
                  <Select
                    value={formData.il}
                    onValueChange={handleIlChange}
                    required
                  >
                    <SelectTrigger id="il">
                      <SelectValue placeholder="İl seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {turkiyeIller.map((il) => (
                        <SelectItem key={il.name} value={il.name}>
                          {il.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.il && (
                  <div>
                    <Label htmlFor="ilce">İlçe *</Label>
                    <Select
                      value={formData.ilce}
                      onValueChange={(ilce) => setFormData({ ...formData, ilce })}
                      required
                      disabled={!formData.il}
                    >
                      <SelectTrigger id="ilce">
                        <SelectValue placeholder="İlçe seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedIlceler.map((ilce) => (
                          <SelectItem key={ilce} value={ilce}>
                            {ilce}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label htmlFor="acikAdres">Açık Adres *</Label>
                  <Textarea
                    id="acikAdres"
                    required
                    value={formData.acikAdres}
                    onChange={(e) =>
                      setFormData({ ...formData, acikAdres: e.target.value })
                    }
                    rows={4}
                    placeholder="Mahalle, sokak, bina no, daire no vb."
                    disabled={!formData.il || !formData.ilce}
                  />
                  {(!formData.il || !formData.ilce) && (
                    <p className="text-sm text-gray-500 mt-1">
                      Önce il ve ilçe seçiniz
                    </p>
                  )}
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
                    <span>{shippingCost === 0 ? 'Ücretsiz' : formatPrice(shippingCost)}</span>
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
