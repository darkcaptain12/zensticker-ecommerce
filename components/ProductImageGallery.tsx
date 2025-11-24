'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductImage {
  id: string
  url: string
  altText?: string | null
  isVideo: boolean
}

interface ProductImageGalleryProps {
  images: ProductImage[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="relative w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">Görsel bulunamadı</p>
      </div>
    )
  }

  const currentImage = images[selectedIndex]
  const lightboxImages = images.filter(img => !img.isVideo)
  const currentLightboxImage = lightboxImages[lightboxIndex]

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length)
  }

  const openLightbox = (index: number) => {
    const imageIndex = images.findIndex(img => img.id === images[index].id)
    const lightboxPos = lightboxImages.findIndex(img => img.id === images[index].id)
    if (lightboxPos !== -1) {
      setLightboxIndex(lightboxPos)
      setLightboxOpen(true)
    }
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const lightboxPrevious = () => {
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length)
  }

  const lightboxNext = () => {
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 group">
          {currentImage.isVideo ? (
            <video
              src={currentImage.url}
              className="w-full h-full object-contain"
              controls
              autoPlay
              muted
              loop
            />
          ) : (
            <>
              <Image
                src={currentImage.url}
                alt={currentImage.altText || productName}
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <button
                onClick={() => openLightbox(selectedIndex)}
                className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                aria-label="Görseli büyüt"
              >
                <ZoomIn className="h-12 w-12 text-white drop-shadow-lg" />
              </button>
            </>
          )}
          
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Önceki görsel"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Sonraki görsel"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedIndex(index)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex === index
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-transparent hover:border-gray-300'
                }`}
                aria-label={`Görsel ${index + 1}`}
              >
                {image.isVideo ? (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs">Video</span>
                  </div>
                ) : (
                  <Image
                    src={image.url}
                    alt={image.altText || `${productName} - Görsel ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 25vw, 20vw"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && currentLightboxImage && !currentLightboxImage.isVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            aria-label="Kapat"
          >
            <X className="h-8 w-8" />
          </button>
          
          {lightboxImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  lightboxPrevious()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full h-12 w-12"
                aria-label="Önceki görsel"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  lightboxNext()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full h-12 w-12"
                aria-label="Sonraki görsel"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          <div
            className="relative max-w-7xl max-h-[90vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentLightboxImage.url}
              alt={currentLightboxImage.altText || productName}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {lightboxIndex + 1} / {lightboxImages.length}
          </div>
        </div>
      )}
    </>
  )
}

