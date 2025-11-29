import { prisma } from '@/lib/prisma'
import { Tag } from 'lucide-react'
import { CampaignCard } from '@/components/CampaignCard'

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
      directProducts: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: { where: { isMain: true }, take: 1 },
        },
      },
      packageProducts: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              images: { where: { isMain: true }, take: 1 },
            },
          },
        },
      },
      _count: {
        select: { directProducts: true },
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
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  )
}

