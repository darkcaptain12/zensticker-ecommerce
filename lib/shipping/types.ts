/**
 * Shipping module types
 * Ready for future DHL API integration
 */

export type ShipmentStatus =
  | 'not_created'
  | 'label_created'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'

export interface ShipmentInfo {
  trackingNumber: string
  cargoCompany: string
  status: ShipmentStatus
  labelUrl: string
  externalTrackingUrl?: string
  orderNumber: string
  customerName: string
  createdAt: Date
  lastSync?: Date
}

export interface CreateShipmentResponse {
  success: boolean
  shipment: ShipmentInfo
  error?: string
}

export interface BulkCreateShipmentResponse {
  success: boolean
  shipments: ShipmentInfo[]
  errors?: Array<{ orderId: string; error: string }>
}

export interface ShipmentStatusResponse {
  success: boolean
  status: ShipmentStatus
  trackingNumber: string
  lastSync: Date
  error?: string
}

