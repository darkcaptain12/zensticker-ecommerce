'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Eye, ShoppingCart } from 'lucide-react'

interface ProductSocialProofProps {
  productId: string
  enabled?: boolean
}

export function ProductSocialProof({ productId, enabled = true }: ProductSocialProofProps) {
  const [viewers, setViewers] = useState(0)
  const [todaySales, setTodaySales] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!enabled) return

    setMounted(true)

    // Generate random but realistic numbers
    const generateViewers = () => {
      // Random between 5-25 viewers
      const base = 5 + Math.floor(Math.random() * 20)
      setViewers(base)
    }

    const generateTodaySales = () => {
      // Random between 1-15 sales today
      const sales = 1 + Math.floor(Math.random() * 14)
      setTodaySales(sales)
    }

    // Initial values
    generateViewers()
    generateTodaySales()

    // Update viewers every 8-15 seconds (random interval)
    const viewerInterval = setInterval(() => {
      generateViewers()
    }, 8000 + Math.random() * 7000)

    // Update sales every 20-30 seconds (random interval)
    const salesInterval = setInterval(() => {
      generateTodaySales()
    }, 20000 + Math.random() * 10000)

    return () => {
      clearInterval(viewerInterval)
      clearInterval(salesInterval)
    }
  }, [productId, enabled])

  if (!enabled || !mounted) return null

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {viewers > 0 && (
        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
          <Eye className="h-3 w-3 mr-1.5" />
          <span className="font-semibold">{viewers}</span> kişi şu an bakıyor
        </Badge>
      )}
      {todaySales > 0 && (
        <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
          <ShoppingCart className="h-3 w-3 mr-1.5" />
          Bugün <span className="font-semibold">{todaySales}</span> adet satıldı
        </Badge>
      )}
    </div>
  )
}

