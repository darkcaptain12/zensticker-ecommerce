import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BannerForm } from '@/components/admin/BannerForm'

const availableBanners = Array.from({ length: 15 }, (_, i) => `/banner/banner${i + 1}.png`)

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const banner = await prisma.banner.findUnique({
    where: { id },
  })

  if (!banner) {
    notFound()
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Banner Düzenle</h1>
      <BannerForm banner={banner} availableBanners={availableBanners} />
    </div>
  )
}
