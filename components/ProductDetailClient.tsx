'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, CreditCard } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: number
  salePrice?: number | null
  stock: number
  isCustomizable: boolean
  images: Array<{ url: string; altText?: string | null }>
  customOptions?: {
    availableFonts: string[]
    maxCharacters: number
    label: string
  } | null
}

export function ProductDetailClient({ product }: { product: Product }) {
  const { addItem } = useCart()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [customText, setCustomText] = useState('')
  const [selectedFont, setSelectedFont] = useState(
    product.customOptions?.availableFonts?.[0] || 'Arial'
  )
  const [adding, setAdding] = useState(false)

  const handleAddToCart = () => {
    if (product.stock < quantity) {
      alert('Yeterli stok bulunmamaktadır')
      return
    }

    setAdding(true)
    const mainImage = product.images[0]?.url || '/placeholder-product.jpg'

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice || undefined,
      image: mainImage,
      quantity,
      customText: product.isCustomizable ? customText : undefined,
      customFont: product.isCustomizable ? selectedFont : undefined,
    })

    setTimeout(() => {
      setAdding(false)
      router.push('/sepet')
    }, 300)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    setTimeout(() => {
      router.push('/odeme')
    }, 500)
  }

  return (
    <div className="space-y-6">
      {/* Quantity Selector */}
      <div>
        <Label htmlFor="quantity">Adet</Label>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            -
          </Button>
          <Input
            id="quantity"
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
            className="w-20 text-center"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
          >
            +
          </Button>
        </div>
      </div>

      {/* Custom Sticker Options */}
      {product.isCustomizable && product.customOptions && product.customOptions.availableFonts && (
        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="customText">{product.customOptions.label}</Label>
            <Input
              id="customText"
              value={customText}
              onChange={(e) => {
                const text = e.target.value
                if (text.length <= product.customOptions!.maxCharacters) {
                  setCustomText(text)
                }
              }}
              placeholder="Sticker üzerinde yazacak metin"
              className="mt-2"
              maxLength={product.customOptions.maxCharacters}
            />
            <p className="text-xs text-gray-500 mt-1">
              {customText.length} / {product.customOptions.maxCharacters} karakter
            </p>

            <div className="mt-4">
              <Label htmlFor="font">Font Seçimi</Label>
              <Select value={selectedFont} onValueChange={setSelectedFont}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {product.customOptions.availableFonts.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Live Preview */}
            {customText && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Önizleme:</p>
                <div
                  className="text-2xl font-bold text-center p-4 bg-white rounded border"
                  style={{ fontFamily: selectedFont }}
                >
                  {customText || 'Metin giriniz...'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 sticky bottom-0 bg-white p-4 -mx-4 border-t sm:relative sm:border-0 sm:p-0">
        <Button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className="flex-1"
          size="lg"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {adding ? 'Ekleniyor...' : 'Sepete Ekle'}
        </Button>
        <Button
          onClick={handleBuyNow}
          disabled={adding || product.stock === 0}
          variant="default"
          className="flex-1"
          size="lg"
        >
          <CreditCard className="h-5 w-5 mr-2" />
          Hemen Satın Al
        </Button>
      </div>
    </div>
  )
}

