import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Edit } from 'lucide-react'
import { DeleteCategoryButton } from '@/components/admin/DeleteCategoryButton'

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Kategoriler</h1>
        <Link href="/admin/kategoriler/yeni">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Kategori
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{category.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{category.slug}</p>
              <p className="text-sm mb-4">
                <span className={category.isActive ? 'text-green-600' : 'text-red-600'}>
                  {category.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </p>
              <div className="flex gap-2">
                <Link href={`/admin/kategoriler/${category.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                </Link>
                <DeleteCategoryButton categoryId={category.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

