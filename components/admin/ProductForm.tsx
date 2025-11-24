'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductImageManager } from './ProductImageManager'

interface Category {
  id: string
  name: string
  slug: string
}

interface Campaign {
  id: string
  title: string
}

interface Product {
  id?: string
  name: string
  slug: string
  sku?: string | null
  description?: string | null
  price: number
  salePrice?: number | null
  stock: number
  categoryId: string
  campaignId?: string | null
  isActive: boolean
  isCustomizable: boolean
}

interface ProductFormProps {
  product?: Product
  categories: Category[]
  campaigns?: Campaign[]
}

export function ProductForm({ product, categories, campaigns = [] }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const productImages = (product as any)?.images || []
  
  // Initialize images from product - only once on mount
  const getInitialImages = () => {
    if (productImages && productImages.length > 0) {
      return productImages.map((img: any) => ({
        url: img.url,
        altText: img.altText || null,
        isMain: img.isMain || false,
        isVideo: img.isVideo || false,
      }))
    }
    return []
  }
  
  const [images, setImages] = useState<any[]>(getInitialImages())
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    sku: product?.sku || '',
    description: product?.description || '',
    price: product?.price || 0,
    salePrice: product?.salePrice || '',
    stock: product?.stock || 0,
    categoryId: product?.categoryId || categories[0]?.id || '',
    campaignId: product?.campaignId || '',
    isActive: product?.isActive ?? true,
    isCustomizable: product?.isCustomizable ?? false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = product?.id
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products'
      const method = product?.id ? 'PATCH' : 'POST'

      // Ensure images array is properly formatted
      const formattedImages = images.map((img: any) => ({
        url: img.url || '',
        altText: img.altText || null,
        isMain: img.isMain || false,
        isVideo: img.isVideo || false,
      }))

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          salePrice: formData.salePrice ? parseFloat(formData.salePrice.toString()) : null,
          images: formattedImages,
        }),
      })

      if (response.ok) {
        router.push('/admin/urunler')
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'İşlem başarısız')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate slug from name
  useEffect(() => {
    if (!product?.id) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[çğıöşü]/g, (m) => {
          const map: { [key: string]: string } = {
            ç: 'c',
            ğ: 'g',
            ı: 'i',
            ö: 'o',
            ş: 's',
            ü: 'u',
          }
          return map[m] || m
        })
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      setFormData((prev) => ({ ...prev, slug }))
    }
  }, [formData.name, product?.id])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Genel Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Ürün Adı *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              required
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="categoryId">Kategori *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) =>
                setFormData({ ...formData, categoryId: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fiyat ve Stok</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Fiyat (₺) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="salePrice">İndirimli Fiyat (₺)</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                value={formData.salePrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salePrice: e.target.value ? parseFloat(e.target.value) : '',
                  })
                }
              />
            </div>
          </div>
          <div>
            <Label htmlFor="stock">Stok *</Label>
            <Input
              id="stock"
              type="number"
              required
              value={formData.stock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <ProductImageManager
        productId={product?.id}
        initialImages={productImages.map((img: any) => ({
          url: img.url,
          altText: img.altText || null,
          isMain: img.isMain || false,
          isVideo: img.isVideo || false,
        }))}
        onImagesChange={(newImages: any[]) => {
          setImages(newImages)
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Ayarlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4"
            />
            <Label htmlFor="isActive">Aktif</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isCustomizable"
              checked={formData.isCustomizable}
              onChange={(e) =>
                setFormData({ ...formData, isCustomizable: e.target.checked })
              }
              className="h-4 w-4"
            />
            <Label htmlFor="isCustomizable">Kişiye Özel (Özelleştirilebilir)</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Kaydediliyor...' : product?.id ? 'Güncelle' : 'Oluştur'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          İptal
        </Button>
      </div>
    </form>
  )
}

