'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, clearCart, campaignDiscount, subtotal, finalTotal } = useCart()
  const [shippingSettings, setShippingSettings] = useState<{
    freeShippingThreshold: number | null
    shippingCost: number | null
  }>({ freeShippingThreshold: null, shippingCost: 25 })

  useEffect(() => {
    fetch('/api/site-settings', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
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

  // Kargo ücreti hesapla
  const calculateShippingCost = () => {
    if (shippingSettings.freeShippingThreshold === null) {
      // Eşik yoksa her zaman ücretsiz
      return 0
    }
    if (finalTotal >= shippingSettings.freeShippingThreshold) {
      return 0
    }
    return shippingSettings.shippingCost ?? 25
  }

  const shippingCost = calculateShippingCost()
  const totalWithShipping = finalTotal + shippingCost

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-24 w-24 mx-auto text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Sepetiniz Boş</h1>
        <p className="text-gray-600 mb-6">Sepetinize ürün ekleyerek alışverişe başlayın</p>
        <Link href="/kategoriler">
          <Button>Alışverişe Başla</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sepetim</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const itemPrice = item.salePrice || item.price
            const itemTotal = itemPrice * item.quantity

            return (
              <Card key={`${item.productId}-${item.customText || ''}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{item.name}</h3>
                      {item.customText && (
                        <p className="text-sm text-gray-600 mb-1">
                          Özel Metin: {item.customText}
                        </p>
                      )}
                      {item.customFont && (
                        <p className="text-sm text-gray-600 mb-1">
                          Font: {item.customFont}
                        </p>
                      )}
                      <p className="text-lg font-bold text-primary mb-2">
                        {formatPrice(itemPrice)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.productId, parseInt(e.target.value) || 1)
                          }
                          className="w-16 text-center"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.productId)}
                          className="ml-auto text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-right mt-2 font-semibold">
                        Toplam: {formatPrice(itemTotal)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Sipariş Özeti</h2>
              <div className="space-y-2 mb-4">
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
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Toplam</span>
                    <span>{formatPrice(totalWithShipping)}</span>
                  </div>
                </div>
              </div>
              <Link href="/odeme" className="block">
                <Button className="w-full" size="lg">
                  Ödemeye Geç
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={clearCart}
              >
                Sepeti Temizle
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

