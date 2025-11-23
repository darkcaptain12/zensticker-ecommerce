import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CategoryForm } from '@/components/admin/CategoryForm'

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const category = await prisma.category.findUnique({
    where: { id },
  })

  if (!category) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Kategori Düzenle</h1>
      <CategoryForm category={category} />
    </div>
  )
}
