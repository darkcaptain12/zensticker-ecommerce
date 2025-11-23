'use client'

import { useState, useEffect } from 'react'
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
import { Card, CardContent } from '@/components/ui/card'
import { X, Star, Image as ImageIcon, Video } from 'lucide-react'
import Image from 'next/image'

interface ProductImage {
  id?: string
  url: string
  altText?: string | null
  isMain: boolean
  isVideo: boolean
}

interface ProductImageManagerProps {
  productId?: string
  initialImages?: ProductImage[]
  onImagesChange?: (images: ProductImage[]) => void
}

export function ProductImageManager({
  productId,
  initialImages = [],
  onImagesChange,
}: ProductImageManagerProps) {
  const [images, setImages] = useState<ProductImage[]>(initialImages)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newImageAlt, setNewImageAlt] = useState('')
  const [isVideo, setIsVideo] = useState(false)
  const [availableImages, setAvailableImages] = useState<string[]>([])
  const [savedAssets, setSavedAssets] = useState<Array<{ url: string; altText?: string | null }>>([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [imageSelectionMode, setImageSelectionMode] = useState<'select' | 'manual' | 'saved'>('select')

  useEffect(() => {
    setImages(initialImages)
  }, [initialImages])

  useEffect(() => {
    if (onImagesChange) {
      onImagesChange(images)
    }
  }, [images, onImagesChange])

  useEffect(() => {
    // Load available images from API
    setLoadingImages(true)
    Promise.all([
      fetch('/api/admin/product-images').then(res => res.json()),
      fetch('/api/admin/assets').then(res => res.json()),
    ])
      .then(([imagesData, assetsData]) => {
        if (imagesData.images) {
          setAvailableImages(imagesData.images)
        }
        if (assetsData.assets) {
          setSavedAssets(assetsData.assets)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingImages(false))
  }, [])

  const addImage = async () => {
    if (!newImageUrl.trim()) return

    const imageUrl = newImageUrl.trim()

    // Save to database for future use
    try {
      await fetch('/api/admin/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: imageUrl,
          altText: newImageAlt.trim() || null,
          type: isVideo ? 'VIDEO' : 'IMAGE',
        }),
      })
    } catch (error) {
      console.error('Failed to save asset to database:', error)
    }

    const newImage: ProductImage = {
      url: imageUrl,
      altText: newImageAlt.trim() || null,
      isMain: images.length === 0,
      isVideo: isVideo,
    }

    const updatedImages = [...images, newImage]
    setImages(updatedImages)
    
    // Immediately notify parent component
    if (onImagesChange) {
      onImagesChange(updatedImages)
    }
    
    setNewImageUrl('')
    setNewImageAlt('')
    setIsVideo(false)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    // Eğer ana görsel silindiyse, ilk görseli ana yap
    if (images[index].isMain && newImages.length > 0) {
      newImages[0].isMain = true
    }
    setImages(newImages)
    
    // Immediately notify parent component
    if (onImagesChange) {
      onImagesChange(newImages)
    }
  }

  const setMainImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isMain: i === index,
    }))
    setImages(newImages)
    
    // Immediately notify parent component
    if (onImagesChange) {
      onImagesChange(newImages)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Label className="text-base font-semibold mb-4 block">
          Ürün Görselleri ve Videoları
        </Label>

        {/* Mevcut Görseller */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <div className="relative aspect-square border-2 rounded-lg overflow-hidden bg-gray-100">
                  {img.isVideo ? (
                    <video
                      src={img.url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <Image
                      src={img.url}
                      alt={img.altText || `Görsel ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  )}
                  {img.isMain && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                      <Star className="h-3 w-3 fill-white" />
                      Ana
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {!img.isMain && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => setMainImage(index)}
                  >
                    Ana Görsel Yap
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Yeni Görsel Ekleme */}
        <div className="space-y-4 border-t pt-4">
          <div>
            <Label>Görsel Ekleme Yöntemi</Label>
            <div className="flex gap-4 mt-2 flex-wrap">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="imageMode"
                  checked={imageSelectionMode === 'select'}
                  onChange={() => {
                    setImageSelectionMode('select')
                    setNewImageUrl('')
                  }}
                  className="h-4 w-4"
                />
                <span>Mevcut Görsellerden Seç</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="imageMode"
                  checked={imageSelectionMode === 'saved'}
                  onChange={() => {
                    setImageSelectionMode('saved')
                    setNewImageUrl('')
                  }}
                  className="h-4 w-4"
                />
                <span>Kayıtlı Görsellerden Seç</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="imageMode"
                  checked={imageSelectionMode === 'manual'}
                  onChange={() => {
                    setImageSelectionMode('manual')
                    setNewImageUrl('')
                  }}
                  className="h-4 w-4"
                />
                <span>Manuel URL Gir</span>
              </label>
            </div>
          </div>

          {imageSelectionMode === 'select' && (
            <div>
              <Label htmlFor="imageSelect">
                Mevcut Görsellerden Seç *
              </Label>
              <Select
                value={newImageUrl}
                onValueChange={(value) => {
                  setNewImageUrl(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingImages ? "Yükleniyor..." : "Görsel seçin"} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availableImages.length > 0 ? (
                    availableImages.map((img) => (
                      <SelectItem key={img} value={img}>
                        <div className="flex items-center gap-2 py-1">
                          <div className="relative w-12 h-12 flex-shrink-0 border rounded overflow-hidden bg-gray-100">
                            <Image
                              src={img}
                              alt={img}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <span className="text-sm truncate flex-1">{img}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      {loadingImages ? "Yükleniyor..." : "Görsel bulunamadı"}
                    </div>
                  )}
                </SelectContent>
              </Select>
              {newImageUrl && !isVideo && (
                <div className="mt-2 relative w-32 h-32 border rounded overflow-hidden bg-gray-100">
                  <Image
                    src={newImageUrl}
                    alt="Seçilen görsel"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                public/products klasöründeki görseller listelenir
              </p>
            </div>
          )}

          {imageSelectionMode === 'saved' && (
            <div>
              <Label htmlFor="savedImageSelect">
                Kayıtlı Görsellerden Seç *
              </Label>
              <Select
                value={newImageUrl}
                onValueChange={(value) => {
                  setNewImageUrl(value)
                  const selected = savedAssets.find(a => a.url === value)
                  if (selected?.altText) {
                    setNewImageAlt(selected.altText)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingImages ? "Yükleniyor..." : "Kayıtlı görsel seçin"} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {savedAssets.length > 0 ? (
                    savedAssets.map((asset) => (
                      <SelectItem key={asset.url} value={asset.url}>
                        <div className="flex items-center gap-2 py-1">
                          <div className="relative w-12 h-12 flex-shrink-0 border rounded overflow-hidden bg-gray-100">
                            <Image
                              src={asset.url}
                              alt={asset.altText || asset.url}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <span className="text-sm truncate flex-1">{asset.url}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      {loadingImages ? "Yükleniyor..." : "Kayıtlı görsel bulunamadı"}
                    </div>
                  )}
                </SelectContent>
              </Select>
              {newImageUrl && !isVideo && (
                <div className="mt-2 relative w-32 h-32 border rounded overflow-hidden bg-gray-100">
                  <Image
                    src={newImageUrl}
                    alt="Seçilen görsel"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Daha önce kullanılan görseller listelenir
              </p>
            </div>
          )}

          {imageSelectionMode === 'manual' && (
            <div>
              <Label htmlFor="imageUrl">
                Görsel/Video URL veya Dosya Yolu *
              </Label>
              <Input
                id="imageUrl"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="/products/kategori/urun.jpg veya video URL"
              />
              {newImageUrl && !isVideo && newImageUrl.startsWith('/') && (
                <div className="mt-2 relative w-32 h-32 border rounded overflow-hidden bg-gray-100">
                  <Image
                    src={newImageUrl}
                    alt="Önizleme"
                    fill
                    className="object-cover"
                    unoptimized
                    onError={() => {}}
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Örnek: /products/harley_kapıdirek/harleyquinn.jpg
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="imageAlt">Alt Metin (SEO için)</Label>
            <Input
              id="imageAlt"
              value={newImageAlt}
              onChange={(e) => setNewImageAlt(e.target.value)}
              placeholder="Ürün görseli açıklaması"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isVideo"
              checked={isVideo}
              onChange={(e) => {
                setIsVideo(e.target.checked)
                if (e.target.checked) {
                  setImageSelectionMode('manual')
                  setNewImageUrl('')
                }
              }}
              className="h-4 w-4"
            />
            <Label htmlFor="isVideo">Bu bir video</Label>
          </div>
          {isVideo && (
            <div className="border-t pt-4">
              <Label htmlFor="videoUrl">Video URL *</Label>
              <Input
                id="videoUrl"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/video.mp4 veya /videos/video.mp4"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Video URL'si girin (örn: YouTube embed URL, Vimeo URL veya direkt video linki)
              </p>
            </div>
          )}
          <Button 
            type="button" 
            onClick={addImage} 
            variant="outline"
            disabled={!newImageUrl.trim()}
          >
            {isVideo ? (
              <>
                <Video className="h-4 w-4 mr-2" />
                Video Ekle
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4 mr-2" />
                Görsel Ekle
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

