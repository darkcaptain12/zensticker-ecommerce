'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Loader2, X, Video, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface SiteSettings {
  id?: string
  primaryColor?: string
  secondaryColor?: string
  headerLogoPath?: string | null
  footerLogoPath?: string | null
  whatsappPhoneNumber?: string
  headerMarqueeText?: string | null
  videoBackgroundUrl?: string | null
}

export function SiteSettingsForm({ settings }: { settings: SiteSettings | null | undefined }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    primaryColor: settings?.primaryColor || '#000000',
    secondaryColor: settings?.secondaryColor || '#ffffff',
    headerLogoPath: settings?.headerLogoPath || '',
    footerLogoPath: settings?.footerLogoPath || '',
    whatsappPhoneNumber: settings?.whatsappPhoneNumber || '+905551234567',
    headerMarqueeText: settings?.headerMarqueeText || '200₺ üzeri ücretsiz kargo',
    videoBackgroundUrl: settings?.videoBackgroundUrl || '',
  })
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [videoUploadMode, setVideoUploadMode] = useState<'upload' | 'url'>('upload')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Boş string'leri null'a çevir (Prisma için)
      const dataToSend = {
        ...formData,
        headerLogoPath: formData.headerLogoPath || null,
        footerLogoPath: formData.footerLogoPath || null,
        headerMarqueeText: formData.headerMarqueeText || null,
        videoBackgroundUrl: formData.videoBackgroundUrl || null,
      }

      const response = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        router.refresh()
        alert('Ayarlar kaydedildi')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Kaydetme başarısız' }))
        alert(errorData.error || 'Kaydetme başarısız')
      }
    } catch (error: any) {
      console.error('Submit error:', error)
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
      
      if (data.success && data.url) {
        setFormData((prev) => ({
          ...prev,
          videoBackgroundUrl: data.url,
        }))

        try {
          await fetch('/api/admin/assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: data.url,
              altText: 'Video Background Section',
              type: 'VIDEO',
            }),
          })
        } catch (error) {
          console.error('Failed to save asset:', error)
        }

        alert('Video başarıyla yüklendi!')
      } else {
        throw new Error('Yükleme başarısız - geçersiz yanıt')
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="primaryColor">Birincil Renk</Label>
        <Input
          id="primaryColor"
          type="color"
          value={formData.primaryColor}
          onChange={(e) =>
            setFormData({ ...formData, primaryColor: e.target.value })
          }
        />
      </div>
      <div>
        <Label htmlFor="secondaryColor">İkincil Renk</Label>
        <Input
          id="secondaryColor"
          type="color"
          value={formData.secondaryColor}
          onChange={(e) =>
            setFormData({ ...formData, secondaryColor: e.target.value })
          }
        />
      </div>
      <div>
        <Label htmlFor="headerLogoPath">Header Logo Yolu</Label>
        <Input
          id="headerLogoPath"
          value={formData.headerLogoPath}
          onChange={(e) =>
            setFormData({ ...formData, headerLogoPath: e.target.value })
          }
          placeholder="/logo/siyah_zensticker.png"
        />
      </div>
      <div>
        <Label htmlFor="footerLogoPath">Footer Logo Yolu</Label>
        <Input
          id="footerLogoPath"
          value={formData.footerLogoPath}
          onChange={(e) =>
            setFormData({ ...formData, footerLogoPath: e.target.value })
          }
          placeholder="/logo/beyaz_zensticker.png"
        />
      </div>
      <div>
        <Label htmlFor="whatsappPhoneNumber">WhatsApp Telefon Numarası</Label>
        <Input
          id="whatsappPhoneNumber"
          value={formData.whatsappPhoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, whatsappPhoneNumber: e.target.value })
          }
          placeholder="+905551234567"
        />
      </div>
      <div>
        <Label htmlFor="headerMarqueeText">Header Kayar Yazı</Label>
        <Input
          id="headerMarqueeText"
          value={formData.headerMarqueeText}
          onChange={(e) =>
            setFormData({ ...formData, headerMarqueeText: e.target.value })
          }
          placeholder="200₺ üzeri ücretsiz kargo"
        />
        <p className="text-xs text-gray-500 mt-1">
          Header'da kayar şekilde gösterilecek metin
        </p>
      </div>
      <div>
        <Label htmlFor="videoBackgroundUrl">Video Background (Ürünlerimizi Canlı Görün Bölümü)</Label>
        
        {/* Video Önizleme */}
        {formData.videoBackgroundUrl && (
          <div className="mb-4 relative w-full h-48 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
            <video
              src={formData.videoBackgroundUrl}
              className="w-full h-full object-cover"
              controls
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={() => setFormData({ ...formData, videoBackgroundUrl: '' })}
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
                id="videoBackgroundUpload"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const input = document.getElementById('videoBackgroundUpload') as HTMLInputElement
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
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Desteklenen formatlar: MP4, WEBM, OGG (max 50MB)
              </p>
            </div>
          )}

          {/* Manuel URL */}
          {videoUploadMode === 'url' && (
            <div>
              <Input
                id="videoBackgroundUrl"
                value={formData.videoBackgroundUrl}
                onChange={(e) =>
                  setFormData({ ...formData, videoBackgroundUrl: e.target.value })
                }
                placeholder="/videos/showcase.mp4 veya https://example.com/video.mp4"
              />
              <p className="text-xs text-gray-500 mt-1">
                Video URL'si (örn: /videos/showcase.mp4)
              </p>
            </div>
          )}
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Kaydediliyor...' : 'Kaydet'}
      </Button>
    </form>
  )
}

