import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { DeleteCampaignButton } from '@/components/admin/DeleteCampaignButton'
import { Badge } from '@/components/ui/badge'

export default async function AdminCampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Kampanyalar</h1>
        <Link href="/admin/kampanyalar/yeni">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Kampanya
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {campaigns.map((campaign) => {
          const now = new Date()
          const isActive = campaign.isActive && 
            new Date(campaign.startDate) <= now && 
            new Date(campaign.endDate) >= now

          return (
            <Card key={campaign.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{campaign.title}</h3>
                      {isActive ? (
                        <Badge className="bg-green-500">Aktif</Badge>
                      ) : (
                        <Badge variant="outline">Pasif</Badge>
                      )}
                    </div>
                    {campaign.description && (
                      <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                    )}
                    <div className="flex gap-4 text-sm">
                      {campaign.discountPercent && (
                        <span className="text-green-600 font-semibold">
                          %{campaign.discountPercent} İndirim
                        </span>
                      )}
                      {campaign.discountAmount && (
                        <span className="text-green-600 font-semibold">
                          {campaign.discountAmount}₺ İndirim
                        </span>
                      )}
                      {campaign.minPurchaseAmount && (
                        <span className="text-gray-600">
                          Min: {campaign.minPurchaseAmount}₺
                        </span>
                      )}
                      <span className="text-gray-600">
                        {campaign._count.products} ürün
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(campaign.startDate).toLocaleDateString('tr-TR')} -{' '}
                      {new Date(campaign.endDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/kampanyalar/${campaign.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeleteCampaignButton campaignId={campaign.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

