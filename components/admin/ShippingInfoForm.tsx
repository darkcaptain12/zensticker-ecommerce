'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Truck } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ShippingInfoFormProps {
  orderId: string
  currentCarrier?: string | null
  currentTrackingNumber?: string | null
}

export function ShippingInfoForm({
  orderId,
  currentCarrier,
  currentTrackingNumber,
}: ShippingInfoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [shippingCarrier, setShippingCarrier] = useState(currentCarrier || '')
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!shippingCarrier || !trackingNumber) {
      alert('Lütfen kargo firması ve takip numarasını girin')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/shipping`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingCarrier,
          trackingNumber: trackingNumber.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Kargo bilgileri başarıyla güncellendi!')
        router.refresh()
      } else {
        alert(data.error || 'Kargo bilgileri güncellenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Shipping info update error:', error)
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="shippingCarrier">Kargo Firması</Label>
        <Select
          value={shippingCarrier}
          onValueChange={setShippingCarrier}
          disabled={loading}
        >
          <SelectTrigger id="shippingCarrier" className="w-full">
            <SelectValue placeholder="Kargo firması seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yurtici">Yurtiçi Kargo</SelectItem>
            <SelectItem value="aras">Aras Kargo</SelectItem>
            <SelectItem value="mng">MNG Kargo</SelectItem>
            <SelectItem value="surat">Sürat Kargo</SelectItem>
            <SelectItem value="ptt">PTT Kargo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="trackingNumber">Takip Numarası</Label>
        <Input
          id="trackingNumber"
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Takip numarasını girin"
          disabled={loading}
          required
        />
      </div>

      <Button
        type="submit"
        disabled={loading || !shippingCarrier || !trackingNumber}
        className="w-full"
        size="sm"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Kaydediliyor...
          </>
        ) : (
          <>
            <Truck className="h-4 w-4 mr-2" />
            Kargo Bilgilerini Kaydet
          </>
        )}
      </Button>
    </form>
  )
}

