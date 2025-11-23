import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { StaticPageForm } from '@/components/admin/StaticPageForm'

export default async function EditStaticPagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const page = await prisma.staticPage.findUnique({
    where: { id },
  })

  if (!page) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Statik Sayfa Düzenle</h1>
      <StaticPageForm page={page} />
    </div>
  )
}

