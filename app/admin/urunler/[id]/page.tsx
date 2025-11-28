import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/admin/ProductForm'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, categories, campaigns] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }],
        },
        variants: {
          orderBy: { createdAt: 'asc' },
        },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.campaign.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Ürün Düzenle</h1>
      <ProductForm product={product} categories={categories} campaigns={campaigns} />
    </div>
  )
}
