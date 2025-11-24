'use client'

import { useOrderSelection } from './OrderSelectionContext'
import { CheckSquare, Square } from 'lucide-react'

interface OrderCheckboxProps {
  orderId: string
}

export function OrderCheckbox({ orderId }: OrderCheckboxProps) {
  const { selectedOrders, toggleOrder } = useOrderSelection()
  const isSelected = selectedOrders.has(orderId)

  return (
    <button
      type="button"
      onClick={() => toggleOrder(orderId)}
      className="flex items-center justify-center w-5 h-5 border-2 rounded border-gray-300 hover:border-primary transition-colors"
      aria-label={isSelected ? 'Seçimi kaldır' : 'Seç'}
    >
      {isSelected ? (
        <CheckSquare className="h-4 w-4 text-primary" />
      ) : (
        <Square className="h-4 w-4 text-gray-400" />
      )}
    </button>
  )
}

