'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Filter, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface ProductFiltersProps {
  onFilterChange?: (filters: FilterState) => void
}

interface FilterState {
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  onSale?: boolean
}

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    inStock: searchParams.get('inStock') === 'true',
    onSale: searchParams.get('onSale') === 'true',
  })

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (filters.minPrice) {
      params.set('minPrice', filters.minPrice.toString())
    } else {
      params.delete('minPrice')
    }
    
    if (filters.maxPrice) {
      params.set('maxPrice', filters.maxPrice.toString())
    } else {
      params.delete('maxPrice')
    }
    
    if (filters.inStock) {
      params.set('inStock', 'true')
    } else {
      params.delete('inStock')
    }
    
    if (filters.onSale) {
      params.set('onSale', 'true')
    } else {
      params.delete('onSale')
    }
    
    params.set('page', '1') // Reset to first page
    
    router.push(`?${params.toString()}`)
    setIsOpen(false)
    onFilterChange?.(filters)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('minPrice')
    params.delete('maxPrice')
    params.delete('inStock')
    params.delete('onSale')
    params.set('page', '1')
    
    setFilters({})
    router.push(`?${params.toString()}`)
    setIsOpen(false)
    onFilterChange?.({})
  }

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.inStock || filters.onSale

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="relative"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filtrele
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
            !
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute top-full left-0 mt-2 w-80 z-50 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Filtrele</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Fiyat Aralığı</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, minPrice: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Stok Durumu</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={filters.inStock || false}
                    onChange={(e) =>
                      setFilters({ ...filters, inStock: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="inStock" className="cursor-pointer">
                    Sadece stokta olanlar
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>İndirim</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="onSale"
                    checked={filters.onSale || false}
                    onChange={(e) =>
                      setFilters({ ...filters, onSale: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="onSale" className="cursor-pointer">
                    Sadece indirimli ürünler
                  </Label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={applyFilters} className="flex-1">
                  Uygula
                </Button>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    Temizle
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

