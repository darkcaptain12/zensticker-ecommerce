'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { Upload, Loader2, X, Video } from 'lucide-react'

interface Banner {
  id?: string
  title: string
  type: 'IMAGE' | 'VIDEO'
  filePath: string
  linkUrl?: string | null
  isActive: boolean
  position: number
}

interface BannerFormProps {
  banner?: Banner
  availableBanners: string[]
}

export function BannerForm({ banner, availableBanners }: BannerFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: banner?.title || '',
    type: banner?.type || 'IMAGE',
    filePath: banner?.filePath || '',
    linkUrl: banner?.linkUrl || '',
    isActive: banner?.isActive ?? true,
    position: banner?.position || 0,
  })
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [videoUploadMode, setVideoUploadMode] = useState<'upload' | 'url'>('upload')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = banner?.id
        ? `/api/admin/banners/${banner.id}`
        : '/api/admin/banners'
      const method = banner?.id ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          linkUrl: formData.linkUrl || null,
        }),
      })

      if (response.ok) {
        router.push('/admin/banner')
        router.refresh()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'İşlem başarısız' }))
        alert(errorData.error || 'İşlem başarısız')
      }
    } catch (error: any) {
      console.error('Banner submit error:', error)
      alert(error.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingVideo(true)
    setUploadProgress(0)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', 'videos')

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
        const errorMessage = error.error || 'Yükleme başarısız'
        
        // Vercel/serverless ortamında dosya yükleme hatası için özel mesaj
        if (error.requiresCloudStorage || errorMessage.includes('read-only') || errorMessage.includes('EROFS')) {
          throw new Error(
            'Vercel gibi serverless ortamlarda dosya yükleme desteklenmiyor.\n\n' +
            'Lütfen "Manuel URL Gir" seçeneğini kullanarak video URL\'si girin.\n\n' +
            'Video dosyanızı bir cloud storage servisine (Cloudinary, AWS S3, vb.) yükleyip URL\'sini buraya yapıştırabilirsiniz.'
          )
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Upload response:', data)
      
      if (data.success && data.url) {
        setFormData((prev) => ({
          ...prev,
          filePath: data.url,
        }))

        try {
          await fetch('/api/admin/assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: data.url,
              altText: `Banner video - ${formData.title}`,
              type: 'VIDEO',
            }),
          })
        } catch (error) {
          console.error('Failed to save asset:', error)
        }

        alert('Video başarıyla yüklendi!')
      } else {
        console.error('Upload failed - invalid response:', data)
        throw new Error(data.error || 'Yükleme başarısız - geçersiz yanıt')
      }

    } catch (error: any) {
      console.error('Upload error:', error)
      alert(error.message || 'Dosya yüklenirken bir hata oluştu')
    } finally {
      setUploadingVideo(false)
      setUploadProgress(0)
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Banner Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Başlık (Admin için) *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="type">Tip *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'IMAGE' | 'VIDEO') =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IMAGE">Görsel</SelectItem>
                <SelectItem value="VIDEO">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filePath">
              {formData.type === 'VIDEO' ? 'Video URL veya Dosya Yolu *' : 'Dosya Yolu *'}
            </Label>
            {formData.type === 'VIDEO' ? (
              <>
                {/* Video Önizleme */}
                {formData.filePath && (
                  <div className="mb-4 relative w-full h-48 border-2 border-border dark:border-gray-300 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-100">
                    <video
                      src={formData.filePath}
                      className="w-full h-full object-cover"
                      controls
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => setFormData({ ...formData, filePath: '' })}
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
                        name="videoUploadMode"
                        checked={videoUploadMode === 'upload'}
                        onChange={() => setVideoUploadMode('upload')}
                        className="h-4 w-4"
                      />
                      <span>PC'den Yükle</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="videoUploadMode"
                        checked={videoUploadMode === 'url'}
                        onChange={() => setVideoUploadMode('url')}
                        className="h-4 w-4"
                      />
                      <span>Manuel URL Gir</span>
                    </label>
                  </div>

                  {/* Dosya Yükleme */}
                  {videoUploadMode === 'upload' && (
                    <div>
                      <input
                        type="file"
                        id="bannerVideoUpload"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.getElementById('bannerVideoUpload') as HTMLInputElement
                          input?.click()
                        }}
                        disabled={uploadingVideo}
                        className="w-full"
                      >
                        {uploadingVideo ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Yükleniyor... {uploadProgress}%
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Video Seç ve Yükle
                          </>
                        )}
                      </Button>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Desteklenen formatlar: MP4, WEBM, OGG (max 50MB)
                      </p>
                    </div>
                  )}

                  {/* Manuel URL */}
                  {videoUploadMode === 'url' && (
                    <div>
                      <Input
                        id="filePath"
                        required={!formData.filePath}
                        value={formData.filePath}
                        onChange={(e) =>
                          setFormData({ ...formData, filePath: e.target.value })
                        }
                        placeholder="/videos/banner.mp4 veya https://example.com/video.mp4"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Video URL'si (örn: /videos/banner.mp4)
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Select
                  value={formData.filePath}
                  onValueChange={(value) =>
                    setFormData({ ...formData, filePath: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Banner seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBanners.map((banner) => (
                      <SelectItem key={banner} value={banner}>
                        {banner}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Mevcut bannerlar: banner1.png - banner15.png
                </p>
                {formData.filePath && (
                  <div className="mt-4 relative w-full h-48 border border-border rounded overflow-hidden bg-gray-50 dark:bg-gray-100">
                    <Image
                      src={formData.filePath}
                      alt="Önizleme"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
              </>
            )}
          </div>
          <div>
            <Label htmlFor="linkUrl">Link URL (Tıklanınca gidilecek sayfa)</Label>
            <Input
              id="linkUrl"
              value={formData.linkUrl}
              onChange={(e) =>
                setFormData({ ...formData, linkUrl: e.target.value })
              }
              placeholder="/kategoriler veya /urun/urun-slug"
            />
          </div>
          <div>
            <Label htmlFor="position">Pozisyon (Sıralama)</Label>
            <Input
              id="position"
              type="number"
              value={formData.position}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  position: parseInt(e.target.value) || 0,
                })
              }
            />
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
          {loading ? 'Kaydediliyor...' : banner?.id ? 'Güncelle' : 'Oluştur'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          İptal
        </Button>
      </div>
    </form>
  )
}

