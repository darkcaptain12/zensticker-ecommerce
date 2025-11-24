'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FileText, Loader2, CheckSquare, Square } from 'lucide-react'
import { useOrderSelection } from './OrderSelectionContext'

interface Order {
  id: string
  orderNumber: string
  cargoTrackingNo: string | null
}

interface BulkCreateLabelsProps {
  orders: Order[]
}

export function BulkCreateLabels({ orders }: BulkCreateLabelsProps) {
  const router = useRouter()
  const { selectedOrders, toggleAll, clearSelection } = useOrderSelection()
  const [loading, setLoading] = useState(false)

  const handleBulkCreate = async () => {
    if (selectedOrders.size === 0) {
      alert('Lütfen en az bir sipariş seçin')
      return
    }

    const orderIds = Array.from(selectedOrders)
    const ordersWithoutTracking = orders.filter(
      (o) => selectedOrders.has(o.id) && !o.cargoTrackingNo
    )

    if (ordersWithoutTracking.length === 0) {
      alert('Seçilen siparişlerin hepsinde zaten takip numarası var')
      return
    }

    if (
      !confirm(
        `${ordersWithoutTracking.length} sipariş için DHL etiketi oluşturulacak. Devam etmek istiyor musunuz?`
      )
    ) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/orders/bulk-create-labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: Array.from(selectedOrders) }),
      })

      const data = await response.json()

      if (data.success && data.shipments && data.shipments.length > 0) {
        // Get all tracking numbers from created shipments
        const trackingNumbers = data.shipments
          .map((s: any) => s.trackingNumber)
          .filter(Boolean)
          .join(',')

        if (trackingNumbers) {
          // Open combined PDF in new tab - it will auto-print
          const pdfUrl = `/api/admin/orders/bulk-label-pdf?trackingNumbers=${encodeURIComponent(trackingNumbers)}`
          const printWindow = window.open(pdfUrl, '_blank')
          
          // Show success message
          alert(
            `${data.shipments.length} sipariş için DHL etiketi başarıyla oluşturuldu!\n\nBirleşik etiket dosyası yeni sekmede açılıyor ve otomatik yazdırma penceresi açılacak.`
          )
        } else {
          alert(
            `${data.shipments.length} sipariş için DHL etiketi başarıyla oluşturuldu!`
          )
        }

        clearSelection()
        router.refresh()
      } else {
        alert(
          data.error ||
            `Bazı etiketler oluşturulamadı. ${data.errors?.length || 0} hata.`
        )
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
            Toplu DHL Etiketi Oluştur
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedOrders.size} sipariş seçildi
          </p>
        </div>
        <div className="flex gap-2">
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
            onClick={handleBulkCreate}
            disabled={loading || selectedOrders.size === 0}
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Toplu Etiket Oluştur
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

