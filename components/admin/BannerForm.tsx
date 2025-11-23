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
            <Label htmlFor="filePath">Dosya Yolu *</Label>
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
            <p className="text-sm text-gray-500 mt-1">
              Mevcut bannerlar: banner1.png - banner15.png
            </p>
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

