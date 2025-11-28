'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Edit, Trash2, Search, Filter, Eye, CheckSquare, Square } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { DeleteProductButton } from './DeleteProductButton'
import { BulkProductActions } from './BulkProductActions'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  salePrice?: number | null
  stock: number
  isActive: boolean
  category: {
    name: string
  }
  images: Array<{ url: string }>
}

interface ProductTableProps {
  products: Product[]
}

export function ProductTable({ products: initialProducts }: ProductTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  const filteredProducts = initialProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterActive === 'all' ||
      (filterActive === 'active' && product.isActive) ||
      (filterActive === 'inactive' && !product.isActive)
    return matchesSearch && matchesFilter
  })

  const toggleSelect = (productId: string) => {
    setSelectedIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredProducts.map(p => p.id))
    }
    setSelectAll(!selectAll)
  }

  const handleBulkSuccess = () => {
    setSelectedIds([])
    setSelectAll(false)
    window.location.reload()
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ürün veya kategori ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterActive === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterActive('all')}
              >
                Tümü
              </Button>
              <Button
                variant={filterActive === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterActive('active')}
              >
                Aktif
              </Button>
              <Button
                variant={filterActive === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterActive('inactive')}
              >
                Pasif
              </Button>
            </div>
          </div>
          {selectedIds.length > 0 && (
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedIds.length} ürün seçildi
              </span>
              <BulkProductActions
                selectedProductIds={selectedIds}
                onSuccess={handleBulkSuccess}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Select All Checkbox */}
          <div className="md:col-span-2 lg:col-span-3 flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSelectAll}
              className="flex items-center gap-2"
            >
              {selectAll ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              <span className="text-sm">Tümünü Seç</span>
            </Button>
          </div>
          {filteredProducts.map((product) => {
            const price = product.salePrice || product.price
            return (
              <Card key={product.id} className={`hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 ${
                selectedIds.includes(product.id) ? 'border-primary bg-primary/5' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleSelect(product.id)}
                      className="h-6 w-6"
                    >
                      {selectedIds.includes(product.id) ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          Görsel Yok
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg mb-1 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.category.name}</p>
                      <p className="font-bold text-primary text-lg mb-2">{formatPrice(price)}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant={product.isActive ? 'default' : 'secondary'}>
                          {product.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                        <Badge variant={product.stock > 10 ? 'outline' : 'destructive'}>
                          Stok: {product.stock}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/urun/${product.slug}`} target="_blank">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/urunler/${product.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteProductButton productId={product.id} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-2">
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 text-lg">Ürün bulunamadı</p>
            <p className="text-gray-400 text-sm mt-2">Arama kriterlerinizi değiştirmeyi deneyin</p>
          </CardContent>
        </Card>
      )}

      <div className="text-sm text-gray-600 text-center">
        {filteredProducts.length} ürün gösteriliyor
      </div>
    </div>
  )
}

