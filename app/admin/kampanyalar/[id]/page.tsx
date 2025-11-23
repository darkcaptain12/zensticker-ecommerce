import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CampaignForm } from '@/components/admin/CampaignForm'

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [campaign, categories, products] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id },
      include: {
        categories: true,
        products: true,
        packageProducts: true,
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
      },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!campaign) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Kampanya Düzenle</h1>
      <CampaignForm
        campaign={{
          ...campaign,
          startDate: campaign.startDate.toISOString(),
          endDate: campaign.endDate.toISOString(),
          categoryIds: campaign.categories.map((c) => c.id),
          productIds: campaign.products.map((p) => p.id),
          packageProducts: campaign.packageProducts.map((pp) => ({
            productId: pp.productId,
            quantity: pp.quantity,
          })),
        }}
        categories={categories}
        products={products}
      />
    </div>
  )
}

