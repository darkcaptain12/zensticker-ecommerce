import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { Package, Tag } from 'lucide-react'

export const metadata = {
  title: 'Kampanyalar | Zen Sticker',
  description: 'Tüm kampanyalarımızı keşfedin',
}

export default async function CampaignsPage() {
  const now = new Date()
  const campaigns = await prisma.campaign.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      categories: true,
      products: {
        include: {
          images: { where: { isMain: true }, take: 1 },
        },
      },
      packageProducts: {
        include: {
          product: {
            include: {
              images: { where: { isMain: true }, take: 1 },
            },
          },
        },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Kampanyalar</h1>

      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="h-24 w-24 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Şu anda aktif kampanya bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            // Calculate total package value if it's a package
            let packageTotalValue = 0
            if (campaign.type === 'PACKAGE' && campaign.packageProducts.length > 0) {
              packageTotalValue = campaign.packageProducts.reduce((sum, pp) => {
                return sum + (pp.product.price * pp.quantity)
              }, 0)
            }

            return (
              <Card key={campaign.id} className="hover:shadow-lg transition cursor-pointer h-full flex flex-col">
                {campaign.imageUrl && (
                  <div className="relative w-full h-48">
                    <Image
                      src={campaign.imageUrl}
                      alt={campaign.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                )}
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold">{campaign.title}</h2>
                      <Badge className="bg-red-500">Kampanya</Badge>
                    </div>
                    {campaign.description && (
                      <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                    )}
                  </div>

                  <div className="mt-auto space-y-2">
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

                    {campaign.type === 'PRODUCT' && campaign.products.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <p className="font-semibold">{campaign.products.length} ürün</p>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(campaign.startDate).toLocaleDateString('tr-TR')} -{' '}
                      {new Date(campaign.endDate).toLocaleDateString('tr-TR')}
                    </p>
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

