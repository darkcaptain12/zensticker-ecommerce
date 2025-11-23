import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/admin/ProductForm'

export default async function NewProductPage() {
  const [categories, campaigns] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.campaign.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Yeni Ürün</h1>
      <ProductForm categories={categories} campaigns={campaigns} />
    </div>
  )
}
