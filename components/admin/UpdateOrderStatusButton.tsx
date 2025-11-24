'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Truck, Loader2 } from 'lucide-react'

interface UpdateOrderStatusButtonProps {
  orderId: string
  currentStatus: string
  targetStatus: string
  label: string
}

export function UpdateOrderStatusButton({
  orderId,
  currentStatus,
  targetStatus,
  label,
}: UpdateOrderStatusButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    if (currentStatus === targetStatus) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/orders/bulk-update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: [orderId], status: targetStatus }),
      })

      const data = await response.json()

      if (data.success) {
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

  if (currentStatus === targetStatus) {
    return null
  }

  return (
    <Button
      onClick={handleUpdate}
      disabled={loading}
      variant="outline"
      size="sm"
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Güncelleniyor...
        </>
      ) : (
        <>
          <Truck className="h-4 w-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  )
}

