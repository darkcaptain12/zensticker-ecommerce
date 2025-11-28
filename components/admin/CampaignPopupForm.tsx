'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Image as ImageIcon, X } from 'lucide-react'
import Image from 'next/image'

interface CampaignPopup {
  id?: string
  title?: string | null
  imageUrl?: string | null
  text?: string | null
  buttonText?: string | null
  buttonUrl?: string | null
  isActive?: boolean
  showDelay?: number
}

export function CampaignPopupForm({ popup }: { popup: CampaignPopup | null | undefined }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: popup?.title || '',
    imageUrl: popup?.imageUrl || '',
    text: popup?.text || '',
    buttonText: popup?.buttonText || 'İncele',
    buttonUrl: popup?.buttonUrl || '',
    isActive: popup?.isActive ?? true,
    showDelay: popup?.showDelay || 3000,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToSend = {
        ...formData,
        title: formData.title || null,
        imageUrl: formData.imageUrl || null,
        text: formData.text || null,
        buttonText: formData.buttonText || null,
        buttonUrl: formData.buttonUrl || null,
      }

      const response = await fetch('/api/admin/campaign-popup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        router.refresh()
        alert('Pop-up ayarları kaydedildi')
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', 'popup')

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({ ...formData, imageUrl: data.url })
      } else {
        alert('Görsel yüklenemedi')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Görsel yüklenirken bir hata oluştu')
    }

    if (e.target) {
      e.target.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kampanya Pop-up Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="isActive" className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Pop-up Aktif</span>
            </Label>
          </div>

          <div>
            <Label htmlFor="showDelay">Gösterim Gecikmesi (milisaniye)</Label>
            <Input
              id="showDelay"
              type="number"
              min="0"
              value={formData.showDelay}
              onChange={(e) => setFormData({ ...formData, showDelay: parseInt(e.target.value) || 3000 })}
              placeholder="3000"
            />
            <p className="text-sm text-gray-500 mt-1">
              Pop-up sayfa yüklendikten kaç milisaniye sonra gösterilecek (örn: 3000 = 3 saniye)
            </p>
          </div>

          <div>
            <Label htmlFor="title">Başlık (Opsiyonel)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Özel Kampanya"
            />
          </div>

          <div>
            <Label htmlFor="imageUrl">Görsel URL</Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="/banner/kampanya.jpg veya tam URL"
              />
              <label className="cursor-pointer">
                <div className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Yükle
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            {formData.imageUrl && (
              <div className="mt-4 relative w-full max-w-md h-48 border rounded-lg overflow-hidden">
                <Image
                  src={formData.imageUrl}
                  alt="Pop-up görseli"
                  fill
                  className="object-contain"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setFormData({ ...formData, imageUrl: '' })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="text">Metin (HTML destekli)</Label>
            <Textarea
              id="text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              rows={6}
              placeholder="Pop-up içeriğinizi buraya yazın. HTML etiketleri kullanabilirsiniz (örn: &lt;strong&gt;, &lt;br&gt;, &lt;p&gt;)."
            />
            <p className="text-sm text-gray-500 mt-1">
              HTML etiketleri kullanabilirsiniz: &lt;strong&gt;, &lt;em&gt;, &lt;br&gt;, &lt;p&gt;, &lt;h1&gt;-&lt;h6&gt;, vb.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buttonText">Buton Metni</Label>
              <Input
                id="buttonText"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="İncele"
              />
            </div>
            <div>
              <Label htmlFor="buttonUrl">Buton Linki</Label>
              <Input
                id="buttonUrl"
                value={formData.buttonUrl}
                onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                placeholder="/kampanyalar veya https://..."
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

