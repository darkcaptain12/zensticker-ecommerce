'use client'

import { useState, useEffect } from 'react'
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
import { X, Plus, Upload, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { ProductImageManager } from './ProductImageManager'

interface Campaign {
  id?: string
  title: string
  description?: string | null
  type?: string
  discountPercent?: number | null
  discountAmount?: number | null
  packagePrice?: number | null
  imageUrl?: string | null
  minPurchaseAmount?: number | null
  startDate: string
  endDate: string
  isActive: boolean
  categoryIds?: string[]
  productIds?: string[]
  packageProducts?: Array<{ productId: string; quantity: number }>
}

interface CampaignFormProps {
  campaign?: Campaign
  categories?: Array<{ id: string; name: string }>
  products?: Array<{ id: string; name: string; price: number }>
}

export function CampaignForm({ campaign, categories = [], products = [] }: CampaignFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: campaign?.title || '',
    description: campaign?.description || '',
    descriptionImageUrl: (campaign as any)?.descriptionImageUrl || '',
    type: campaign?.type || 'GENERAL',
    discountPercent: campaign?.discountPercent || '',
    discountAmount: campaign?.discountAmount || '',
    packagePrice: campaign?.packagePrice || '',
    imageUrl: campaign?.imageUrl || '',
    minPurchaseAmount: campaign?.minPurchaseAmount || '',
    startDate: campaign?.startDate
      ? new Date(campaign.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    endDate: campaign?.endDate
      ? new Date(campaign.endDate).toISOString().split('T')[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: campaign?.isActive ?? true,
    selectedCategories: campaign?.categoryIds || [],
    selectedProducts: campaign?.productIds || [],
    packageProducts: campaign?.packageProducts?.map((pp: any) => ({
      productId: pp.productId,
      quantity: pp.quantity,
      imageUrl: pp.imageUrl || '',
    })) || [],
    campaignCode: (campaign as any)?.campaignCode || '',
  })

  const [newPackageProduct, setNewPackageProduct] = useState({ productId: '', quantity: 1, imageUrl: '' })
  const [uploadingPackageImage, setUploadingPackageImage] = useState<number | null>(null)
  const [uploadingDescriptionImage, setUploadingDescriptionImage] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [imageUploadMode, setImageUploadMode] = useState<'upload' | 'url'>('upload')

  useEffect(() => {
    // Load categories and products if not provided
    if (categories.length === 0 || products.length === 0) {
      Promise.all([
        fetch('/api/admin/categories').then(r => r.json()).catch(() => ({ categories: [] })),
        fetch('/api/admin/products-list').then(r => r.json()).catch(() => ({ products: [] })),
      ]).then(([catData, prodData]) => {
        // Categories and products will be loaded via props
      })
    }
  }, [])

  const addPackageProduct = () => {
    if (!newPackageProduct.productId) return
    setFormData({
      ...formData,
      packageProducts: [
        ...formData.packageProducts,
        {
          productId: newPackageProduct.productId,
          quantity: newPackageProduct.quantity,
          imageUrl: newPackageProduct.imageUrl || '',
        },
      ],
    })
    setNewPackageProduct({ productId: '', quantity: 1, imageUrl: '' })
  }

  const removePackageProduct = (index: number) => {
    setFormData({
      ...formData,
      packageProducts: formData.packageProducts.filter((_, i) => i !== index),
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'package' | 'description' = 'package', packageIndex?: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (type === 'description') {
      setUploadingDescriptionImage(true)
    } else if (packageIndex !== undefined) {
      setUploadingPackageImage(packageIndex)
    } else {
      setUploadingImage(true)
    }
    setUploadProgress(0)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('folder', 'campaigns')

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Yükleme başarısız')
      }

      const data = await response.json()
      
      if (data.success && data.url) {
        if (type === 'description') {
          // Set description image URL
          setFormData((prev) => ({
            ...prev,
            descriptionImageUrl: data.url,
          }))
        } else if (packageIndex !== undefined) {
          // Set package product image URL
          setFormData((prev) => ({
            ...prev,
            packageProducts: prev.packageProducts.map((pp, idx) =>
              idx === packageIndex ? { ...pp, imageUrl: data.url } : pp
            ),
          }))
        } else {
          // Set the uploaded image URL (main package image)
          setFormData((prev) => ({
            ...prev,
            imageUrl: data.url,
          }))
        }

        // Also save to assets for future use
        try {
          await fetch('/api/admin/assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: data.url,
              altText: type === 'description' 
                ? `Kampanya açıklama görseli - ${formData.title}`
                : `Kampanya paket görseli - ${formData.title}`,
              type: 'IMAGE',
            }),
          })
        } catch (error) {
          console.error('Failed to save asset:', error)
        }

        alert('Görsel başarıyla yüklendi!')
      } else {
        throw new Error('Yükleme başarısız - geçersiz yanıt')
      }

    } catch (error: any) {
      console.error('Upload error:', error)
      alert(error.message || 'Dosya yüklenirken bir hata oluştu')
    } finally {
      setUploadingImage(false)
      setUploadingDescriptionImage(false)
      if (packageIndex !== undefined) {
        setUploadingPackageImage(null)
      }
      setUploadProgress(0)
      // Reset file input
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = campaign?.id
        ? `/api/admin/campaigns/${campaign.id}`
        : '/api/admin/campaigns'
      const method = campaign?.id ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discountPercent: formData.discountPercent ? parseFloat(formData.discountPercent.toString()) : null,
          discountAmount: formData.discountAmount ? parseFloat(formData.discountAmount.toString()) : null,
          packagePrice: formData.packagePrice ? parseFloat(formData.packagePrice.toString()) : null,
          imageUrl: formData.imageUrl || null,
          descriptionImageUrl: formData.descriptionImageUrl || null,
          campaignCode: formData.campaignCode || null,
          minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount.toString()) : null,
          categoryIds: formData.type === 'CATEGORY' ? formData.selectedCategories : [],
          productIds: formData.type === 'PRODUCT' ? formData.selectedProducts : [],
          packageProducts: formData.type === 'PACKAGE' ? formData.packageProducts.map((pp: any) => ({
            productId: pp.productId,
            quantity: pp.quantity,
            imageUrl: pp.imageUrl || null,
          })) : [],
        }),
      })

      if (response.ok) {
        router.push('/admin/kampanyalar')
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kampanya Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Kampanya Başlığı *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Yaz Kampanyası"
            />
          </div>
          <div>
            <Label htmlFor="description">Açıklama (HTML destekli)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={5}
              className="mb-2 font-mono text-sm"
              placeholder="Kampanya açıklaması (HTML kullanabilirsiniz: &lt;strong&gt;, &lt;em&gt;, &lt;br&gt;, &lt;img&gt;, vb.)"
            />
            <p className="text-xs text-gray-500 mt-1">
              HTML formatında yazabilirsiniz. Örnek: &lt;strong&gt;Kalın&lt;/strong&gt;, &lt;em&gt;İtalik&lt;/em&gt;, &lt;br&gt; (satır atla)
            </p>
            {/* Açıklama Görseli */}
            <div className="mt-2">
              <Label htmlFor="descriptionImage">Açıklama Görseli (Opsiyonel)</Label>
              {formData.descriptionImageUrl && (
                <div className="mb-2 relative w-48 h-48 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={formData.descriptionImageUrl}
                    alt="Açıklama görseli"
                    fill
                    className="object-cover"
                    unoptimized={formData.descriptionImageUrl.includes('supabase.co') || formData.descriptionImageUrl.includes('supabase.in')}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => setFormData({ ...formData, descriptionImageUrl: '' })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="file"
                  id="descriptionImageUpload"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'description')}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('descriptionImageUpload')?.click()}
                  disabled={uploadingDescriptionImage}
                >
                  {uploadingDescriptionImage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Görsel Yükle
                    </>
                  )}
                </Button>
                <Input
                  type="text"
                  placeholder="veya URL girin"
                  value={formData.descriptionImageUrl}
                  onChange={(e) => setFormData({ ...formData, descriptionImageUrl: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="type">Kampanya Tipi *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GENERAL">Toplu İndirim (Tüm Ürünler)</SelectItem>
                <SelectItem value="CATEGORY">Kategori Bazlı</SelectItem>
                <SelectItem value="PRODUCT">Seçili Ürünler</SelectItem>
                <SelectItem value="PACKAGE">Kampanya Paketi</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.type === 'GENERAL' && 'Tüm ürünlere indirim uygulanır. Ürün seçmeye gerek yoktur.'}
              {formData.type === 'CATEGORY' && 'Seçilen kategorilerdeki tüm ürünlere indirim uygulanır.'}
              {formData.type === 'PRODUCT' && 'Sadece seçilen ürünlere indirim uygulanır.'}
              {formData.type === 'PACKAGE' && 'Paket satın alma kampanyası. Paket içindeki ürünler birlikte satılır.'}
            </p>
          </div>

          {/* Kategori Seçimi */}
          {formData.type === 'CATEGORY' && (
            <div>
              <Label>Kategoriler *</Label>
              <p className="text-xs text-gray-500 mb-2">
                Seçilen kategorilerdeki tüm ürünlere indirim uygulanacaktır.
              </p>
              <div className="space-y-2 mt-2">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.selectedCategories.includes(cat.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            selectedCategories: [...formData.selectedCategories, cat.id],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            selectedCategories: formData.selectedCategories.filter(
                              (id) => id !== cat.id
                            ),
                          })
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Ürün Seçimi */}
          {formData.type === 'PRODUCT' && (
            <div>
              <Label>Ürünler *</Label>
              <div className="space-y-2 mt-2 max-h-60 overflow-y-auto border p-2 rounded">
                {products.map((prod) => (
                  <label key={prod.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.selectedProducts.includes(prod.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            selectedProducts: [...formData.selectedProducts, prod.id],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            selectedProducts: formData.selectedProducts.filter(
                              (id) => id !== prod.id
                            ),
                          })
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <span>{prod.name} - {prod.price}₺</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Paket Ürünleri */}
          {formData.type === 'PACKAGE' && (
            <>
              <div>
                <Label>Paket Ürünleri *</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Paket içinde yer alacak ürünleri ve miktarlarını seçin. Bu ürünler birlikte paket fiyatından satılacaktır.
                </p>
                <div className="space-y-4 mt-2">
                {formData.packageProducts.map((pkg, index) => {
                  const product = products.find((p) => p.id === pkg.productId)
                  return (
                    <div key={index} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="flex-1 font-medium">
                          {product?.name || 'Ürün bulunamadı'} x {pkg.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePackageProduct(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {/* Paket Ürünü Görseli */}
                      <div>
                        <Label className="text-xs">Ürün Görseli (Opsiyonel)</Label>
                        {pkg.imageUrl && (
                          <div className="mt-1 mb-2 relative w-32 h-32 border border-gray-300 rounded overflow-hidden bg-gray-100">
                            <Image
                              src={pkg.imageUrl}
                              alt={`${product?.name} görseli`}
                              fill
                              className="object-cover"
                              unoptimized={pkg.imageUrl.includes('supabase.co') || pkg.imageUrl.includes('supabase.in')}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  packageProducts: formData.packageProducts.map((pp, idx) =>
                                    idx === index ? { ...pp, imageUrl: '' } : pp
                                  ),
                                })
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="file"
                            id={`packageImageUpload-${index}`}
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'package', index)}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`packageImageUpload-${index}`)?.click()}
                            disabled={uploadingPackageImage === index}
                          >
                            {uploadingPackageImage === index ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Yükleniyor...
                              </>
                            ) : (
                              <>
                                <Upload className="h-3 w-3 mr-1" />
                                Görsel
                              </>
                            )}
                          </Button>
                          <Input
                            type="text"
                            placeholder="veya URL"
                            value={pkg.imageUrl || ''}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                packageProducts: formData.packageProducts.map((pp, idx) =>
                                  idx === index ? { ...pp, imageUrl: e.target.value } : pp
                                ),
                              })
                            }}
                            className="flex-1 text-xs h-8"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div className="flex gap-2">
                  <Select
                    value={newPackageProduct.productId}
                    onValueChange={(value) =>
                      setNewPackageProduct({ ...newPackageProduct, productId: value })
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Ürün seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((prod) => (
                        <SelectItem key={prod.id} value={prod.id}>
                          {prod.name} - {prod.price}₺
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={newPackageProduct.quantity}
                    onChange={(e) =>
                      setNewPackageProduct({
                        ...newPackageProduct,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-20"
                    placeholder="Adet"
                  />
                  <Button type="button" onClick={addPackageProduct} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="packagePrice">Paket Fiyatı (₺) *</Label>
                <Input
                  id="packagePrice"
                  type="number"
                  step="0.01"
                  required={formData.type === 'PACKAGE'}
                  value={formData.packagePrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      packagePrice: e.target.value ? parseFloat(e.target.value) : '',
                    })
                  }
                  placeholder="299.99"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paket içindeki tüm ürünlerin toplam satış fiyatı. Müşteriler bu paketi bu fiyattan satın alabilecektir.
                </p>
              </div>
              <div className="mt-4">
                <Label htmlFor="imageUrl">Paket Görseli</Label>
                
                {/* Görsel Önizleme */}
                {formData.imageUrl && (
                  <div className="mb-4 relative w-48 h-48 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={formData.imageUrl}
                      alt="Paket görseli"
                      fill
                      className="object-cover"
                      unoptimized={formData.imageUrl.includes('supabase.co') || formData.imageUrl.includes('supabase.in')}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Yükleme Yöntemi Seçimi */}
                <div className="mb-4">
                  <div className="flex gap-4 mb-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="imageUploadMode"
                        checked={imageUploadMode === 'upload'}
                        onChange={() => setImageUploadMode('upload')}
                        className="h-4 w-4"
                      />
                      <span>PC'den Yükle</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="imageUploadMode"
                        checked={imageUploadMode === 'url'}
                        onChange={() => setImageUploadMode('url')}
                        className="h-4 w-4"
                      />
                      <span>Manuel URL Gir</span>
                    </label>
                  </div>

                  {/* Dosya Yükleme */}
                  {imageUploadMode === 'upload' && (
                    <div>
                      <input
                        type="file"
                        id="packageImageUpload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.getElementById('packageImageUpload') as HTMLInputElement
                          input?.click()
                        }}
                        disabled={uploadingImage}
                        className="w-full"
                      >
                        {uploadingImage ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Yükleniyor... {uploadProgress}%
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Görsel Seç ve Yükle
                          </>
                        )}
                      </Button>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Desteklenen formatlar: JPG, PNG, GIF, WEBP (max 10MB)
                      </p>
                    </div>
                  )}

                  {/* Manuel URL */}
                  {imageUploadMode === 'url' && (
                    <div>
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, imageUrl: e.target.value })
                        }
                        placeholder="/products/paket/paket-gorseli.jpg"
                      />
                      {formData.imageUrl && formData.imageUrl.startsWith('/') && (
                        <div className="mt-2 relative w-32 h-32 border rounded overflow-hidden bg-gray-100">
                          <Image
                            src={formData.imageUrl}
                            alt="Önizleme"
                            fill
                            className="object-cover"
                            unoptimized
                            onError={() => {}}
                          />
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Paket görseli URL'si (örn: /products/paket/paket.jpg)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {formData.type !== 'PACKAGE' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discountPercent">İndirim Yüzdesi (%)</Label>
                <Input
                  id="discountPercent"
                  type="number"
                  step="0.01"
                  value={formData.discountPercent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountPercent: e.target.value ? parseFloat(e.target.value) : '',
                    })
                  }
                  placeholder="10"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.type === 'GENERAL' && 'Tüm ürünlere uygulanacak indirim yüzdesi'}
                  {formData.type === 'CATEGORY' && 'Seçilen kategorilerdeki ürünlere uygulanacak indirim yüzdesi'}
                  {formData.type === 'PRODUCT' && 'Seçilen ürünlere uygulanacak indirim yüzdesi'}
                </p>
              </div>
              <div>
                <Label htmlFor="discountAmount">Sabit İndirim Tutarı (₺)</Label>
                <Input
                  id="discountAmount"
                  type="number"
                  step="0.01"
                  value={formData.discountAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountAmount: e.target.value ? parseFloat(e.target.value) : '',
                    })
                  }
                  placeholder="50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.type === 'GENERAL' && 'Tüm ürünlerden düşülecek sabit tutar'}
                  {formData.type === 'CATEGORY' && 'Seçilen kategorilerdeki ürünlerden düşülecek sabit tutar'}
                  {formData.type === 'PRODUCT' && 'Seçilen ürünlerden düşülecek sabit tutar'}
                </p>
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="minPurchaseAmount">Minimum Alışveriş Tutarı (₺)</Label>
            <Input
              id="minPurchaseAmount"
              type="number"
              step="0.01"
              value={formData.minPurchaseAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minPurchaseAmount: e.target.value ? parseFloat(e.target.value) : '',
                })
              }
              placeholder="200"
            />
          </div>
          <div>
            <Label htmlFor="campaignCode">Kampanya Kodu (Opsiyonel)</Label>
            <Input
              id="campaignCode"
              type="text"
              value={formData.campaignCode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  campaignCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
                })
              }
              placeholder="ACILIS10"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              Müşteriler bu kodu ödeme ekranında girecek. Sadece harf ve rakam kullanılabilir. Boş bırakılırsa kod gerektirmez.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Başlangıç Tarihi *</Label>
              <Input
                id="startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="endDate">Bitiş Tarihi *</Label>
              <Input
                id="endDate"
                type="date"
                required
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>
          </div>
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
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Kaydediliyor...' : campaign?.id ? 'Güncelle' : 'Oluştur'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          İptal
        </Button>
      </div>
    </form>
  )
}
