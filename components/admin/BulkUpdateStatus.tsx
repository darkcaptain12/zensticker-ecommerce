'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Truck, Loader2, CheckSquare, Square } from 'lucide-react'
import { useOrderSelection } from './OrderSelectionContext'

interface Order {
  id: string
  orderNumber: string
  status: string
}

interface BulkUpdateStatusProps {
  orders: Order[]
}

const statusLabels: { [key: string]: string } = {
  PENDING: 'Beklemede',
  AWAITING_PAYMENT: 'Ödeme Bekleniyor',
  PAID: 'Ödendi',
  PREPARING: 'Hazırlanıyor',
  SHIPPED: 'Kargoya Verildi',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
}

export function BulkUpdateStatus({ orders }: BulkUpdateStatusProps) {
  const router = useRouter()
  const { selectedOrders, toggleAll, clearSelection } = useOrderSelection()
  const [status, setStatus] = useState('SHIPPED')
  const [loading, setLoading] = useState(false)

  const handleBulkUpdate = async () => {
    if (selectedOrders.size === 0) {
      alert('Lütfen en az bir sipariş seçin')
      return
    }

    const orderIds = Array.from(selectedOrders)
    const statusLabel = statusLabels[status] || status

    if (
      !confirm(
        `${selectedOrders.size} siparişin durumu "${statusLabel}" olarak güncellenecek. Devam etmek istiyor musunuz?`
      )
    ) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/orders/bulk-update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds, status }),
      })

      const data = await response.json()

      if (data.success) {
        alert(
          `${data.updated} siparişin durumu başarıyla "${statusLabel}" olarak güncellendi!`
        )
        clearSelection()
        router.refresh()
      } else {
        alert(data.error || 'Durum güncellenirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground mb-1">
            Toplu Durum Güncelle
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedOrders.size} sipariş seçildi
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PREPARING">Hazırlanıyor</SelectItem>
              <SelectItem value="SHIPPED">Kargoya Verildi</SelectItem>
              <SelectItem value="DELIVERED">Teslim Edildi</SelectItem>
              <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => toggleAll(orders.map((o) => o.id))}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            {selectedOrders.size === orders.length ? (
              <>
                <CheckSquare className="h-4 w-4 mr-2" />
                Tümünü Kaldır
              </>
            ) : (
              <>
                <Square className="h-4 w-4 mr-2" />
                Tümünü Seç
              </>
            )}
          </Button>
          <Button
            onClick={handleBulkUpdate}
            disabled={loading || selectedOrders.size === 0}
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Güncelleniyor...
              </>
            ) : (
              <>
                <Truck className="h-4 w-4 mr-2" />
                Durumu Güncelle
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

