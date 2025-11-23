'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Order {
  id: string
  status: string
  shippingCode: string | null
}

export function UpdateOrderStatus({ order }: { order: Order }) {
  const router = useRouter()
  const [status, setStatus] = useState(order.status)
  const [shippingCode, setShippingCode] = useState(order.shippingCode || '')
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, shippingCode }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Güncelleme başarısız')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PENDING">Beklemede</SelectItem>
          <SelectItem value="AWAITING_PAYMENT">Ödeme Bekleniyor</SelectItem>
          <SelectItem value="PAID">Ödendi</SelectItem>
          <SelectItem value="PREPARING">Hazırlanıyor</SelectItem>
          <SelectItem value="SHIPPED">Kargoya Verildi</SelectItem>
          <SelectItem value="DELIVERED">Teslim Edildi</SelectItem>
          <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Input
          placeholder="Kargo Takip No"
          value={shippingCode}
          onChange={(e) => setShippingCode(e.target.value)}
          className="w-48"
        />
        <Button onClick={handleUpdate} disabled={loading} size="sm">
          Güncelle
        </Button>
      </div>
    </div>
  )
}

