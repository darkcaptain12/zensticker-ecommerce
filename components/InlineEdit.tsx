'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Pencil, X, Save, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface InlineEditProps {
  children: React.ReactNode
  type: 'text' | 'textarea' | 'image' | 'banner' | 'number'
  value: string | number
  onSave: (value: string | number) => Promise<void>
  field?: string // API field name
  entityId?: string // Entity ID for API calls
  entityType?: 'banner' | 'hero' | 'site-settings' | 'static-page'
  className?: string
  imageUrl?: string // For image type
  accept?: string // For file inputs
}

export function InlineEdit({
  children,
  type,
  value,
  onSave,
  field,
  entityId,
  entityType,
  className = '',
  imageUrl,
  accept,
}: InlineEditProps) {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const isAdmin = session?.user?.role === 'ADMIN'

  if (!isAdmin) {
    return <>{children}</>
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await onSave(editValue)
      setIsEditing(false)
    } catch (error) {
      console.error('Save error:', error)
      alert('Kaydetme başarısız')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', type === 'banner' ? 'banner' : 'images')

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
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Yükleme başarısız')
      }

      const data = await response.json()
      if (data.success && data.url) {
        setEditValue(data.url)
        await onSave(data.url)
        setIsEditing(false)
        alert('Görsel başarıyla yüklendi!')
      }
    } catch (error: any) {
      alert(error.message || 'Yükleme başarısız')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Edit Button */}
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute left-2 top-2 z-[100] opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white rounded-full p-1.5 shadow-lg hover:bg-primary/90 hover:scale-110"
          title="Düzenle"
          style={{ minWidth: '28px', minHeight: '28px' }}
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}

      {/* Content */}
      {isEditing ? (
        <div className="relative border-2 border-primary border-dashed p-4 rounded-lg bg-white/95 backdrop-blur-sm">
          {type === 'text' && (
            <div className="space-y-2">
              <Input
                value={editValue as string}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
                className="w-full"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Kaydet
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setIsEditing(false)
                  setEditValue(value)
                }}>
                  <X className="h-4 w-4" />
                  İptal
                </Button>
              </div>
            </div>
          )}

          {type === 'textarea' && (
            <div className="space-y-2">
              <Textarea
                value={editValue as string}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
                rows={4}
                className="w-full"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Kaydet
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setIsEditing(false)
                  setEditValue(value)
                }}>
                  <X className="h-4 w-4" />
                  İptal
                </Button>
              </div>
            </div>
          )}

          {type === 'number' && (
            <div className="space-y-2">
              <Input
                type="number"
                value={editValue as number}
                onChange={(e) => setEditValue(Number(e.target.value))}
                autoFocus
                className="w-full"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Kaydet
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setIsEditing(false)
                  setEditValue(value)
                }}>
                  <X className="h-4 w-4" />
                  İptal
                </Button>
              </div>
            </div>
          )}

          {(type === 'image' || type === 'banner') && (
            <div className="space-y-4">
              <div>
                <Label>PC'den Yükle</Label>
                <input
                  type="file"
                  accept={accept || 'image/*,video/*'}
                  onChange={handleImageUpload}
                  className="hidden"
                  id={`inline-upload-${entityId}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.getElementById(`inline-upload-${entityId}`) as HTMLInputElement
                    input?.click()
                  }}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Yükleniyor... {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Görsel/Video Seç ve Yükle
                    </>
                  )}
                </Button>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
              <div>
                <Label>Manuel URL</Label>
                <Input
                  value={editValue as string}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="/images/example.jpg"
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={loading || uploading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Kaydet
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setIsEditing(false)
                  setEditValue(value)
                }}>
                  <X className="h-4 w-4" />
                  İptal
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        children
      )}
    </div>
  )
}

