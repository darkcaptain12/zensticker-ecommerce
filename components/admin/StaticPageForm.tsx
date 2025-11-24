'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from './RichTextEditor'
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface StaticPage {
  id?: string
  slug: string
  title: string
  content: string
  imageUrl?: string | null
  isActive: boolean
}

interface StaticPageFormProps {
  page?: StaticPage
}

export function StaticPageForm({ page }: StaticPageFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    slug: page?.slug || '',
    title: page?.title || '',
    content: page?.content || '',
    imageUrl: page?.imageUrl || '',
    isActive: page?.isActive ?? true,
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [imageUploadMode, setImageUploadMode] = useState<'upload' | 'url'>('upload')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = page?.id
        ? `/api/admin/static-pages/${page.id}`
        : '/api/admin/static-pages'
      const method = page?.id ? 'PATCH' : 'POST'

      console.log('Submitting form data:', formData)

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin/static-pages')
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setUploadProgress(0)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', 'static-pages')

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
        body: formDataUpload,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Yükleme başarısız')
      }

      const data = await response.json()
      console.log('Upload response:', data)
      
      // API response format: { success: true, url: "...", ... }
      if (data.success && data.url) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: data.url,
        }))

        try {
          await fetch('/api/admin/assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: data.url,
              altText: `Statik sayfa görseli - ${formData.title}`,
              type: 'IMAGE',
            }),
          })
        } catch (error) {
          console.error('Failed to save asset:', error)
        }

        alert('Görsel başarıyla yüklendi!')
      } else {
        console.error('Upload failed - invalid response:', data)
        throw new Error(data.error || 'Yükleme başarısız - geçersiz yanıt')
      }

    } catch (error: any) {
      console.error('Upload error:', error)
      alert(error.message || 'Dosya yüklenirken bir hata oluştu')
    } finally {
      setUploadingImage(false)
      setUploadProgress(0)
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    if (!page?.id) {
      const slug = title
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
      setFormData({ ...formData, title, slug })
    } else {
      setFormData({ ...formData, title })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sayfa Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug (URL) *</Label>
            <Input
              id="slug"
              required
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="hakkimizda"
            />
            <p className="text-sm text-gray-500 mt-1">
              URL: /{formData.slug}
            </p>
          </div>
          <div>
            <Label htmlFor="content">İçerik *</Label>
            <div className="mt-2">
              <RichTextEditor
                value={formData.content}
                onChange={(value) =>
                  setFormData({ ...formData, content: value })
                }
                placeholder="Sayfa içeriğini buraya yazın. Kalın, italik, başlık, liste gibi formatlamaları kullanabilirsiniz."
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              HTML formatında içerik girebilirsiniz. Rich text editor ile formatlamaları kolayca yapabilirsiniz.
            </p>
          </div>
          <div>
            <Label htmlFor="imageUrl">Sayfa Görseli (Sağ Kısımda Gösterilir)</Label>
            
            {/* Görsel Önizleme */}
            {formData.imageUrl && (
              <div className="mb-4 relative w-64 h-48 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={formData.imageUrl}
                  alt="Sayfa görseli"
                  fill
                  className="object-cover"
                  unoptimized
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
                    id="staticPageImageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('staticPageImageUpload') as HTMLInputElement
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
                    placeholder="/images/kvkk.jpg veya https://example.com/image.jpg"
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
                    Görsel URL'si (örn: /images/kvkk.jpg)
                  </p>
                </div>
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
          {loading ? 'Kaydediliyor...' : page?.id ? 'Güncelle' : 'Oluştur'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          İptal
        </Button>
      </div>
    </form>
  )
}

