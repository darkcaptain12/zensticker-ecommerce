import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { DeleteProductButton } from '@/components/admin/DeleteProductButton'

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: { where: { isMain: true }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Ürünler</h1>
        <Link href="/admin/urunler/yeni">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Ürün
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {products.map((product) => {
          const price = product.salePrice || product.price
          return (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                    {product.images[0] && (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.category.name}</p>
                    <p className="font-semibold text-primary">{formatPrice(price)}</p>
                    <p className="text-sm">
                      Stok: {product.stock} |{' '}
                      <span className={product.isActive ? 'text-green-600' : 'text-red-600'}>
                        {product.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/urunler/${product.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeleteProductButton productId={product.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

