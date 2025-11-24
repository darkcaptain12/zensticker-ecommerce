'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Truck, ExternalLink, FileText, Package, CheckCircle, Clock, XCircle } from 'lucide-react'
import type { ShipmentStatus } from '@/lib/shipping/types'

interface ShipmentTrackingCardProps {
  trackingNumber: string
  cargoCompany?: string | null
  status?: ShipmentStatus | string | null
  externalTrackingUrl?: string | null
  labelUrl?: string | null
  orderNumber?: string
  customerName?: string
  lastSync?: Date | string | null
}

const statusLabels: Record<string, string> = {
  not_created: 'Etiket Oluşturulmadı',
  label_created: 'Etiket Oluşturuldu',
  in_transit: 'Yolda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi',
}

const statusColors: Record<string, string> = {
  not_created: 'bg-gray-500',
  label_created: 'bg-blue-500',
  in_transit: 'bg-indigo-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
}

const statusIcons: Record<string, any> = {
  not_created: Clock,
  label_created: FileText,
  in_transit: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
}

export function ShipmentTrackingCard({
  trackingNumber,
  cargoCompany = 'DHL',
  status = 'label_created',
  externalTrackingUrl,
  labelUrl,
  orderNumber,
  customerName,
  lastSync,
}: ShipmentTrackingCardProps) {
  const StatusIcon = statusIcons[status as string] || Package
  const statusColor = statusColors[status as string] || 'bg-gray-500'
  const statusLabel = statusLabels[status as string] || status

  // Generate external tracking URL if not provided
  const trackingUrl =
    externalTrackingUrl ||
    `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`

  // Generate label URL if not provided
  const labelUrlFinal = labelUrl || `/api/admin/mock-label/${trackingNumber}`

  return (
    <Card className="border-2">
      <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 mb-2">
              <Truck className="h-5 w-5 text-primary" />
              Kargo Takip Bilgileri
            </CardTitle>
            {orderNumber && (
              <p className="text-sm text-muted-foreground">
                Sipariş No: <span className="font-semibold">{orderNumber}</span>
              </p>
            )}
            {customerName && (
              <p className="text-sm text-muted-foreground">
                Müşteri: <span className="font-semibold">{customerName}</span>
              </p>
            )}
          </div>
          <Badge className={`${statusColor} text-white flex items-center gap-1`}>
            <StatusIcon className="h-3 w-3" />
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Kargo Firması */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Kargo Firması</p>
            <p className="font-semibold text-lg">{cargoCompany || 'DHL'}</p>
          </div>

          {/* Takip Numarası */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Takip Numarası</p>
            <p className="font-mono font-bold text-lg text-blue-700 dark:text-blue-300 break-all">
              {trackingNumber}
            </p>
          </div>

          {/* Durum */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Kargo Durumu</p>
            <div className="flex items-center gap-2">
              <StatusIcon className="h-4 w-4" />
              <span className="font-semibold">{statusLabel}</span>
            </div>
          </div>

          {/* Son Güncelleme */}
          {lastSync && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Son Güncelleme</p>
              <p className="text-sm">
                {new Date(lastSync).toLocaleString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}

          {/* Butonlar */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button
              asChild
              variant="default"
              className="flex-1 min-w-[140px]"
            >
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                DHL'de Takip Et
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 min-w-[140px]"
            >
              <a
                href={labelUrlFinal}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="h-4 w-4 mr-2" />
                Etiketi Gör
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

