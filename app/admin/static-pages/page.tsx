import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { DeleteStaticPageButton } from '@/components/admin/DeleteStaticPageButton'

export default async function AdminStaticPagesPage() {
  const pages = await prisma.staticPage.findMany({
    orderBy: { slug: 'asc' },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Statik Sayfalar</h1>
        <Link href="/admin/static-pages/yeni">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Sayfa
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {pages.map((page) => (
          <Card key={page.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{page.title}</h3>
                  <p className="text-sm text-gray-600">/{page.slug}</p>
                  <p className="text-sm">
                    <span className={page.isActive ? 'text-green-600' : 'text-red-600'}>
                      {page.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/static-pages/${page.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Düzenle
                    </Button>
                  </Link>
                  <DeleteStaticPageButton pageId={page.id} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

