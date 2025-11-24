import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ProductTable } from '@/components/admin/ProductTable'

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: { where: { isMain: true }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Ürünler</h1>
          <p className="text-gray-600 mt-2">Tüm ürünleri yönetin ve düzenleyin</p>
        </div>
        <Link href="/admin/urunler/yeni">
          <Button size="lg" className="w-full sm:w-auto">
            <Plus className="h-5 w-5 mr-2" />
            Yeni Ürün
          </Button>
        </Link>
      </div>

      <ProductTable products={products} />
    </div>
  )
}

