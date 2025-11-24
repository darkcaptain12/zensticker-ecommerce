'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FileText, Loader2 } from 'lucide-react'

interface CreateLabelButtonProps {
  orderId: string
  orderNumber: string
  hasTrackingNumber: boolean
}

export function CreateLabelButton({
  orderId,
  orderNumber,
  hasTrackingNumber,
}: CreateLabelButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCreateLabel = async () => {
    if (hasTrackingNumber) {
      if (confirm('Bu sipariş için zaten bir takip numarası var. Yeni etiket oluşturmak istediğinizden emin misiniz?')) {
        return
      }
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/create-label`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        alert(`DHL etiketi başarıyla oluşturuldu!\nTakip Numarası: ${data.shipment.trackingNumber}`)
        router.refresh()
      } else {
        alert(data.error || 'Etiket oluşturulurken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCreateLabel}
      disabled={loading}
      variant="outline"
      size="sm"
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Oluşturuluyor...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 mr-2" />
          DHL Etiketi Oluştur
        </>
      )}
    </Button>
  )
}

