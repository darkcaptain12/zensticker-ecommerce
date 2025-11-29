'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'

interface FooterSettings {
  id?: string
  footerDescription?: string | null
  footerAddress?: string | null
  instagramUrl?: string | null
  footerLogoPath?: string | null
  whatsappPhoneNumber?: string
}

export function FooterSettingsForm({ settings }: { settings: FooterSettings | null | undefined }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    footerDescription: settings?.footerDescription || 'Premium araç sticker ve kaplama çözümleri ile aracınızı öne çıkarın. Kalite ve güvenilirlik odaklı hizmet anlayışımız.',
    footerAddress: settings?.footerAddress || 'Demirci Mah. Dere Sok. No: 19\nNilüfer, Bursa',
    instagramUrl: settings?.instagramUrl || 'https://www.instagram.com/zenstickerr',
    footerLogoPath: settings?.footerLogoPath || '',
    whatsappPhoneNumber: settings?.whatsappPhoneNumber || '+905315661805',
  })
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/footer-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          footerDescription: formData.footerDescription || null,
          footerAddress: formData.footerAddress || null,
          instagramUrl: formData.instagramUrl || null,
          footerLogoPath: formData.footerLogoPath || null,
          whatsappPhoneNumber: formData.whatsappPhoneNumber,
        }),
      })

      if (response.ok) {
        alert('Footer ayarları başarıyla kaydedildi!')
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Kayıt başarısız')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    setUploadProgress(0)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('folder', 'logo')

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
        setFormData((prev) => ({
          ...prev,
          footerLogoPath: data.url,
        }))
        alert('Logo başarıyla yüklendi!')
      } else {
        throw new Error('Yükleme başarısız - geçersiz yanıt')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      alert(error.message || 'Logo yüklenirken bir hata oluştu')
    } finally {
      setUploadingLogo(false)
      setUploadProgress(0)
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  const removeLogo = () => {
    setFormData((prev) => ({
      ...prev,
      footerLogoPath: '',
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Footer Logo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Footer Logo</Label>
            <div className="mt-2 space-y-4">
              {formData.footerLogoPath && (
                <div className="relative w-48 h-24 border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <Image
                    src={formData.footerLogoPath}
                    alt="Footer Logo"
                    fill
                    className="object-contain p-2"
                    unoptimized={formData.footerLogoPath.includes('supabase.co') || formData.footerLogoPath.includes('supabase.in')}
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                  <Button type="button" variant="outline" disabled={uploadingLogo} asChild>
                    <span>
                      {uploadingLogo ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Yükleniyor... {uploadProgress}%
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Logo Yükle
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>
              <p className="text-sm text-gray-500">
                Footer'da gösterilecek logo görseli. PNG veya SVG formatında olmalıdır.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Footer İçerik</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="footerDescription">Açıklama Metni</Label>
            <Textarea
              id="footerDescription"
              value={formData.footerDescription}
              onChange={(e) => setFormData({ ...formData, footerDescription: e.target.value })}
              rows={3}
              placeholder="Footer açıklama metni..."
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Footer'da logo altında gösterilecek açıklama metni.
            </p>
          </div>

          <div>
            <Label htmlFor="footerAddress">Adres</Label>
            <Textarea
              id="footerAddress"
              value={formData.footerAddress}
              onChange={(e) => setFormData({ ...formData, footerAddress: e.target.value })}
              rows={3}
              placeholder="Adres bilgisi (her satır bir satır olarak görünecek)"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Adres bilgisi. Her satır ayrı bir satır olarak gösterilir.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sosyal Medya</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="instagramUrl">Instagram URL</Label>
            <Input
              id="instagramUrl"
              type="url"
              value={formData.instagramUrl}
              onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
              placeholder="https://www.instagram.com/zenstickerr"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Instagram profil URL'i.
            </p>
          </div>

          <div>
            <Label htmlFor="whatsappPhoneNumber">WhatsApp Telefon Numarası</Label>
            <Input
              id="whatsappPhoneNumber"
              type="text"
              value={formData.whatsappPhoneNumber}
              onChange={(e) => setFormData({ ...formData, whatsappPhoneNumber: e.target.value })}
              placeholder="+905315661805"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              WhatsApp için telefon numarası. Uluslararası formatta olmalıdır (örn: +905315661805).
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          İptal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            'Kaydet'
          )}
        </Button>
      </div>
    </form>
  )
}

