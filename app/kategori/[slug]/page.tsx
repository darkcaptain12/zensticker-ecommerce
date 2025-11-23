import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { AddToCartButton } from '@/components/AddToCartButton'

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
  searchParams: Promise<{ sort?: string }>
}) {
  const { slug } = await params
  const { sort } = await searchParams
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
  }

  const products = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      isActive: true,
    },
    include: {
      images: { where: { isMain: true }, take: 1 },
    },
    orderBy,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600">{category.description}</p>
        )}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-gray-600">{products.length} ürün bulundu</p>
        <div className="flex gap-2">
          <Link href={`/kategori/${slug}?sort=new`}>
            <Button variant="outline" size="sm">
              Yeni Eklenenler
            </Button>
          </Link>
          <Link href={`/kategori/${slug}?sort=price-asc`}>
            <Button variant="outline" size="sm">
              Fiyat Artan
            </Button>
          </Link>
          <Link href={`/kategori/${slug}?sort=price-desc`}>
            <Button variant="outline" size="sm">
              Fiyat Azalan
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => {
          const price = product.salePrice || product.price
          const originalPrice = product.salePrice ? product.price : null
          const mainImage = product.images[0]?.url || '/placeholder-product.jpg'

          return (
            <Card key={product.id} className="hover:shadow-lg transition cursor-pointer h-full flex flex-col">
              <Link href={`/urun/${product.slug}`}>
                <div className="relative w-full aspect-square">
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                  {product.salePrice && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      İndirim
                    </span>
                  )}
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
                    }).format(price)}
                  </p>
                  <AddToCartButton product={product} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

