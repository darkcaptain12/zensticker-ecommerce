'use client'

import { Button } from '@/components/ui/button'
import { Play, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export function VideoBackgroundSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data.videoBackgroundUrl) {
          setVideoUrl(data.videoBackgroundUrl)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        {isPlaying && videoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900" />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ürünlerimizi{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300">
              Canlı Görün
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            Premium kalite sticker ve kaplama çözümlerimizi videolarda inceleyin
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn-modern px-8 py-4 bg-white text-purple-600 rounded-full font-semibold text-lg hover:bg-gray-100 flex items-center justify-center gap-2 glow-hover"
            >
              {isPlaying ? (
                <>
                  <span>Duraklat</span>
                </>
              ) : (
                <>
                  <Play className="h-6 w-6 fill-purple-600" />
                  <span>Video İzle</span>
                </>
              )}
            </button>
            <Link href="/kategoriler">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 glass text-white border-white/30 hover:bg-white/10 rounded-full font-semibold text-lg"
              >
                Ürünleri Keşfet
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}

