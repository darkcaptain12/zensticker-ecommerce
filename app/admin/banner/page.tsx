import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Edit } from 'lucide-react'
import Image from 'next/image'
import { DeleteBannerButton } from '@/components/admin/DeleteBannerButton'

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { position: 'asc' },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Bannerlar</h1>
        <Link href="/admin/banner/yeni">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Banner
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((banner) => (
          <Card key={banner.id}>
            <CardContent className="p-4">
              <div className="relative w-full h-48 mb-4">
                <Image
                  src={banner.filePath}
                  alt={banner.title}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <h3 className="font-semibold mb-2">{banner.title}</h3>
              <p className="text-sm text-gray-600 mb-2">
                Tip: {banner.type} | Pozisyon: {banner.position}
              </p>
              {banner.linkUrl && (
                <p className="text-sm text-gray-600 mb-2">Link: {banner.linkUrl}</p>
              )}
              <p className="text-sm mb-4">
                <span className={banner.isActive ? 'text-green-600' : 'text-red-600'}>
                  {banner.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </p>
              <div className="flex gap-2">
                <Link href={`/admin/banner/${banner.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                </Link>
                <DeleteBannerButton bannerId={banner.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

