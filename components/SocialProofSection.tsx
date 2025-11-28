'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, MapPin, Clock } from 'lucide-react'

// Generate dynamic recent purchases
const generateRecentPurchases = () => {
  const names = ['Ahmet Y.', 'Zeynep D.', 'Mehmet K.', 'Ayşe Ş.', 'Can Ö.', 'Elif M.', 'Burak T.', 'Selin A.']
  const locations = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Gaziantep', 'Kocaeli']
  const products = ['Kapı Direk Kaplama', 'Özel Tasarım Sticker', 'Premium Sticker Paketi', 'Tam Kaplama Seti', 'Kişiye Özel Sticker', 'Araç Kaplama', 'Sticker Paketi']
  const times = ['2 dakika önce', '5 dakika önce', '8 dakika önce', '12 dakika önce', '15 dakika önce', '20 dakika önce', '25 dakika önce', '30 dakika önce']
  
  return Array.from({ length: 8 }, (_, i) => ({
    name: names[Math.floor(Math.random() * names.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    product: products[Math.floor(Math.random() * products.length)],
    time: times[Math.floor(Math.random() * times.length)],
  }))
}

interface SocialProofSectionProps {
  enabled?: boolean
}

export function SocialProofSection({ enabled = true }: SocialProofSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [recentPurchases, setRecentPurchases] = useState(generateRecentPurchases())

  useEffect(() => {
    // Regenerate purchases every 30 seconds
    const regenerateInterval = setInterval(() => {
      setRecentPurchases(generateRecentPurchases())
    }, 30000)

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % recentPurchases.length)
    }, 3000 + Math.random() * 2000) // Random interval between 3-5 seconds

    return () => {
      clearInterval(interval)
      clearInterval(regenerateInterval)
    }
  }, [recentPurchases.length])

  if (!enabled) return null

  const currentPurchase = recentPurchases[currentIndex]
  
  // Generate random sales count for last 24 hours
  const salesCount = 45 + Math.floor(Math.random() * 30) // 45-75 sales

  return (
    <section className="py-12 bg-gray-50/50 dark:bg-dark-card/30 border-y border-border dark:border-primary/20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="max-w-4xl mx-auto">
          <Card className="border border-border dark:border-primary/30 bg-gradient-to-r from-card/80 to-gray-50/80 dark:from-dark-card/80 dark:to-dark-soft/80 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold flex-shrink-0 dark:shadow-neon-sm">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-foreground">{currentPurchase.name}</span>
                    <span className="text-muted-foreground text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {currentPurchase.location}
                    </span>
                  </div>
                  <p className="text-foreground/90 font-medium truncate">{currentPurchase.product}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {currentPurchase.time}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-primary">Sipariş Verdi</div>
                  <div className="text-xs text-muted-foreground">✓ Onaylandı</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">Son 24 saatte</span> {salesCount}+ sipariş tamamlandı
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

