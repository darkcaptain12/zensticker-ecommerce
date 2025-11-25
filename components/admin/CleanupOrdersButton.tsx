'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'

export function CleanupOrdersButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCleanup = async () => {
    if (!confirm('Tüm siparişler silinecek ve log dosyasına kaydedilecek. Devam etmek istediğinize emin misiniz?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/cleanup-orders', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        alert(
          `✅ ${data.deletedOrders} sipariş başarıyla silindi!\n\n` +
          `📝 Log dosyası: ${data.logFile}\n` +
          `📁 Konum: /logs/ klasörü`
        )
        router.refresh()
      } else {
        alert(data.error || 'Siparişler temizlenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Cleanup error:', error)
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCleanup}
      disabled={loading}
      variant="destructive"
      size="sm"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Temizleniyor...
        </>
      ) : (
        <>
          <Trash2 className="h-4 w-4 mr-2" />
          Tüm Siparişleri Temizle
        </>
      )}
    </Button>
  )
}

