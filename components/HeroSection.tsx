'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, TrendingUp, Award } from 'lucide-react'

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:bg-gradient-to-br dark:from-dark dark:via-dark-soft dark:to-dark-card">
      {/* Animated Background - Only in dark mode */}
      <div 
        className="absolute inset-0 gradient-hero opacity-90 hidden dark:block"
        style={{
          backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
        }}
      />
      
      {/* Particles - Only in dark mode */}
      <div className="particles hidden dark:block">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${Math.random() * 10 + 15}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:glass border border-primary/20 dark:border-white/20 text-foreground dark:text-white mb-4 animate-scale-in">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Premium Kalite Garantisi</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground dark:text-white mb-6 leading-tight">
            <span className="block">Araç Sticker</span>
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              & Kaplama Çözümleri
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground dark:text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Premium kalitede araç sticker ve kaplama çözümleriyle aracınızı öne çıkarın. 
            Kişiye özel tasarımlar ve profesyonel uygulama garantisi.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/kategoriler">
              <Button 
                size="lg" 
                className="btn-modern text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-white shadow-lg hover:shadow-xl group transition-all dark:shadow-neon-sm dark:hover:shadow-neon"
              >
                Ürünleri Keşfet
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/kampanyalar">
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 bg-white/95 backdrop-blur-sm dark:glass border-2 border-primary dark:border-white/30 text-primary dark:text-white hover:bg-primary hover:text-white dark:hover:bg-white/10 dark:hover:border-white/50 transition-all shadow-lg dark:shadow-neon-sm"
              >
                Kampanyaları Gör
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
            <div className="bg-card dark:glass border border-border dark:border-white/20 rounded-2xl p-6 text-foreground dark:text-white animate-float" style={{ animationDelay: '0s' }}>
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold mb-1">1000+</div>
              <div className="text-sm text-muted-foreground dark:text-white/80">Mutlu Müşteri</div>
            </div>
            <div className="bg-card dark:glass border border-border dark:border-white/20 rounded-2xl p-6 text-foreground dark:text-white animate-float" style={{ animationDelay: '2s' }}>
              <Award className="h-8 w-8 mx-auto mb-3 text-accent" />
              <div className="text-3xl font-bold mb-1">5000+</div>
              <div className="text-sm text-muted-foreground dark:text-white/80">Tamamlanan Proje</div>
            </div>
            <div className="bg-card dark:glass border border-border dark:border-white/20 rounded-2xl p-6 text-foreground dark:text-white animate-float" style={{ animationDelay: '4s' }}>
              <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold mb-1">%100</div>
              <div className="text-sm text-muted-foreground dark:text-white/80">Müşteri Memnuniyeti</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-foreground/50 dark:border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-foreground/50 dark:bg-white/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}

