import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProductDetailClient } from '@/components/ProductDetailClient'
import { ProductImageGallery } from '@/components/ProductImageGallery'
import { Breadcrumb } from '@/components/Breadcrumb'
import { ProductCard } from '@/components/ProductCard'
import { ProductSocialProof } from '@/components/ProductSocialProof'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { 
      category: true,
      images: true,
    },
  })

  if (!product) {
    return { title: 'Ürün Bulunamadı | Zen Sticker' }
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const mainImage = product.images.find(img => img.isMain) || product.images[0]
  const imageUrl = mainImage ? `${baseUrl}${mainImage.url}` : `${baseUrl}/placeholder-product.jpg`

  return {
    title: product.name,
    description: product.description || `${product.name} - ${product.category.name}. Kaliteli araç sticker ve kaplama çözümleri.`,
    keywords: [product.name, product.category.name, 'araç sticker', 'sticker', 'kaplama'],
    openGraph: {
      title: product.name,
      description: product.description || `${product.name} - ${product.category.name}`,
      images: [imageUrl],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
    description: product.description || `${product.name} - ${product.category.name}`,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${baseUrl}/urun/${product.slug}`,
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Get site settings for social proof
  const siteSettings = await prisma.siteSettings.findFirst()
  const socialProofEnabled = siteSettings?.socialProofEnabled ?? true
  
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { isMain: 'desc' } },
      customOptions: true,
      campaign: true,
      variants: { orderBy: { name: 'asc' } },
    },
  })

  if (!product) {
    notFound()
  }

  // Get related products (same category, different product)
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    include: {
      images: { where: { isMain: true }, take: 1 },
      campaign: true,
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
  })

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
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.name,
    image: product.images.map(img => `${baseUrl}${img.url}`),
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: 'Zen Sticker',
    },
    category: product.category.name,
    offers: {
      '@type': 'Offer',
      price: finalPrice,
      priceCurrency: 'TRY',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${baseUrl}/urun/${product.slug}`,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: product.category.name, href: `/kategori/${product.category.slug}` },
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16 mt-6">
          {/* Product Images */}
          <div>
            <ProductImageGallery
              images={product.images.map(img => ({
                id: img.id,
                url: img.url,
                altText: img.altText,
                isVideo: img.isVideo,
              }))}
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Link href={`/kategori/${product.category.slug}`}>
                <Badge variant="outline" className="mb-3 hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all border-border dark:border-dark-border text-foreground dark:text-white">
                  {product.category.name}
                </Badge>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">{product.name}</h1>
            </div>

            <div className="space-y-4">
              {originalPrice && originalPrice > finalPrice && (
                <p className="text-xl text-muted-foreground line-through">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  }).format(originalPrice)}
                </p>
              )}
              <div className="flex items-baseline gap-3 flex-wrap">
                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  }).format(finalPrice)}
                </p>
                {product.campaign && campaignDiscount > 0 && (
                  <Badge className="bg-gradient-to-r from-accent to-accent-light dark:hover:shadow-neon-pink text-white text-sm px-3 py-1 border border-accent/50">
                    🎉 {product.campaign.title}
                    {product.campaign.discountPercent && ` - %${product.campaign.discountPercent} İndirim`}
                    {product.campaign.discountAmount && ` - ${product.campaign.discountAmount}₺ İndirim`}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4">
                <p className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {product.stock > 0 ? `✓ Stokta var (${product.stock} adet)` : '✗ Stokta yok'}
                </p>
              </div>
              
              {/* Social Proof */}
              <ProductSocialProof productId={product.id} enabled={socialProofEnabled} />
            </div>

            <ProductDetailClient product={{
              ...product,
              variants: product.variants || [],
              customOptions: product.customOptions ? {
                ...product.customOptions,
                availableFonts: Array.isArray(product.customOptions.availableFonts) 
                  ? product.customOptions.availableFonts as string[]
                  : []
              } : null
            }} />

            {product.description && (
              <Card className="border border-border dark:border-dark-border bg-card dark:bg-dark-card/50 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Ürün Açıklaması</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose max-w-none prose-headings:font-bold prose-headings:text-foreground dark:prose-headings:text-white prose-p:text-muted-foreground dark:prose-p:text-gray-300 prose-strong:text-foreground dark:prose-strong:text-white prose-ul:text-muted-foreground dark:prose-ul:text-gray-300 prose-ol:text-muted-foreground dark:prose-ol:text-gray-300 prose-a:text-primary hover:prose-a:text-accent"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </CardContent>
              </Card>
            )}

            <Card className="border border-border dark:border-dark-border bg-card dark:bg-dark-card/50 backdrop-blur-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Teslimat & İade</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span>Aynı gün kargo (saat 15:00'a kadar)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span>Ücretsiz kargo (200₺ üzeri)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span>14 gün içinde iade garantisi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span>Faturalı ürünler</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">Benzer Ürünler</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => {
                let relatedFinalPrice = relatedProduct.salePrice || relatedProduct.price
                let relatedOriginalPrice = relatedProduct.salePrice ? relatedProduct.price : null
                let relatedHasCampaign = false

                if (relatedProduct.campaign && relatedProduct.campaign.isActive) {
                  const now = new Date()
                  const startDate = new Date(relatedProduct.campaign.startDate)
                  const endDate = new Date(relatedProduct.campaign.endDate)
                  
                  if (now >= startDate && now <= endDate) {
                    relatedHasCampaign = true
                    if (relatedProduct.campaign.discountPercent) {
                      relatedOriginalPrice = relatedFinalPrice
                      relatedFinalPrice = relatedFinalPrice - (relatedFinalPrice * relatedProduct.campaign.discountPercent / 100)
                    } else if (relatedProduct.campaign.discountAmount) {
                      relatedOriginalPrice = relatedFinalPrice
                      relatedFinalPrice = Math.max(0, relatedFinalPrice - relatedProduct.campaign.discountAmount)
                    }
                  }
                }

                return (
                  <ProductCard
                    key={relatedProduct.id}
                    product={{
                      id: relatedProduct.id,
                      name: relatedProduct.name,
                      slug: relatedProduct.slug,
                      price: relatedProduct.price,
                      salePrice: relatedProduct.salePrice,
                      images: relatedProduct.images,
                      stock: relatedProduct.stock,
                    }}
                    finalPrice={relatedFinalPrice}
                    originalPrice={relatedOriginalPrice}
                    hasCampaign={relatedHasCampaign}
                    hasSale={!!relatedProduct.salePrice}
                  />
                )
              })}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

