import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductCard } from '@/components/ProductCard'
import { Breadcrumb } from '@/components/Breadcrumb'
import { Heart } from 'lucide-react'

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/giris')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      favorites: {
        include: {
          product: {
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
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!user) {
    redirect('/giris')
  }

  const calculatePrice = (product: any) => {
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

    return { finalPrice, originalPrice, hasCampaign }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Profil', href: '/profil' },
          { label: 'Favorilerim' },
        ]}
      />
      
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-8 w-8 text-red-500" />
        <h1 className="text-3xl font-bold">Favorilerim</h1>
      </div>

      {user.favorites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-4">Henüz favori ürününüz bulunmamaktadır.</p>
            <a href="/kategoriler" className="text-primary hover:underline">
              Ürünleri keşfetmek için tıklayın
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {user.favorites.map((favorite) => {
            const { finalPrice, originalPrice, hasCampaign } = calculatePrice(favorite.product)
            return (
              <ProductCard
                key={favorite.id}
                product={{
                  id: favorite.product.id,
                  name: favorite.product.name,
                  slug: favorite.product.slug,
                  price: favorite.product.price,
                  salePrice: favorite.product.salePrice,
                  images: favorite.product.images,
                  stock: favorite.product.stock,
                }}
                finalPrice={finalPrice}
                originalPrice={originalPrice}
                hasCampaign={hasCampaign}
                hasSale={!!favorite.product.salePrice}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

