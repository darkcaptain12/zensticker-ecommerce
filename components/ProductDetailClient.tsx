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
import { useToast } from '@/hooks/use-toast'

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
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [customText, setCustomText] = useState('')
  const [selectedFont, setSelectedFont] = useState(
    product.customOptions?.availableFonts?.[0] || 'Arial'
  )
  const [adding, setAdding] = useState(false)

  const handleAddToCart = () => {
    if (product.stock < quantity) {
      toast({
        variant: 'destructive',
        title: 'Stok Yetersiz',
        description: 'Yeterli stok bulunmamaktadır',
      })
      return
    }

    if (product.isCustomizable && !customText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Metin Gerekli',
        description: 'Lütfen özelleştirme metnini giriniz',
      })
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

    toast({
      title: 'Sepete Eklendi',
      description: `${product.name} sepete eklendi`,
    })

    setTimeout(() => {
      setAdding(false)
      router.push('/sepet')
    }, 500)
  }

  const handleBuyNow = () => {
    if (product.stock < quantity) {
      toast({
        variant: 'destructive',
        title: 'Stok Yetersiz',
        description: 'Yeterli stok bulunmamaktadır',
      })
      return
    }

    if (product.isCustomizable && !customText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Metin Gerekli',
        description: 'Lütfen özelleştirme metnini giriniz',
      })
      return
    }

    handleAddToCart()
    setTimeout(() => {
      router.push('/odeme')
    }, 700)
  }

  return (
    <div className="space-y-6">
      {/* Sticky Mobile Buttons */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background dark:bg-dark-soft border-t border-border dark:border-dark-border p-4 shadow-lg">
        <div className="container mx-auto flex gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={product.stock < quantity || adding || (product.isCustomizable && !customText.trim())}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-neon-lg text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {adding ? 'Ekleniyor...' : 'Sepete Ekle'}
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={product.stock < quantity || adding || (product.isCustomizable && !customText.trim())}
            variant="outline"
            className="flex-1 border-primary hover:bg-primary hover:text-white"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Hızlı Al
          </Button>
        </div>
      </div>
      {/* Quantity Selector */}
      <div>
        <Label htmlFor="quantity" className="text-foreground">Adet</Label>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="border-border dark:border-dark-border text-foreground hover:bg-primary/20 hover:border-primary hover:text-primary"
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
            className="w-20 text-center bg-background dark:bg-dark-soft border-border dark:border-dark-border text-foreground focus:border-primary focus:ring-primary"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="border-border dark:border-dark-border text-foreground hover:bg-primary/20 hover:border-primary hover:text-primary"
          >
            +
          </Button>
        </div>
      </div>

      {/* Custom Sticker Options */}
      {product.isCustomizable && product.customOptions && product.customOptions.availableFonts && (
        <Card className="border border-border dark:border-dark-border bg-card dark:bg-dark-card/50 backdrop-blur-sm rounded-2xl">
          <CardContent className="pt-6">
            <Label htmlFor="customText" className="text-foreground">{product.customOptions.label}</Label>
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
              className="mt-2 bg-background dark:bg-dark-soft border-border dark:border-dark-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              maxLength={product.customOptions.maxCharacters}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {customText.length} / {product.customOptions.maxCharacters} karakter
            </p>

            <div className="mt-4">
              <Label htmlFor="font" className="text-foreground">Font Seçimi</Label>
              <Select value={selectedFont} onValueChange={setSelectedFont}>
                <SelectTrigger className="mt-2 bg-background dark:bg-dark-soft border-border dark:border-dark-border text-foreground focus:border-primary focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card dark:bg-dark-card border-border dark:border-dark-border max-h-[300px]">
                  {product.customOptions.availableFonts.map((font) => (
                    <SelectItem key={font} value={font} className="text-foreground hover:bg-primary/20 focus:bg-primary/20">
                      <span style={{ fontFamily: font }}>{font}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Live Preview */}
            {customText && (
              <div className="mt-4 p-4 border border-primary/30 rounded-xl bg-card/50 dark:bg-dark-card/50 backdrop-blur-sm">
                <p className="text-sm text-primary mb-2 font-semibold">Önizleme:</p>
                <div
                  className="text-2xl font-bold text-center p-4 bg-background dark:bg-dark-soft rounded-lg border border-primary/20 text-foreground"
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
      <div className="flex flex-col sm:flex-row gap-4 sticky bottom-0 bg-card/95 dark:bg-dark-card/95 backdrop-blur-md p-4 -mx-4 border-t border-border dark:border-primary/20 sm:relative sm:border-0 sm:p-0 sm:bg-transparent">
        <Button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className="flex-1 bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-primary-foreground font-bold shadow-sm dark:shadow-neon-sm hover:shadow-md dark:hover:shadow-neon transition-all"
          size="lg"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {adding ? 'Ekleniyor...' : 'Sepete Ekle'}
        </Button>
        <Button
          onClick={handleBuyNow}
          disabled={adding || product.stock === 0}
          variant="default"
          className="flex-1 bg-gradient-to-r from-accent to-accent-light hover:from-accent-light hover:to-accent text-white font-bold shadow-sm dark:shadow-neon-pink hover:shadow-md dark:hover:shadow-neon-pink transition-all"
          size="lg"
        >
          <CreditCard className="h-5 w-5 mr-2" />
          Hemen Satın Al
        </Button>
      </div>
    </div>
  )
}

