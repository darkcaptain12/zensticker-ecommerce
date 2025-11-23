'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface SiteSettings {
  id?: string
  primaryColor?: string
  secondaryColor?: string
  headerLogoPath?: string | null
  footerLogoPath?: string | null
  whatsappPhoneNumber?: string
  headerMarqueeText?: string | null
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
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.refresh()
        alert('Ayarlar kaydedildi')
      } else {
        alert('Kaydetme başarısız')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
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
      <Button type="submit" disabled={loading}>
        {loading ? 'Kaydediliyor...' : 'Kaydet'}
      </Button>
    </form>
  )
}

