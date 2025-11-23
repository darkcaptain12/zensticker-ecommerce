'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StaticPage {
  id?: string
  slug: string
  title: string
  content: string
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
    isActive: page?.isActive ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = page?.id
        ? `/api/admin/static-pages/${page.id}`
        : '/api/admin/static-pages'
      const method = page?.id ? 'PATCH' : 'POST'

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
            <Textarea
              id="content"
              required
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              rows={12}
              placeholder="HTML veya düz metin içerik"
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
          {loading ? 'Kaydediliyor...' : page?.id ? 'Güncelle' : 'Oluştur'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          İptal
        </Button>
      </div>
    </form>
  )
}

