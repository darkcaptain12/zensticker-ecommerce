import { notFound } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Package } from 'lucide-react'
import { ProductDetailClient } from '@/components/ProductDetailClient'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  })

  if (!product) {
    return { title: 'Ürün Bulunamadı | Zen Sticker' }
  }

  return {
    title: `${product.name} | Zen Sticker`,
    description: product.description || `${product.name} - ${product.category.name}`,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { isMain: 'desc' } },
      customOptions: true,
      campaign: true,
    },
  })

  if (!product) {
    notFound()
  }

  // Calculate price with campaign discount
  let finalPrice = product.salePrice || product.price
  let originalPrice = product.salePrice ? product.price : null
  let campaignDiscount = 0

  if (product.campaign && product.campaign.isActive) {
    const now = new Date()
    const startDate = new Date(product.campaign.startDate)
    const endDate = new Date(product.campaign.endDate)
    
    if (now >= startDate && now <= endDate) {
      if (product.campaign.discountPercent) {
        campaignDiscount = (finalPrice * product.campaign.discountPercent) / 100
        originalPrice = finalPrice
        finalPrice = finalPrice - campaignDiscount
      } else if (product.campaign.discountAmount) {
        campaignDiscount = product.campaign.discountAmount
        originalPrice = finalPrice
        finalPrice = Math.max(0, finalPrice - campaignDiscount)
      }
    }
  }

  // JSON-LD for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.name,
    image: product.images.map(img => `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${img.url}`),
    brand: {
      '@type': 'Brand',
      name: 'Zen Sticker',
    },
    offers: {
      '@type': 'Offer',
      price: finalPrice,
      priceCurrency: 'TRY',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden bg-gray-100">
              {product.images.length > 0 ? (
                product.images[0].isVideo ? (
                  <video
                    src={product.images[0].url}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    muted
                    loop
                  />
                ) : (
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].altText || product.name}
                    fill
                    className="object-contain"
                    priority
                  />
                )
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image) => (
                  <div key={image.id} className="relative aspect-square rounded overflow-hidden bg-gray-100">
                    {image.isVideo ? (
                      <video
                        src={image.url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <Image
                        src={image.url}
                        alt={image.altText || product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.category.name}</p>

            <div className="mb-6">
              {originalPrice && originalPrice > finalPrice && (
                <p className="text-lg text-gray-500 line-through mb-1">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  }).format(originalPrice)}
                </p>
              )}
              <p className="text-3xl font-bold text-primary mb-2">
                {new Intl.NumberFormat('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                }).format(finalPrice)}
              </p>
              {product.campaign && campaignDiscount > 0 && (
                <div className="mb-2">
                  <span className="inline-block bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold">
                    🎉 {product.campaign.title}
                    {product.campaign.discountPercent && ` - %${product.campaign.discountPercent} İndirim`}
                    {product.campaign.discountAmount && ` - ${product.campaign.discountAmount}₺ İndirim`}
                  </span>
                </div>
              )}
              <p className="text-sm text-gray-600">
                Stok: {product.stock > 0 ? `${product.stock} adet` : 'Stokta yok'}
              </p>
            </div>

            <ProductDetailClient product={{
              ...product,
              customOptions: product.customOptions ? {
                ...product.customOptions,
                availableFonts: Array.isArray(product.customOptions.availableFonts) 
                  ? product.customOptions.availableFonts as string[]
                  : []
              } : null
            }} />

            {product.description && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Açıklama</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </CardContent>
              </Card>
            )}

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Teslimat & İade</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Aynı gün kargo (saat 15:00'a kadar)</li>
                  <li>• Ücretsiz kargo (200₺ üzeri)</li>
                  <li>• 14 gün içinde iade garantisi</li>
                  <li>• Faturalı ürünler</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

