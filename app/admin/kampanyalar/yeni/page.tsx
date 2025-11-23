import { prisma } from '@/lib/prisma'
import { CampaignForm } from '@/components/admin/CampaignForm'

export default async function NewCampaignPage() {
  const [categories, products] = await Promise.all([
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Yeni Kampanya</h1>
      <CampaignForm categories={categories} products={products} />
    </div>
  )
}

