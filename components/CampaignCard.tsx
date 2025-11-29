'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Zap, ArrowRight, Package } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface CampaignCardProps {
  campaign: {
    id: string
    title: string
    description?: string | null
    type: string
    discountPercent?: number | null
    discountAmount?: number | null
    packagePrice?: number | null
    imageUrl?: string | null
    minPurchaseAmount?: number | null
    startDate: Date
    endDate: Date
    directProducts: Array<{
      id: string
      name: string
      slug: string
      price: number
      images: Array<{ url: string }>
    }>
    packageProducts: Array<{
      product: {
        id: string
        name: string
        slug: string
        price: number
        images: Array<{ url: string }>
      }
      quantity: number
    }>
    categories: Array<{ name: string }>
  }
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const { addItem } = useCart()
  const router = useRouter()
  const [adding, setAdding] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setAdding(true)

    if (campaign.type === 'PACKAGE' && campaign.packageProducts.length > 0) {
      // Add all package products
      campaign.packageProducts.forEach((pp) => {
        const mainImage = pp.product.images[0]?.url || '/placeholder-product.jpg'
        addItem({
          productId: pp.product.id,
          name: pp.product.name,
          price: pp.product.price,
          image: mainImage,
          quantity: pp.quantity,
        })
      })
    } else if (campaign.directProducts.length > 0) {
      // Add first product from campaign
      const product = campaign.directProducts[0]
      const mainImage = product.images[0]?.url || '/placeholder-product.jpg'
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: mainImage,
        quantity: 1,
      })
    }

    setTimeout(() => {
      setAdding(false)
    }, 300)
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    handleAddToCart(e)
    setTimeout(() => {
      router.push('/odeme')
    }, 300)
  }

  // Calculate total package value if it's a package
  let packageTotalValue = 0
  if (campaign.type === 'PACKAGE' && campaign.packageProducts.length > 0) {
    packageTotalValue = campaign.packageProducts.reduce((sum, pp) => {
      return sum + (pp.product.price * pp.quantity)
    }, 0)
  }

  return (
    <Card className="hover:shadow-lg transition h-full flex flex-col group overflow-hidden">
      {/* Kapak Görseli - 16:9 Aspect Ratio */}
      {campaign.imageUrl ? (
        <Link href={`/kampanya/${campaign.id}`} className="relative w-full aspect-video overflow-hidden block rounded-t-lg">
          <Image
            src={campaign.imageUrl}
            alt={campaign.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            unoptimized={campaign.imageUrl.includes('supabase.co') || campaign.imageUrl.includes('supabase.in')}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
          <Badge className="absolute top-3 right-3 bg-red-500 text-white shadow-lg z-10">Kampanya</Badge>
        </Link>
      ) : (
        <div className="relative w-full aspect-video bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 flex items-center justify-center rounded-t-lg">
          <Package className="h-20 w-20 text-primary/50" />
          <Badge className="absolute top-3 right-3 bg-red-500 text-white shadow-lg z-10">Kampanya</Badge>
        </div>
      )}
      
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <Link href={`/kampanya/${campaign.id}`}>
            <h2 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
              {campaign.title}
            </h2>
          </Link>
          {campaign.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{campaign.description}</p>
          )}
        </div>

        <div className="mt-auto space-y-3">
          {campaign.type === 'PACKAGE' && campaign.packagePrice ? (
            <div>
              <div className="flex items-baseline gap-2">
                {packageTotalValue > campaign.packagePrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(packageTotalValue)}
                  </span>
                )}
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(campaign.packagePrice)}
                </span>
              </div>
              {packageTotalValue > campaign.packagePrice && (
                <p className="text-xs text-green-600 mt-1">
                  %{Math.round(((packageTotalValue - campaign.packagePrice) / packageTotalValue) * 100)} tasarruf
                </p>
              )}
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-semibold mb-1">Paket İçeriği:</p>
                <ul className="list-disc list-inside space-y-1">
                  {campaign.packageProducts.map((pp, idx) => (
                    <li key={idx}>
                      {pp.product.name} x {pp.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <>
              {campaign.discountPercent && (
                <p className="text-lg font-semibold text-green-600">
                  %{campaign.discountPercent} İndirim
                </p>
              )}
              {campaign.discountAmount && (
                <p className="text-lg font-semibold text-green-600">
                  {formatPrice(campaign.discountAmount)} İndirim
                </p>
              )}
              {campaign.minPurchaseAmount && (
                <p className="text-sm text-gray-600">
                  Min: {formatPrice(campaign.minPurchaseAmount)} alışveriş
                </p>
              )}
            </>
          )}

          {campaign.type === 'CATEGORY' && campaign.categories.length > 0 && (
            <div className="text-sm text-gray-600">
              <p className="font-semibold">Kategoriler:</p>
              <p>{campaign.categories.map(c => c.name).join(', ')}</p>
            </div>
          )}

          {campaign.type === 'PRODUCT' && campaign.directProducts.length > 0 && (
            <div className="text-sm text-gray-600">
              <p className="font-semibold">{campaign.directProducts.length} ürün</p>
            </div>
          )}

          <p className="text-xs text-gray-500">
            {new Date(campaign.startDate).toLocaleDateString('tr-TR')} -{' '}
            {new Date(campaign.endDate).toLocaleDateString('tr-TR')}
          </p>

          {/* Action Buttons - Sadece PACKAGE tipi için göster */}
          {campaign.type === 'PACKAGE' && (
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleAddToCart}
                disabled={adding || campaign.packageProducts.length === 0}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-neon-lg text-white"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {adding ? 'Ekleniyor...' : 'Sepete Ekle'}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={adding || campaign.packageProducts.length === 0}
                variant="outline"
                className="flex-1 border-primary hover:bg-primary hover:text-white"
                size="sm"
              >
                <Zap className="h-4 w-4 mr-2" />
                Hızlı Al
              </Button>
            </div>
          )}

          <Link href={`/kampanya/${campaign.id}`}>
            <Button variant="ghost" className="w-full mt-2" size="sm">
              Detayları Gör <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

