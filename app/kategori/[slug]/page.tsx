import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Filter, Grid, List, ArrowLeft, ArrowRight } from 'lucide-react'
import { AddToCartButton } from '@/components/AddToCartButton'
import { Breadcrumb } from '@/components/Breadcrumb'
import { ProductCard } from '@/components/ProductCard'
import { ProductFilters } from '@/components/ProductFilters'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await prisma.category.findUnique({
    where: { slug },
  })

  if (!category) {
    return { title: 'Kategori Bulunamadı | Zen Sticker' }
  }

  return {
    title: `${category.name} | Zen Sticker`,
    description: category.description || `${category.name} kategorisindeki ürünler`,
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string; page?: string; minPrice?: string; maxPrice?: string; inStock?: string; onSale?: string }>
}) {
  const { slug } = await params
  const { sort = 'new', page = '1', minPrice, maxPrice, inStock, onSale } = await searchParams
  const currentPage = parseInt(page as string) || 1
  const itemsPerPage = 12

  const category = await prisma.category.findUnique({
    where: { slug },
  })

  if (!category) {
    notFound()
  }

  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'price-asc') {
    orderBy = { price: 'asc' }
  } else if (sort === 'price-desc') {
    orderBy = { price: 'desc' }
  } else if (sort === 'name-asc') {
    orderBy = { name: 'asc' }
  }

  // Build where clause with filters
  const where: any = {
    categoryId: category.id,
    isActive: true,
  }

  if (minPrice) {
    where.price = { ...where.price, gte: parseFloat(minPrice) }
  }
  if (maxPrice) {
    where.price = { ...where.price, lte: parseFloat(maxPrice) }
  }
  if (inStock === 'true') {
    where.stock = { gt: 0 }
  }
  if (onSale === 'true') {
    where.salePrice = { not: null }
  }

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { where: { isMain: true }, take: 1 },
        category: true,
        campaign: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
          select: {
            id: true,
            discountPercent: true,
            discountAmount: true,
            startDate: true,
            endDate: true,
            isActive: true,
          },
        },
      },
      orderBy,
      skip: (currentPage - 1) * itemsPerPage,
      take: itemsPerPage,
    }),
    prisma.product.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Breadcrumb
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Kategoriler', href: '/kategoriler' },
              { label: category.name, href: `/kategori/${category.slug}` },
            ]}
          />
          <h1 className="text-4xl md:text-6xl font-bold mb-4 mt-8">{category.name}</h1>
          {category.description && (
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Filters and Sort */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <ProductFilters />
            <span className="text-gray-700 font-medium">
              {totalCount} ürün bulundu
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={`/kategori/${slug}?sort=new&page=1`}>
              <Button
                variant={sort === 'new' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
              >
                Yeni Eklenenler
              </Button>
            </Link>
            <Link href={`/kategori/${slug}?sort=price-asc&page=1`}>
              <Button
                variant={sort === 'price-asc' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
              >
                Fiyat: Düşükten Yükseğe
              </Button>
            </Link>
            <Link href={`/kategori/${slug}?sort=price-desc&page=1`}>
              <Button
                variant={sort === 'price-desc' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
              >
                Fiyat: Yüksekten Düşüğe
              </Button>
            </Link>
            <Link href={`/kategori/${slug}?sort=name-asc&page=1`}>
              <Button
                variant={sort === 'name-asc' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
              >
                İsme Göre (A-Z)
              </Button>
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {products.map((product) => {
                // Calculate price with campaign
                let finalPrice = product.salePrice || product.price
                let originalPrice = product.salePrice ? product.price : null
                let hasCampaign = false

                if (product.campaign) {
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

                return (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      price: product.price,
                      salePrice: product.salePrice,
                      images: product.images,
                      stock: product.stock,
                    }}
                    finalPrice={finalPrice}
                    originalPrice={originalPrice}
                    hasCampaign={hasCampaign}
                    hasSale={!!product.salePrice}
                  />
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {currentPage > 1 && (
                  <Link href={`/kategori/${slug}?sort=${sort}&page=${currentPage - 1}`}>
                    <Button variant="outline" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Önceki
                    </Button>
                  </Link>
                )}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Link key={pageNum} href={`/kategori/${slug}?sort=${sort}&page=${pageNum}`}>
                        <Button
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          className="min-w-[2.5rem]"
                        >
                          {pageNum}
                        </Button>
                      </Link>
                    )
                  })}
                </div>
                {currentPage < totalPages && (
                  <Link href={`/kategori/${slug}?sort=${sort}&page=${currentPage + 1}`}>
                    <Button variant="outline" size="sm">
                      Sonraki
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">Bu kategoride henüz ürün bulunmamaktadır.</p>
            <Link href="/kategoriler">
              <Button>Diğer Kategorilere Göz At</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
