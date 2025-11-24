'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Banner {
  id: string
  title: string
  type: 'IMAGE' | 'VIDEO'
  filePath: string
  linkUrl?: string | null
}

interface BannerSliderProps {
  banners: Banner[]
}

export function BannerSlider({ banners }: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (banners.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000) // 5 saniyede bir otomatik değiş

    return () => clearInterval(interval)
  }, [banners.length])

  if (banners.length === 0) {
    return (
      <section className="relative w-full h-[600px] mb-12">
        <div className="w-full h-full bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Zen Sticker</h1>
            <p className="text-xl">Premium Araç Sticker ve Kaplama Çözümleri</p>
          </div>
        </div>
      </section>
    )
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  const currentBanner = banners[currentIndex]
  const isVideo = currentBanner.type === 'VIDEO'

  return (
    <section className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] mb-12 overflow-hidden">
      {/* Banner Image/Video */}
      <div className="relative w-full h-full">
        {isVideo ? (
          currentBanner.linkUrl ? (
            <Link href={currentBanner.linkUrl} className="block w-full h-full">
              <video
                src={currentBanner.filePath}
                className="w-full h-full object-contain"
                autoPlay
                muted
                loop
                playsInline
              />
            </Link>
          ) : (
            <video
              src={currentBanner.filePath}
              className="w-full h-full object-contain"
              autoPlay
              muted
              loop
              playsInline
            />
          )
        ) : (
          currentBanner.linkUrl ? (
            <Link href={currentBanner.linkUrl} className="block w-full h-full">
              <Image
                src={currentBanner.filePath}
                alt={currentBanner.title}
                fill
                className="object-contain"
                priority
                quality={95}
                sizes="100vw"
              />
            </Link>
          ) : (
            <Image
              src={currentBanner.filePath}
              alt={currentBanner.title}
              fill
              className="object-contain"
              priority
              quality={95}
              sizes="100vw"
            />
          )
        )}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12 z-10"
            aria-label="Önceki banner"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12 z-10"
            aria-label="Sonraki banner"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

