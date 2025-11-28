'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, X } from 'lucide-react'

interface Variant {
  id?: string
  name: string
  value: string
  price?: number | null
  stock: number
  sku?: string | null
}

interface ProductVariantManagerProps {
  productId?: string
  initialVariants?: Variant[]
  onChange?: (variants: Variant[]) => void
}

export function ProductVariantManager({ productId, initialVariants = [], onChange }: ProductVariantManagerProps) {
  const [variants, setVariants] = useState<Variant[]>(initialVariants)

  useEffect(() => {
    if (initialVariants.length > 0) {
      setVariants(initialVariants)
    }
  }, [initialVariants])

  useEffect(() => {
    onChange?.(variants)
  }, [variants, onChange])

  const addVariant = () => {
    setVariants([...variants, {
      name: '',
      value: '',
      price: null,
      stock: 0,
      sku: '',
    }])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Ürün Varyantları</CardTitle>
          <Button type="button" onClick={addVariant} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Varyant Ekle
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {variants.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Henüz varyant eklenmemiş. Varyant eklemek için yukarıdaki butona tıklayın.
          </p>
        ) : (
          variants.map((variant, index) => (
            <Card key={index} className="border-2">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-semibold">Varyant {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariant(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`variant-name-${index}`}>Varyant Adı (örn: Renk, Boyut)</Label>
                    <Input
                      id={`variant-name-${index}`}
                      value={variant.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      placeholder="Renk"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`variant-value-${index}`}>Varyant Değeri (örn: Kırmızı, XL)</Label>
                    <Input
                      id={`variant-value-${index}`}
                      value={variant.value}
                      onChange={(e) => updateVariant(index, 'value', e.target.value)}
                      placeholder="Kırmızı"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`variant-price-${index}`}>Ek Fiyat (₺) - Opsiyonel</Label>
                    <Input
                      id={`variant-price-${index}`}
                      type="number"
                      step="0.01"
                      value={variant.price || ''}
                      onChange={(e) => updateVariant(index, 'price', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`variant-stock-${index}`}>Stok</Label>
                    <Input
                      id={`variant-stock-${index}`}
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor={`variant-sku-${index}`}>SKU - Opsiyonel</Label>
                    <Input
                      id={`variant-sku-${index}`}
                      value={variant.sku || ''}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      placeholder="VARYANT-SKU-001"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  )
}

