import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/ProductCard'
import { Breadcrumb } from '@/components/Breadcrumb'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Package, Tag, Calendar, Percent, DollarSign } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const campaign = await prisma.campaign.findUnique({
    where: { id },
  })

  if (!campaign) {
    return { title: 'Kampanya Bulunamadı | Zen Sticker' }
  }

  return {
    title: `${campaign.title} | Zen Sticker`,
    description: campaign.description || campaign.title,
  }
}

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const now = new Date()

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      categories: true,
      products: {
        where: { isActive: true },
        include: {
          images: { where: { isMain: true }, take: 1 },
          category: true,
          campaign: true,
        },
      },
      packageProducts: {
        include: {
          product: {
            include: {
              images: { where: { isMain: true }, take: 1 },
              category: true,
            },
          },
        },
      },
    },
  })

  if (!campaign || !campaign.isActive || campaign.startDate > now || campaign.endDate < now) {
    notFound()
  }

  // Calculate package total value if it's a package
  let packageTotalValue = 0
  if (campaign.type === 'PACKAGE' && campaign.packageProducts.length > 0) {
    packageTotalValue = campaign.packageProducts.reduce((sum, pp) => {
      return sum + (pp.product.price * pp.quantity)
    }, 0)
  }

  // Get all products for display
  let displayProducts: any[] = []
  
  if (campaign.type === 'PRODUCT') {
    displayProducts = campaign.products
  } else if (campaign.type === 'CATEGORY' && campaign.categories.length > 0) {
    const categoryIds = campaign.categories.map(c => c.id)
    displayProducts = await prisma.product.findMany({
      where: {
        categoryId: { in: categoryIds },
        isActive: true,
      },
      include: {
        images: { where: { isMain: true }, take: 1 },
        category: true,
        campaign: true,
      },
      take: 20,
    })
  } else if (campaign.type === 'GENERAL') {
    displayProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        images: { where: { isMain: true }, take: 1 },
        category: true,
        campaign: true,
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    })
  } else if (campaign.type === 'PACKAGE') {
    displayProducts = campaign.packageProducts.map(pp => ({
      ...pp.product,
      packageQuantity: pp.quantity,
    }))
  }

  // Calculate prices with campaign discount
  const productsWithPrices = displayProducts.map(product => {
    let finalPrice = product.salePrice || product.price
    let originalPrice = product.salePrice ? product.price : null
    let hasCampaign = false
    let hasSale = !!product.salePrice

    // Apply campaign discount
    if (campaign.type === 'GENERAL' || campaign.type === 'CATEGORY' || campaign.type === 'PRODUCT') {
      if (campaign.discountPercent) {
        const discount = (finalPrice * campaign.discountPercent) / 100
        originalPrice = finalPrice
        finalPrice = finalPrice - discount
        hasCampaign = true
      } else if (campaign.discountAmount) {
        originalPrice = finalPrice
        finalPrice = Math.max(0, finalPrice - campaign.discountAmount)
        hasCampaign = true
      }
    } else if (campaign.type === 'PACKAGE' && campaign.packagePrice) {
      // Package price is already set
      finalPrice = campaign.packagePrice / (product.packageQuantity || 1)
      originalPrice = product.price
      hasCampaign = true
    }

    return {
      ...product,
      finalPrice,
      originalPrice,
      hasCampaign,
      hasSale,
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Kampanyalar', href: '/kampanyalar' },
          { label: campaign.title },
        ]}
      />

      {/* Campaign Header */}
      <div className="mb-12">
        {campaign.imageUrl && (
          <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
            <Image
              src={campaign.imageUrl}
              alt={campaign.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <Badge className="mb-3 bg-red-500">Kampanya</Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-3">{campaign.title}</h1>
              {campaign.description && (
                <p className="text-lg md:text-xl text-white/90">{campaign.description}</p>
              )}
            </div>
          </div>
        )}

        {!campaign.imageUrl && (
          <div className="mb-6">
            <Badge className="mb-3 bg-red-500">Kampanya</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-3">{campaign.title}</h1>
            {campaign.description && (
              <p className="text-lg text-gray-600">{campaign.description}</p>
            )}
          </div>
        )}

        {/* Campaign Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-600">Geçerlilik</p>
                  <p className="font-semibold">
                    {new Date(campaign.startDate).toLocaleDateString('tr-TR')} -{' '}
                    {new Date(campaign.endDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {campaign.discountPercent && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Percent className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">İndirim</p>
                    <p className="font-semibold text-green-600">%{campaign.discountPercent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {campaign.discountAmount && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">İndirim</p>
                    <p className="font-semibold text-green-600">
                      {formatPrice(campaign.discountAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {campaign.type === 'PACKAGE' && campaign.packagePrice && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">Paket Fiyatı</p>
                    <div className="flex items-baseline gap-2">
                      {packageTotalValue > campaign.packagePrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(packageTotalValue)}
                        </span>
                      )}
                      <p className="font-semibold text-primary">
                        {formatPrice(campaign.packagePrice)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {campaign.minPurchaseAmount && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">Minimum Tutar</p>
                    <p className="font-semibold">{formatPrice(campaign.minPurchaseAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Package Products List */}
        {campaign.type === 'PACKAGE' && campaign.packageProducts.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Paket İçeriği</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {campaign.packageProducts.map((pp, idx) => (
                  <li key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      {pp.product.images[0] && (
                        <div className="relative w-12 h-12 rounded overflow-hidden">
                          <Image
                            src={pp.product.images[0].url}
                            alt={pp.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/urun/${pp.product.slug}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {pp.product.name}
                        </Link>
                        <p className="text-sm text-gray-600">
                          {formatPrice(pp.product.price)} x {pp.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">
                      {formatPrice(pp.product.price * pp.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
              {packageTotalValue > campaign.packagePrice! && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Normal Fiyat: <span className="line-through">{formatPrice(packageTotalValue)}</span>
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    Kampanya Fiyatı: {formatPrice(campaign.packagePrice!)}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    %{Math.round(((packageTotalValue - campaign.packagePrice!) / packageTotalValue) * 100)} tasarruf
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Category List */}
        {campaign.type === 'CATEGORY' && campaign.categories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Kampanya Kategorileri</h3>
            <div className="flex flex-wrap gap-2">
              {campaign.categories.map((category) => (
                <Link key={category.id} href={`/kategori/${category.slug}`}>
                  <Badge variant="outline" className="hover:bg-primary hover:text-white transition-colors">
                    {category.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {productsWithPrices.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {campaign.type === 'PACKAGE' ? 'Paket Ürünleri' : 'Kampanya Ürünleri'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {productsWithPrices.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                finalPrice={product.finalPrice}
                originalPrice={product.originalPrice}
                hasCampaign={product.hasCampaign}
                hasSale={product.hasSale}
              />
            ))}
          </div>
        </div>
      )}

      {productsWithPrices.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Tag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Bu kampanyada henüz ürün bulunmamaktadır.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

