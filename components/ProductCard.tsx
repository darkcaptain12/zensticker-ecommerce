'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    salePrice?: number | null
    images: Array<{ url: string; altText?: string | null }>
    stock: number
  }
  finalPrice: number
  originalPrice: number | null
  hasCampaign: boolean
  hasSale: boolean
}

export function ProductCard({ product, finalPrice, originalPrice, hasCampaign, hasSale }: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const mainImage = product.images[0]?.url || '/placeholder-product.jpg'

  return (
    <Link href={`/urun/${product.slug}`}>
      <Card 
        className="group hover:shadow-lg dark:hover:shadow-neon-lg transition-all duration-500 cursor-pointer h-full flex flex-col overflow-hidden border border-border dark:border-dark-border hover:border-primary/50 relative rounded-2xl bg-card dark:bg-dark-card backdrop-blur-sm"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Neon Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 rounded-2xl" />
        <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-border dark:to-dark-card z-10 rounded-t-2xl">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-dark-border animate-pulse" />
          )}
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-700 brightness-90 group-hover:brightness-110 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
            onLoad={() => setImageLoading(false)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent dark:from-dark/80 dark:via-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {/* Neon Shimmer Effect */}
          <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
          
          {(hasSale || hasCampaign) && (
            <Badge 
              className="absolute top-3 right-3 bg-gradient-to-r from-accent to-accent-light text-white font-bold shadow-neon-pink z-20 px-4 py-1.5 rounded-xl border border-accent/50"
            >
              {hasCampaign ? '🎉 Kampanya' : '🔥 İndirim'}
            </Badge>
          )}
          
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 dark:bg-dark/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-t-2xl">
            <Badge variant="destructive" className="text-lg px-4 py-2 rounded-xl">
              Stokta Yok
            </Badge>
          </div>
          )}

          <div className={`absolute bottom-0 left-0 right-0 p-4 transform transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}>
            <div className="flex items-center justify-center gap-2 bg-card/95 dark:bg-dark-card/95 backdrop-blur-md rounded-xl p-2 border border-primary/30 dark:shadow-neon-sm">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Hızlı Görüntüle</span>
            </div>
          </div>
        </div>
        
        <CardContent className="p-5 flex-1 flex flex-col relative z-10 bg-card dark:bg-dark-card rounded-b-2xl">
          <h3 className="font-bold text-lg mb-3 line-clamp-2 min-h-[3.5rem] text-foreground group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent transition-all duration-300">
            {product.name}
          </h3>
          <div className="mt-auto space-y-2">
            {originalPrice && originalPrice > finalPrice && (
              <p className="text-sm text-muted-foreground line-through">
                {new Intl.NumberFormat('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                }).format(originalPrice)}
              </p>
            )}
            <div className="flex items-center justify-between">
              <p className="text-2xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {new Intl.NumberFormat('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                }).format(finalPrice)}
              </p>
              {product.stock > 0 && product.stock < 10 && (
                <Badge className="bg-gradient-to-r from-accent to-accent-light text-white text-xs font-bold border border-accent/50 dark:shadow-neon-pink">
                  Son {product.stock} adet
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

