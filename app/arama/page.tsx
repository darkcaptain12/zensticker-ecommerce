import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductShowcase } from '@/components/ProductShowcase'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { AddToCartButton } from '@/components/AddToCartButton'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  return {
    title: q ? `${q} - Arama Sonuçları | Zen Sticker` : 'Arama | Zen Sticker',
    description: q
      ? `${q} için arama sonuçları`
      : 'Ürün arama sayfası',
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  if (!q || q.trim().length < 2) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Arama</h1>
          <p className="text-gray-600">Lütfen en az 2 karakter girin</p>
        </div>
      </div>
    )
  }

  const searchTerm = q.trim().toLowerCase()

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { category: { name: { contains: searchTerm, mode: 'insensitive' } } },
      ],
    },
    include: {
      images: { where: { isMain: true }, take: 1 },
      category: true,
      campaign: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const calculatePrice = (product: any) => {
    let finalPrice = product.salePrice || product.price
    let originalPrice = product.salePrice ? product.price : null
    let hasCampaign = false

    if (product.campaign && product.campaign.isActive) {
      const now = new Date()
      const startDate = product.campaign.startDate ? new Date(product.campaign.startDate) : null
      const endDate = product.campaign.endDate ? new Date(product.campaign.endDate) : null

      if ((!startDate || now >= startDate) && (!endDate || now <= endDate)) {
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
    return { finalPrice, originalPrice, hasCampaign }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Arama Sonuçları
        </h1>
        <p className="text-gray-600">
          <span className="font-semibold">&quot;{q}&quot;</span> için{' '}
          <span className="font-bold text-primary">{products.length}</span> ürün bulundu
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600 mb-4">
            &quot;{q}&quot; için sonuç bulunamadı
          </p>
          <p className="text-gray-500">
            Farklı anahtar kelimeler deneyebilirsiniz
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => {
            const { finalPrice, originalPrice, hasCampaign } = calculatePrice(product)
            const mainImage = product.images[0]?.url || '/placeholder-product.jpg'

            return (
              <Card
                key={product.id}
                className="hover:shadow-lg transition cursor-pointer h-full flex flex-col group relative overflow-hidden"
              >
                {hasCampaign && (
                  <span className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-md text-xs font-semibold z-10 animate-fade-in">
                    Kampanya!
                  </span>
                )}
                <Link href={`/urun/${product.slug}`}>
                  <div className="relative w-full aspect-square overflow-hidden">
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      className="object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </Link>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <Link href={`/urun/${product.slug}`}>
                    <h3 className="font-semibold mb-2 line-clamp-2 hover:text-primary transition">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="mt-auto space-y-2">
                    {originalPrice && (
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
                    <AddToCartButton product={product} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

