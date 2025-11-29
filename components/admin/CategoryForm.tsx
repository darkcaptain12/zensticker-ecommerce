'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'

interface Category {
  id?: string
  name: string
  slug: string
  description?: string | null
  bannerUrl?: string | null
  isActive: boolean
}

interface CategoryFormProps {
  category?: Category
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    bannerUrl: category?.bannerUrl || '',
    isActive: category?.isActive ?? true,
  })
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [bannerUploadMode, setBannerUploadMode] = useState<'upload' | 'url'>('upload')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = category?.id
        ? `/api/admin/categories/${category.id}`
        : '/api/admin/categories'
      const method = category?.id ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin/kategoriler')
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

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingBanner(true)
    setUploadProgress(0)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('folder', 'categories')

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
        setFormData((prev) => ({
          ...prev,
          bannerUrl: data.url,
        }))
        alert('Banner başarıyla yüklendi!')
      } else {
        throw new Error('Yükleme başarısız - geçersiz yanıt')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      alert(error.message || 'Dosya yüklenirken bir hata oluştu')
    } finally {
      setUploadingBanner(false)
      setUploadProgress(0)
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
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
    setFormData({ ...formData, name, slug })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kategori Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Kategori Adı *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
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
            <Label htmlFor="description">Açıklama (HTML destekli)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="font-mono text-sm"
              placeholder="Kategori açıklaması (HTML kullanabilirsiniz)"
            />
            <p className="text-xs text-gray-500 mt-1">
              HTML formatında yazabilirsiniz. Örnek: &lt;strong&gt;Kalın&lt;/strong&gt;, &lt;em&gt;İtalik&lt;/em&gt;, &lt;br&gt; (satır atla)
            </p>
          </div>
          <div>
            <Label htmlFor="bannerUrl">Kategori Banner Görseli</Label>
            {formData.bannerUrl && (
              <div className="mb-4 relative w-full max-w-2xl h-48 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={formData.bannerUrl}
                  alt="Kategori banner"
                  fill
                  className="object-contain"
                  unoptimized={formData.bannerUrl.includes('supabase.co') || formData.bannerUrl.includes('supabase.in')}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => setFormData({ ...formData, bannerUrl: '' })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="mb-4">
              <div className="flex gap-4 mb-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="bannerUploadMode"
                    checked={bannerUploadMode === 'upload'}
                    onChange={() => setBannerUploadMode('upload')}
                    className="h-4 w-4"
                  />
                  <span>PC'den Yükle</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="bannerUploadMode"
                    checked={bannerUploadMode === 'url'}
                    onChange={() => setBannerUploadMode('url')}
                    className="h-4 w-4"
                  />
                  <span>Manuel URL Gir</span>
                </label>
              </div>
              {bannerUploadMode === 'upload' ? (
                <div>
                  <input
                    type="file"
                    id="bannerUpload"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('bannerUpload')?.click()}
                    disabled={uploadingBanner}
                  >
                    {uploadingBanner ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Yükleniyor... {uploadProgress}%
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Banner Yükle
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Input
                  type="text"
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                  placeholder="https://supabase.co/storage/... veya tam URL"
                />
              )}
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
          {loading ? 'Kaydediliyor...' : category?.id ? 'Güncelle' : 'Oluştur'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          İptal
        </Button>
      </div>
    </form>
  )
}

