'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DollarSign, Package, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface BulkProductActionsProps {
  selectedProductIds: string[]
  onSuccess?: () => void
}

export function BulkProductActions({ selectedProductIds, onSuccess }: BulkProductActionsProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<'price' | 'stock' | null>(null)
  const [priceValue, setPriceValue] = useState('')
  const [priceType, setPriceType] = useState<'set' | 'increase' | 'decrease'>('set')
  const [stockValue, setStockValue] = useState('')
  const [stockType, setStockType] = useState<'set' | 'add' | 'subtract'>('set')
  const { toast } = useToast()

  const handleBulkPriceUpdate = async () => {
    if (!priceValue || selectedProductIds.length === 0) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/products/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: selectedProductIds,
          type: 'price',
          value: parseFloat(priceValue),
          operation: priceType,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: `${selectedProductIds.length} ürünün fiyatı güncellendi`,
        })
        setOpen(false)
        setPriceValue('')
        onSuccess?.()
      } else {
        const data = await response.json()
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: data.error || 'Fiyat güncelleme başarısız',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Bir hata oluştu',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkStockUpdate = async () => {
    if (!stockValue || selectedProductIds.length === 0) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/products/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: selectedProductIds,
          type: 'stock',
          value: parseInt(stockValue),
          operation: stockType,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: `${selectedProductIds.length} ürünün stoku güncellendi`,
        })
        setOpen(false)
        setStockValue('')
        onSuccess?.()
      } else {
        const data = await response.json()
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: data.error || 'Stok güncelleme başarısız',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Bir hata oluştu',
      })
    } finally {
      setLoading(false)
    }
  }

  if (selectedProductIds.length === 0) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Toplu İşlem ({selectedProductIds.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Toplu Ürün İşlemleri</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Toplu Fiyat Güncelleme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>İşlem Tipi</Label>
                <select
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="set">Fiyatı Belirle</option>
                  <option value="increase">Fiyatı Artır</option>
                  <option value="decrease">Fiyatı Azalt</option>
                </select>
              </div>
              <div>
                <Label>Tutar (₺)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={priceValue}
                  onChange={(e) => setPriceValue(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <Button
                onClick={handleBulkPriceUpdate}
                disabled={loading || !priceValue}
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Fiyatları Güncelle
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Toplu Stok Güncelleme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>İşlem Tipi</Label>
                <select
                  value={stockType}
                  onChange={(e) => setStockType(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="set">Stoku Belirle</option>
                  <option value="add">Stok Ekle</option>
                  <option value="subtract">Stok Çıkar</option>
                </select>
              </div>
              <div>
                <Label>Miktar</Label>
                <Input
                  type="number"
                  value={stockValue}
                  onChange={(e) => setStockValue(e.target.value)}
                  placeholder="0"
                  min="0"
                />
              </div>
              <Button
                onClick={handleBulkStockUpdate}
                disabled={loading || !stockValue}
                className="w-full"
                variant="outline"
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Stokları Güncelle
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

