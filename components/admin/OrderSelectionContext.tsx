'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface OrderSelectionContextType {
  selectedOrders: Set<string>
  toggleOrder: (orderId: string) => void
  toggleAll: (orderIds: string[]) => void
  clearSelection: () => void
}

const OrderSelectionContext = createContext<OrderSelectionContextType | undefined>(undefined)

export function OrderSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())

  const toggleOrder = (orderId: string) => {
    setSelectedOrders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  const toggleAll = (orderIds: string[]) => {
    setSelectedOrders((prev) => {
      if (prev.size === orderIds.length) {
        return new Set()
      } else {
        return new Set(orderIds)
      }
    })
  }

  const clearSelection = () => {
    setSelectedOrders(new Set())
  }

  return (
    <OrderSelectionContext.Provider
      value={{ selectedOrders, toggleOrder, toggleAll, clearSelection }}
    >
      {children}
    </OrderSelectionContext.Provider>
  )
}

export function useOrderSelection() {
  const context = useContext(OrderSelectionContext)
  if (!context) {
    throw new Error('useOrderSelection must be used within OrderSelectionProvider')
  }
  return context
}

