import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Truck, Shield, FileText } from 'lucide-react'
import { BannerSlider } from '@/components/BannerSlider'

export default async function HomePage() {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { position: 'asc' },
    take: 3,
  })

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    take: 6,
  })

  const featuredProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: { where: { isMain: true }, take: 1 },
      category: true,
      campaign: true,
    },
    take: 8,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      {/* Hero Banner Section */}
      <BannerSlider banners={banners} />

      {/* Trust Badges */}
      <section className="container mx-auto px-4 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <Truck className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Aynı Gün Kargo</h3>
            <p className="text-sm text-gray-600">Siparişleriniz aynı gün kargoya verilir</p>
          </Card>
          <Card className="text-center p-6">
            <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Güvenli Ödeme</h3>
            <p className="text-sm text-gray-600">256-bit SSL ile güvenli ödeme</p>
          </Card>
          <Card className="text-center p-6">
            <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Faturalı Ürünler</h3>
            <p className="text-sm text-gray-600">Tüm ürünlerimiz faturalıdır</p>
          </Card>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Kategoriler</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/kategori/${category.slug}`}>
              <Card className="hover:shadow-lg transition cursor-pointer h-full">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Öne Çıkan Ürünler</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product) => {
            // Calculate price with campaign
            let finalPrice = product.salePrice || product.price
            let originalPrice = product.salePrice ? product.price : null
            let hasCampaign = false

            if (product.campaign && product.campaign.isActive) {
              const now = new Date()
              const startDate = new Date(product.campaign.startDate)
              const endDate = new Date(product.campaign.endDate)
              
              if (now >= startDate && now <= endDate) {
                hasCampaign = true
                if (product.campaign.discountPercent) {
                  originalPrice = finalPrice
                  finalPrice = finalPrice - (finalPrice * product.campaign.discountPercent / 100)
                } else if (product.campaign.discountAmount) {
                  originalPrice = finalPrice
                  finalPrice = Math.max(0, finalPrice - product.campaign.discountAmount)
                }
              }
            }

            const mainImage = product.images[0]?.url || '/placeholder-product.jpg'

            return (
              <Link key={product.id} href={`/urun/${product.slug}`}>
                <Card className="hover:shadow-lg transition cursor-pointer h-full flex flex-col">
                  <div className="relative w-full aspect-square">
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                    {(product.salePrice || hasCampaign) && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        {hasCampaign ? 'Kampanya' : 'İndirim'}
                      </span>
                    )}
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <div className="mt-auto">
                      {originalPrice && originalPrice > finalPrice && (
                        <p className="text-sm text-gray-500 line-through">
                          {new Intl.NumberFormat('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                          }).format(originalPrice)}
                        </p>
                      )}
                      <p className="text-lg font-bold text-primary">
                        {new Intl.NumberFormat('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        }).format(finalPrice)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

