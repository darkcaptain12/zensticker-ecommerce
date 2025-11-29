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
  variants?: Array<{
    id: string
    name: string
    value: string
    price?: number | null
    stock: number
    sku?: string | null
  }>
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
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  // Varyantlar varsa grupla (name'e göre)
  const variantGroups = product.variants && product.variants.length > 0
    ? product.variants.reduce((acc, variant) => {
        if (!acc[variant.name]) {
          acc[variant.name] = []
        }
        acc[variant.name].push(variant)
        return acc
      }, {} as Record<string, Array<NonNullable<typeof product.variants>[number]>>)
    : null

  // Seçilen varyantı bul
  const selectedVariant = selectedVariantId
    ? product.variants?.find(v => v.id === selectedVariantId)
    : null

  // Varyantlı ürün için fiyat ve stok hesapla
  const displayPrice = selectedVariant && selectedVariant.price
    ? product.price + selectedVariant.price
    : product.price
  const displayStock = selectedVariant
    ? selectedVariant.stock
    : product.stock

  const handleAddToCart = () => {
    // Varyant kontrolü
    if (product.variants && product.variants.length > 0 && !selectedVariantId) {
      toast({
        variant: 'destructive',
        title: 'Varyant Seçimi Gerekli',
        description: 'Lütfen bir varyant seçiniz',
      })
      return
    }

    if (displayStock < quantity) {
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
      name: product.name + (selectedVariant ? ` - ${selectedVariant.name}: ${selectedVariant.value}` : ''),
      price: displayPrice,
      salePrice: product.salePrice ? (product.salePrice + (selectedVariant?.price || 0)) : undefined,
      image: mainImage,
      quantity,
      variantId: selectedVariantId || undefined,
      customText: product.isCustomizable ? customText : undefined,
      customFont: product.isCustomizable ? selectedFont : undefined,
    })

    toast({
      title: 'Sepete Eklendi',
      description: `${product.name}${selectedVariant ? ` - ${selectedVariant.value}` : ''} sepete eklendi`,
    })

    setTimeout(() => {
      setAdding(false)
      router.push('/sepet')
    }, 500)
  }

  const handleBuyNow = () => {
    // Varyant kontrolü
    if (product.variants && product.variants.length > 0 && !selectedVariantId) {
      toast({
        variant: 'destructive',
        title: 'Varyant Seçimi Gerekli',
        description: 'Lütfen bir varyant seçiniz',
      })
      return
    }

    if (displayStock < quantity) {
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
            disabled={displayStock < quantity || adding || (product.isCustomizable && !customText.trim()) || (product.variants && product.variants.length > 0 && !selectedVariantId)}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-neon-lg text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {adding ? 'Ekleniyor...' : 'Sepete Ekle'}
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={displayStock < quantity || adding || (product.isCustomizable && !customText.trim()) || (product.variants && product.variants.length > 0 && !selectedVariantId)}
            variant="outline"
            className="flex-1 border-primary hover:bg-primary hover:text-white"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Hızlı Al
          </Button>
        </div>
      </div>
      {/* Variant Selection */}
      {variantGroups && Object.keys(variantGroups).length > 0 && (
        <Card className="border border-border dark:border-dark-border bg-card dark:bg-dark-card/50 backdrop-blur-sm rounded-2xl">
          <CardContent className="pt-6">
            {Object.entries(variantGroups).map(([groupName, variants]) => (
              <div key={groupName} className="mb-4">
                <Label className="text-foreground font-semibold mb-2 block">
                  {groupName} *
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {variants.map((variant) => {
                    const isSelected = selectedVariantId === variant.id
                    const isOutOfStock = variant.stock === 0
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          if (!isOutOfStock) {
                            setSelectedVariantId(variant.id)
                            // Stok miktarına göre quantity'yi ayarla
                            if (quantity > variant.stock) {
                              setQuantity(variant.stock)
                            }
                          }
                        }}
                        disabled={isOutOfStock}
                        className={`
                          p-3 rounded-lg border-2 transition-all text-sm font-medium
                          ${isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border dark:border-dark-border bg-background dark:bg-dark-soft text-foreground hover:border-primary/50'
                          }
                          ${isOutOfStock
                            ? 'opacity-50 cursor-not-allowed line-through'
                            : 'cursor-pointer hover:bg-primary/5'
                          }
                        `}
                      >
                        <div>{variant.value}</div>
                        {variant.price && variant.price > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            +{variant.price.toFixed(2)}₺
                          </div>
                        )}
                        {isOutOfStock && (
                          <div className="text-xs text-red-500 mt-1">Stokta Yok</div>
                        )}
                        {!isOutOfStock && variant.stock < 10 && (
                          <div className="text-xs text-orange-500 mt-1">
                            Son {variant.stock} adet
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            {selectedVariant && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-primary font-semibold">
                  Seçilen: {selectedVariant.name} - {selectedVariant.value}
                  {selectedVariant.price && selectedVariant.price > 0 && (
                    <span className="ml-2">(+{selectedVariant.price.toFixed(2)}₺)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Stok: {selectedVariant.stock} adet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
            max={displayStock}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(displayStock, parseInt(e.target.value) || 1)))}
            className="w-20 text-center bg-background dark:bg-dark-soft border-border dark:border-dark-border text-foreground focus:border-primary focus:ring-primary"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.min(displayStock, quantity + 1))}
            className="border-border dark:border-dark-border text-foreground hover:bg-primary/20 hover:border-primary hover:text-primary"
          >
            +
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Stok: {displayStock} adet
        </p>
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
          disabled={displayStock < quantity || adding || (product.isCustomizable && !customText.trim()) || (product.variants && product.variants.length > 0 && !selectedVariantId)}
          className="flex-1 bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-primary-foreground font-bold shadow-sm dark:shadow-neon-sm hover:shadow-md dark:hover:shadow-neon transition-all"
          size="lg"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {adding ? 'Ekleniyor...' : 'Sepete Ekle'}
        </Button>
        <Button
          onClick={handleBuyNow}
          disabled={adding || displayStock === 0 || (product.variants && product.variants.length > 0 && !selectedVariantId)}
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

